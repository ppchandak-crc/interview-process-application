import os
import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from app.config.database import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantResponse, ParticipantUpdate

router = APIRouter(prefix="/participants", tags=["Participants"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload(file: UploadFile, subfolder: str) -> str:
    folder = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(folder, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    return f"{subfolder}/{filename}"

def generate_registration_id(db: Session) -> str:
    count = db.query(Participant).count() + 1
    return f"REG-{date.today().year}-{str(count).zfill(5)}"

from fastapi import Request

# --- Public: Submit Registration ---
@router.post("/register", response_model=ParticipantResponse)
async def register_participant(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    
    activity_id = form_data.get("activity_id")
    if not activity_id:
        raise HTTPException(status_code=400, detail="activity_id is required")
        
    activity_id = int(activity_id)
    reg_id = generate_registration_id(db)
    
    responses = {}
    for key, value in form_data.items():
        if key == "activity_id":
            continue
            
        if isinstance(value, UploadFile):
            # Save the file
            path = save_upload(value, "uploads")
            responses[key] = path
        else:
            responses[key] = value
            
    participant = Participant(
        registration_id=reg_id,
        activity_id=activity_id,
        responses=responses,
        status="Registered",
    )
    
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    # Return mapping for frontend
    return {
        "id": participant.id,
        "registration_id": participant.registration_id,
        "activity_id": participant.activity_id,
        "responses": participant.responses,
        "status": participant.status
    }

# --- Admin: List All ---
@router.get("/", response_model=List[ParticipantResponse])
def list_participants(activity_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Participant)
    if activity_id:
        query = query.filter(Participant.activity_id == activity_id)
    return query.order_by(Participant.id.desc()).all()

# --- Admin: Get One ---
@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(participant_id: int, db: Session = Depends(get_db)):
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p

# --- Admin: Update ---
@router.put("/{participant_id}")
def update_participant(participant_id: int, data: dict, db: Session = Depends(get_db)):
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    if "status" in data:
        p.status = data["status"]
        
    if "responses" in data:
        # Merge new responses with existing
        p.responses = {**p.responses, **data["responses"]}
        
    db.commit()
    db.refresh(p)
    return {
        "id": p.id,
        "registration_id": p.registration_id,
        "activity_id": p.activity_id,
        "responses": p.responses,
        "status": p.status
    }

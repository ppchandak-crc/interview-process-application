"""
Participants API — registration, search, filters, WhatsApp verification, final status.
"""

import os
import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.config.database import get_db
from app.models.participant import Participant
from app.models.activity import Activity
from app.models.user import User
from app.schemas.participant import ParticipantResponse, FinalStatusUpdate, WhatsAppVerification
from app.auth.dependencies import get_current_user, require_role
from app.utils.exceptions import compute_exceptions, extract_queryable_fields
from app.utils.audit import log_action
from starlette.datastructures import UploadFile as StarletteUploadFile

router = APIRouter(prefix="/participants", tags=["Participants"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


from app.config.settings import get_settings

def save_upload(file, subfolder: str) -> str:
    settings = get_settings()
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = f"{subfolder}/{filename}"
    
    file_data = file.file.read()
    
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            from supabase import create_client, Client
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Upload to Supabase 'avatars' bucket
            supabase.storage.from_("avatars").upload(
                path=path,
                file=file_data,
                file_options={"content-type": file.content_type or "application/octet-stream"}
            )
            
            # Return the public URL so the frontend can load it perfectly
            return supabase.storage.from_("avatars").get_public_url(path)
        except Exception as e:
            print(f"Supabase upload failed: {e}")
            # Fallback to local disk
            
    # Local disk fallback
    folder = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(file_data)
    return path


def generate_registration_id(db: Session, activity_id: int) -> str:
    count = db.query(Participant).filter(Participant.activity_id == activity_id).count() + 1
    return f"PIV-{date.today().year}-{str(count).zfill(5)}"


# ─── Public: Submit Registration ────────────────────────────

@router.post("/register", response_model=ParticipantResponse)
async def register_participant(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()

    activity_id_str = form_data.get("activity_id")
    if not activity_id_str:
        raise HTTPException(status_code=400, detail="activity_id is required")

    activity_id = int(activity_id_str)

    # Validate activity exists and registration is open
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if activity.status != "Registration Open":
        raise HTTPException(status_code=400, detail="Registration is not open for this activity")

    # Check max registrations
    current_count = db.query(Participant).filter(Participant.activity_id == activity_id).count()
    if current_count >= activity.maximum_registrations:
        raise HTTPException(status_code=400, detail="Maximum registrations reached for this activity")

    reg_id = generate_registration_id(db, activity_id)

    responses = {}
    for key, value in form_data.items():
        if key == "activity_id":
            continue
        if isinstance(value, StarletteUploadFile):
            if value.filename:
                path = save_upload(value, "uploads")
                responses[key] = path
        else:
            responses[key] = value

    # Compute queryable fields and exceptions
    fields = extract_queryable_fields(responses)
    exceptions = compute_exceptions(responses, minimum_age=activity.minimum_age, safety_shoes_required=activity.safety_shoes_required)

    participant = Participant(
        registration_id=reg_id,
        activity_id=activity_id,
        responses=responses,
        status="Registered",
        final_status="Registered",
        exceptions=exceptions,
        **fields,
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


# ─── Admin: List with filters ──────────────────────────────

@router.get("/", response_model=List[ParticipantResponse])
def list_participants(
    activity_id: Optional[int] = None,
    college: Optional[str] = None,
    stream: Optional[str] = None,
    year: Optional[str] = None,
    prev_experience: Optional[str] = None,
    parent_permission: Optional[str] = None,
    safety_shoes: Optional[str] = None,
    availability: Optional[str] = None,
    has_exceptions: Optional[bool] = None,
    final_status: Optional[str] = None,
    exception_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Participant)

    if activity_id:
        query = query.filter(Participant.activity_id == activity_id)
    if college:
        query = query.filter(Participant.college == college)
    if stream:
        query = query.filter(Participant.stream == stream)
    if year:
        query = query.filter(Participant.education_year == year)
    if prev_experience:
        query = query.filter(Participant.prev_experience_crc == prev_experience)
    if parent_permission:
        query = query.filter(Participant.parent_permission == parent_permission)
    if safety_shoes:
        query = query.filter(Participant.safety_shoes == safety_shoes)
    if availability:
        query = query.filter(Participant.availability == availability)
    if final_status:
        query = query.filter(Participant.final_status == final_status)
    if has_exceptions is True:
        query = query.filter(Participant.exceptions != None, Participant.exceptions != "[]")
    if has_exceptions is False:
        query = query.filter(or_(Participant.exceptions == None, Participant.exceptions == "[]"))

    # Search across multiple fields
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Participant.registration_id.ilike(search_term),
                Participant.name.ilike(search_term),
                Participant.whatsapp_number.ilike(search_term),
                Participant.parent_mobile.ilike(search_term),
                Participant.college.ilike(search_term),
                Participant.friend_name.ilike(search_term),
            )
        )

    return query.order_by(Participant.id.desc()).all()


# ─── Admin: Get One ────────────────────────────────────────

@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(participant_id: int, db: Session = Depends(get_db)):
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p


# ─── Admin: Update responses/status ────────────────────────

@router.put("/{participant_id}")
def update_participant(
    participant_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    old_status = p.status

    if "status" in data:
        p.status = data["status"]

    if "responses" in data:
        p.responses = {**p.responses, **data["responses"]}

        # Recompute queryable fields and exceptions
        activity = db.query(Activity).filter(Activity.id == p.activity_id).first()
        min_age = activity.minimum_age if activity else 18
        shoes_req = activity.safety_shoes_required if activity else False

        fields = extract_queryable_fields(p.responses)
        for k, v in fields.items():
            setattr(p, k, v)
        p.exceptions = compute_exceptions(p.responses, minimum_age=min_age, safety_shoes_required=shoes_req)

    if old_status != p.status:
        log_action(
            db,
            action="status_change",
            user_id=current_user.id,
            user_name=current_user.name,
            entity_type="participant",
            entity_id=participant_id,
            details={"old_status": old_status, "new_status": p.status},
        )

    db.commit()
    db.refresh(p)
    return {
        "id": p.id,
        "registration_id": p.registration_id,
        "activity_id": p.activity_id,
        "responses": p.responses,
        "status": p.status,
        "final_status": p.final_status,
    }


# ─── Admin: WhatsApp Verification ──────────────────────────

@router.put("/{participant_id}/verify-whatsapp")
def verify_whatsapp(
    participant_id: int,
    data: WhatsAppVerification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    p.whatsapp_verified = data.verified
    p.whatsapp_verification_note = data.note

    # Update WhatsApp-related exceptions
    if data.verified:
        if p.exceptions and "WhatsApp Proof Verification Pending" in p.exceptions:
            p.exceptions = [e for e in p.exceptions if e != "WhatsApp Proof Verification Pending"]

    log_action(
        db,
        action="whatsapp_verification",
        user_id=current_user.id,
        user_name=current_user.name,
        entity_type="participant",
        entity_id=participant_id,
        details={"verified": data.verified, "note": data.note},
    )

    db.commit()
    return {"status": "updated", "whatsapp_verified": p.whatsapp_verified}


# ─── Admin: Final Status Change ────────────────────────────

VALID_FINAL_STATUSES = [
    "Registered", "Interview Pending", "Interview Completed",
    "Selected", "Waitlisted", "Not Selected", "Confirmed", "Cancelled",
]


@router.put("/{participant_id}/final-status")
def update_final_status(
    participant_id: int,
    data: FinalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    if data.final_status not in VALID_FINAL_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_FINAL_STATUSES}")

    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    old_status = p.final_status
    p.final_status = data.final_status

    log_action(
        db,
        action="selection_change",
        user_id=current_user.id,
        user_name=current_user.name,
        entity_type="participant",
        entity_id=participant_id,
        details={"old_status": old_status, "new_status": data.final_status},
    )

    db.commit()
    return {"status": "updated", "final_status": p.final_status}

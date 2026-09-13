"""
Interview CRUD API with concurrent lock mechanism.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.interview import Interview
from app.models.participant import Participant
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.auth.dependencies import get_current_user
from app.utils.audit import log_action

router = APIRouter(prefix="/interviews", tags=["Interviews"])

LOCK_TIMEOUT_MINUTES = 30


@router.post("/", response_model=InterviewResponse)
def create_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a new interview for a participant."""
    # Check participant exists
    participant = db.query(Participant).filter(Participant.id == data.participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Check no existing interview
    existing = db.query(Interview).filter(Interview.participant_id == data.participant_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Interview already exists for this participant. Use PUT to update.")

    # Check lock
    _check_lock(db, data.participant_id, current_user)

    interview = Interview(
        participant_id=data.participant_id,
        interviewer_id=current_user.id,
        work_allocation=data.work_allocation,
        work_allocation_other=data.work_allocation_other,
        overall_assessment=data.overall_assessment,
        recommendation=data.recommendation,
        remarks=data.remarks,
    )
    db.add(interview)

    # Update participant status
    participant.status = "Interview Completed"
    participant.final_status = "Interview Completed"

    log_action(
        db,
        action="interview_saved",
        user_id=current_user.id,
        user_name=current_user.name,
        entity_type="participant",
        entity_id=data.participant_id,
        details={
            "work_allocation": data.work_allocation,
            "assessment": data.overall_assessment,
            "recommendation": data.recommendation,
        },
    )

    # Release lock
    _release_lock(db, data.participant_id)

    db.commit()
    db.refresh(interview)

    return _to_response(interview, db)


@router.put("/{participant_id}", response_model=InterviewResponse)
def update_interview(
    participant_id: int,
    data: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing interview."""
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found for this participant")

    # Check lock
    _check_lock(db, participant_id, current_user)

    if data.work_allocation is not None:
        interview.work_allocation = data.work_allocation
    if data.work_allocation_other is not None:
        interview.work_allocation_other = data.work_allocation_other
    if data.overall_assessment is not None:
        interview.overall_assessment = data.overall_assessment
    if data.recommendation is not None:
        interview.recommendation = data.recommendation
    if data.remarks is not None:
        interview.remarks = data.remarks

    log_action(
        db,
        action="interview_updated",
        user_id=current_user.id,
        user_name=current_user.name,
        entity_type="participant",
        entity_id=participant_id,
        details=data.model_dump(exclude_none=True),
    )

    db.commit()
    db.refresh(interview)
    return _to_response(interview, db)


@router.get("/{participant_id}", response_model=InterviewResponse)
def get_interview(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get interview for a participant."""
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="No interview found for this participant")
    return _to_response(interview, db)


# --- Concurrent Lock ---

@router.post("/lock/{participant_id}")
def acquire_lock(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lock a participant for interview by the current user."""
    # Check for existing active lock
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if interview and interview.locked_by:
        if interview.locked_by != current_user.id:
            # Check if expired
            if interview.locked_at and (datetime.utcnow() - interview.locked_at) < timedelta(minutes=LOCK_TIMEOUT_MINUTES):
                locker = db.query(User).filter(User.id == interview.locked_by).first()
                locker_name = locker.name if locker else "another user"
                raise HTTPException(
                    status_code=409,
                    detail=f"Interview in progress by {locker_name}",
                )
            # Lock expired, reassign

    # If no Interview row yet, we store the lock temporarily by creating a stub
    if not interview:
        interview = Interview(
            participant_id=participant_id,
            interviewer_id=current_user.id,
        )
        db.add(interview)

    interview.locked_by = current_user.id
    interview.locked_at = datetime.utcnow()
    db.commit()

    return {"status": "locked", "locked_by": current_user.name}


@router.delete("/lock/{participant_id}")
def release_lock(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Release a lock on a participant. Admin can override."""
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if not interview:
        return {"status": "no_lock"}

    # Only the locker or an admin/super_admin can release
    if interview.locked_by != current_user.id and current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only the lock owner or admin can release")

    interview.locked_by = None
    interview.locked_at = None
    db.commit()

    return {"status": "released"}


# --- Helpers ---

def _check_lock(db: Session, participant_id: int, current_user: User):
    """Check if participant is locked by someone else."""
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if interview and interview.locked_by and interview.locked_by != current_user.id:
        if interview.locked_at and (datetime.utcnow() - interview.locked_at) < timedelta(minutes=LOCK_TIMEOUT_MINUTES):
            locker = db.query(User).filter(User.id == interview.locked_by).first()
            locker_name = locker.name if locker else "another user"
            raise HTTPException(
                status_code=409,
                detail=f"Interview in progress by {locker_name}",
            )


def _release_lock(db: Session, participant_id: int):
    """Clear lock fields."""
    interview = db.query(Interview).filter(Interview.participant_id == participant_id).first()
    if interview:
        interview.locked_by = None
        interview.locked_at = None


def _to_response(interview: Interview, db: Session) -> dict:
    """Convert Interview model to response dict with interviewer name."""
    interviewer = db.query(User).filter(User.id == interview.interviewer_id).first()
    return {
        "id": interview.id,
        "participant_id": interview.participant_id,
        "interviewer_id": interview.interviewer_id,
        "interviewer_name": interviewer.name if interviewer else None,
        "work_allocation": interview.work_allocation,
        "work_allocation_other": interview.work_allocation_other,
        "overall_assessment": interview.overall_assessment,
        "recommendation": interview.recommendation,
        "remarks": interview.remarks,
        "locked_by": interview.locked_by,
        "locked_at": interview.locked_at,
        "created_at": interview.created_at,
        "updated_at": interview.updated_at,
    }

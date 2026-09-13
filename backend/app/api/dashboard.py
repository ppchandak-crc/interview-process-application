"""
Dashboard aggregation API.

Provides all statistics for the admin dashboard, scoped by activity_id.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.database import get_db
from app.models.participant import Participant
from app.models.interview import Interview
from app.models.activity import Activity
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats/{activity_id}")
def get_dashboard_stats(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Main dashboard statistics for an activity."""

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    participants = db.query(Participant).filter(Participant.activity_id == activity_id).all()
    total = len(participants)

    # Registration overview
    with_exceptions = sum(1 for p in participants if p.exceptions and len(p.exceptions) > 0)
    clear_records = total - with_exceptions
    prev_experience = sum(1 for p in participants if p.prev_experience_crc and p.prev_experience_crc.lower() == "yes")
    fully_available = sum(1 for p in participants if p.availability and p.availability.lower() == "yes")
    parent_yes = sum(1 for p in participants if p.parent_permission and p.parent_permission.lower() == "yes")
    shoes_yes = sum(1 for p in participants if p.safety_shoes and p.safety_shoes.lower() in ("yes", "already have"))

    # Exception breakdown
    exception_counts = {}
    for p in participants:
        if p.exceptions:
            for exc in p.exceptions:
                exception_counts[exc] = exception_counts.get(exc, 0) + 1
    total_exception_instances = sum(exception_counts.values())

    # WhatsApp control
    wa_entered = sum(1 for p in participants if p.whatsapp_number)
    wa_proof_uploaded = sum(1 for p in participants if p.responses and p.responses.get("whatsapp_proof"))
    wa_verified = sum(1 for p in participants if p.whatsapp_verified)
    wa_mismatch = exception_counts.get("WhatsApp Numbers Do Not Match", 0)
    wa_proof_missing = exception_counts.get("WhatsApp Proof Missing", 0)
    wa_pending = wa_proof_uploaded - wa_verified

    # College-wise
    college_data = {}
    for p in participants:
        c = p.college or "Unknown"
        if c not in college_data:
            college_data[c] = {"registered": 0, "prev_experience": 0, "fully_available": 0, "exceptions": 0}
        college_data[c]["registered"] += 1
        if p.prev_experience_crc and p.prev_experience_crc.lower() == "yes":
            college_data[c]["prev_experience"] += 1
        if p.availability and p.availability.lower() == "yes":
            college_data[c]["fully_available"] += 1
        if p.exceptions and len(p.exceptions) > 0:
            college_data[c]["exceptions"] += 1

    # Stream-wise
    stream_counts = {}
    for p in participants:
        s = p.stream or "Unknown"
        stream_counts[s] = stream_counts.get(s, 0) + 1

    # Year-wise
    year_counts = {}
    for p in participants:
        y = p.education_year or "Unknown"
        year_counts[y] = year_counts.get(y, 0) + 1

    # Experience
    exp_crc_yes = sum(1 for p in participants if p.prev_experience_crc and p.prev_experience_crc.lower() == "yes")
    exp_crc_no = total - exp_crc_yes
    exp_other_yes = sum(1 for p in participants if p.prev_experience_other and p.prev_experience_other.lower() == "yes")
    exp_other_no = total - exp_other_yes

    # Readiness
    readiness = {
        "parent_permission": {"yes": parent_yes, "no": total - parent_yes},
        "safety_shoes": {"yes": shoes_yes, "no": total - shoes_yes},
        "complete_availability": {"yes": fully_available, "no": total - fully_available},
        "prev_experience_crc": {"yes": exp_crc_yes, "no": exp_crc_no},
        "other_industrial_experience": {"yes": exp_other_yes, "no": exp_other_no},
    }

    return {
        "activity": {
            "id": activity.id,
            "name": activity.name,
            "client": activity.client,
            "location": activity.location,
            "start_date": str(activity.start_date),
            "end_date": str(activity.end_date),
            "status": activity.status,
            "required_participants": activity.required_participants,
        },
        "registration_overview": {
            "total_registrations": total,
            "clear_records": clear_records,
            "records_with_exceptions": with_exceptions,
            "previous_experience": prev_experience,
            "fully_available": fully_available,
            "parent_permission_yes": parent_yes,
            "safety_shoes_yes": shoes_yes,
        },
        "whatsapp_control": {
            "number_entered": wa_entered,
            "proof_uploaded": wa_proof_uploaded,
            "verified": wa_verified,
            "verification_pending": max(0, wa_pending),
            "mismatch": wa_mismatch,
            "proof_missing": wa_proof_missing,
        },
        "exception_report": {
            "participants_with_exceptions": with_exceptions,
            "total_exception_instances": total_exception_instances,
            "breakdown": exception_counts,
        },
        "college_wise": college_data,
        "stream_wise": stream_counts,
        "year_wise": year_counts,
        "experience": {
            "crc": {"yes": exp_crc_yes, "no": exp_crc_no},
            "other": {"yes": exp_other_yes, "no": exp_other_no},
        },
        "readiness": readiness,
    }


@router.get("/interview/{activity_id}")
def get_interview_stats(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Interview and selection dashboard statistics."""

    participants = db.query(Participant).filter(Participant.activity_id == activity_id).all()
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    total = len(participants)
    participant_ids = [p.id for p in participants]

    interviews = db.query(Interview).filter(Interview.participant_id.in_(participant_ids)).all() if participant_ids else []
    interviewed_ids = {i.participant_id for i in interviews}

    interview_completed = len(interviews)
    interview_pending = total - interview_completed

    recommended = sum(1 for i in interviews if i.recommendation == "Recommended")
    hold = sum(1 for i in interviews if i.recommendation == "Hold/Waitlist")
    not_recommended = sum(1 for i in interviews if i.recommendation == "Not Recommended")

    # Work allocation
    allocation = {}
    for i in interviews:
        wa = i.work_allocation or "Unspecified"
        allocation[wa] = allocation.get(wa, 0) + 1

    # Assessment
    assessment = {}
    for i in interviews:
        a = i.overall_assessment or "Unspecified"
        assessment[a] = assessment.get(a, 0) + 1

    # Interviewer-wise
    interviewer_stats = {}
    for i in interviews:
        interviewer = db.query(User).filter(User.id == i.interviewer_id).first()
        name = interviewer.name if interviewer else f"User {i.interviewer_id}"
        if name not in interviewer_stats:
            interviewer_stats[name] = {
                "completed": 0, "Best": 0, "Good": 0, "OK": 0, "Not Good": 0,
                "Recommended": 0, "Hold/Waitlist": 0, "Not Recommended": 0,
            }
        interviewer_stats[name]["completed"] += 1
        if i.overall_assessment in ("Best", "Good", "OK", "Not Good"):
            interviewer_stats[name][i.overall_assessment] += 1
        if i.recommendation in ("Recommended", "Hold/Waitlist", "Not Recommended"):
            interviewer_stats[name][i.recommendation] += 1

    # Selection
    selected = sum(1 for p in participants if p.final_status == "Selected")
    waitlisted = sum(1 for p in participants if p.final_status == "Waitlisted")
    not_selected = sum(1 for p in participants if p.final_status == "Not Selected")
    confirmed = sum(1 for p in participants if p.final_status == "Confirmed")
    cancelled = sum(1 for p in participants if p.final_status == "Cancelled")
    decision_pending = total - (selected + waitlisted + not_selected + confirmed + cancelled)

    # Resource position
    required = activity.required_participants
    shortfall = max(0, required - selected)
    buffer = max(0, selected - required)

    return {
        "interview_status": {
            "total_registrations": total,
            "interview_pending": interview_pending,
            "interview_completed": interview_completed,
            "recommended": recommended,
            "hold_waitlist": hold,
            "not_recommended": not_recommended,
        },
        "work_allocation": allocation,
        "overall_assessment": assessment,
        "interviewer_wise": interviewer_stats,
        "selection": {
            "selected": selected,
            "waitlisted": waitlisted,
            "not_selected": not_selected,
            "confirmed": confirmed,
            "cancelled": cancelled,
            "decision_pending": decision_pending,
        },
        "resource_position": {
            "required": required,
            "selected": selected,
            "shortfall": shortfall,
            "buffer": buffer,
            "waitlisted": waitlisted,
        },
    }

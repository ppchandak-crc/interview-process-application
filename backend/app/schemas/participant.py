from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class ParticipantBase(BaseModel):
    activity_id: int
    responses: Dict[str, Any]
    status: Optional[str] = "Registered"


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantUpdate(BaseModel):
    responses: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class ParticipantResponse(BaseModel):
    id: int
    registration_id: str
    activity_id: int
    responses: Dict[str, Any]
    status: Optional[str] = None
    name: Optional[str] = None
    whatsapp_number: Optional[str] = None
    college: Optional[str] = None
    stream: Optional[str] = None
    education_year: Optional[str] = None
    age: Optional[int] = None
    parent_permission: Optional[str] = None
    safety_shoes: Optional[str] = None
    availability: Optional[str] = None
    prev_experience_crc: Optional[str] = None
    whatsapp_verified: Optional[bool] = False
    whatsapp_verification_note: Optional[str] = None
    exceptions: Optional[List[str]] = []
    final_status: Optional[str] = "Registered"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FinalStatusUpdate(BaseModel):
    final_status: str  # Selected | Waitlisted | Not Selected | Confirmed | Cancelled


class WhatsAppVerification(BaseModel):
    verified: bool
    note: Optional[str] = None  # matched / mismatch / pending

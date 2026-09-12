from pydantic import BaseModel
from typing import Optional, Dict, Any

class ParticipantBase(BaseModel):
    activity_id: int
    responses: Dict[str, Any]
    status: Optional[str] = "Registered"

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantUpdate(BaseModel):
    responses: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ParticipantResponse(ParticipantBase):
    id: int
    registration_id: str

    class Config:
        from_attributes = True

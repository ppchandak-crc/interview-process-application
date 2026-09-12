from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.activity import ActivityStatus

class ActivityBase(BaseModel):
    name: str
    client: str
    location: str
    start_date: date
    end_date: date
    required_participants: int
    maximum_registrations: int
    minimum_age: int
    safety_shoes_required: bool
    registration_opening_date: date
    registration_closing_date: date
    introductory_paragraph: Optional[str] = None
    status: str = ActivityStatus.DRAFT.value
    form_schema: Optional[dict] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int

    class Config:
        from_attributes = True

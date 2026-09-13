from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InterviewCreate(BaseModel):
    participant_id: int
    work_allocation: Optional[str] = None
    work_allocation_other: Optional[str] = None
    overall_assessment: Optional[str] = None
    recommendation: Optional[str] = None
    remarks: Optional[str] = None


class InterviewUpdate(BaseModel):
    work_allocation: Optional[str] = None
    work_allocation_other: Optional[str] = None
    overall_assessment: Optional[str] = None
    recommendation: Optional[str] = None
    remarks: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    participant_id: int
    interviewer_id: int
    interviewer_name: Optional[str] = None
    work_allocation: Optional[str] = None
    work_allocation_other: Optional[str] = None
    overall_assessment: Optional[str] = None
    recommendation: Optional[str] = None
    remarks: Optional[str] = None
    locked_by: Optional[int] = None
    locked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

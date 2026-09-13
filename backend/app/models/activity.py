from sqlalchemy import Column, Integer, String, Date, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.config.database import Base
import enum


class ActivityStatus(str, enum.Enum):
    DRAFT = "Draft"
    REGISTRATION_OPEN = "Registration Open"
    REGISTRATION_CLOSED = "Registration Closed"
    INTERVIEW = "Interview"
    COMPLETED = "Completed"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    client = Column(String, nullable=False)
    location = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    required_participants = Column(Integer, nullable=False)
    maximum_registrations = Column(Integer, nullable=False)
    minimum_age = Column(Integer, nullable=False)
    safety_shoes_required = Column(Boolean, default=False)
    registration_opening_date = Column(Date, nullable=False)
    registration_closing_date = Column(Date, nullable=False)
    introductory_paragraph = Column(Text, nullable=True)
    status = Column(String, default=ActivityStatus.DRAFT.value)
    form_schema = Column(JSON, nullable=True)

    # Relationships
    participants = relationship("Participant", back_populates="activity")

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(String, unique=True, index=True, nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)

    # Store dynamic form responses as JSON
    responses = Column(JSON, nullable=False)

    # Extracted queryable fields (populated from responses on registration/update)
    name = Column(String, nullable=True, index=True)
    whatsapp_number = Column(String, nullable=True)
    college = Column(String, nullable=True, index=True)
    stream = Column(String, nullable=True, index=True)
    education_year = Column(String, nullable=True, index=True)
    dob = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    parent_permission = Column(String, nullable=True)  # Yes / No
    safety_shoes = Column(String, nullable=True)  # Yes / No / Already Have
    availability = Column(String, nullable=True)  # Yes / No
    prev_experience_crc = Column(String, nullable=True)  # Yes / No
    prev_experience_other = Column(String, nullable=True)  # Yes / No
    friend_name = Column(String, nullable=True)
    parent_mobile = Column(String, nullable=True)

    # WhatsApp verification
    whatsapp_verified = Column(Boolean, default=False)
    whatsapp_verification_note = Column(String, nullable=True)  # matched / mismatch / pending

    # Computed exceptions (JSON list of exception flag strings)
    exceptions = Column(JSON, default=list)

    # Status tracking
    status = Column(String, default="Registered")
    # Extended final status: Registered | Interview Pending | Interview Completed |
    # Selected | Waitlisted | Not Selected | Confirmed | Cancelled
    final_status = Column(String, default="Registered")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    activity = relationship("Activity", back_populates="participants")
    interview = relationship("Interview", back_populates="participant", uselist=False)

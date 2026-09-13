from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"), unique=True, nullable=False, index=True)
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Interview fields
    work_allocation = Column(String, nullable=True)  # Counting | TL | Counting/TL | Other
    work_allocation_other = Column(String, nullable=True)
    overall_assessment = Column(String, nullable=True)  # Best | Good | OK | Not Good
    recommendation = Column(String, nullable=True)  # Recommended | Hold/Waitlist | Not Recommended
    remarks = Column(Text, nullable=True)

    # Concurrent lock
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    locked_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    participant = relationship("Participant", back_populates="interview")
    interviewer = relationship("User", foreign_keys=[interviewer_id])
    locked_by_user = relationship("User", foreign_keys=[locked_by])

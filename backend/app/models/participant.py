from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from app.config.database import Base

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(String, unique=True, index=True, nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    
    # Store dynamic form responses as JSON
    responses = Column(JSON, nullable=False)
    
    # Status
    status = Column(String, default="Registered")  # Registered, Verified, Interview Scheduled, Selected, Rejected

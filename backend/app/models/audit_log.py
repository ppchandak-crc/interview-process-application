from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, Text
from datetime import datetime
from app.config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=True)
    action = Column(String, nullable=False)  # login, status_change, interview_saved, selection_change, etc.
    entity_type = Column(String, nullable=True)  # participant, activity, interview, user
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)  # old_value, new_value, etc.
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

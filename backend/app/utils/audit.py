"""
Audit logging utility.
"""

from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional, Dict, Any


def log_action(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
):
    """Record an auditable action."""
    entry = AuditLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(entry)
    # Don't commit here — caller is responsible for committing the transaction

from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from typing import Optional, Dict


def log_activity(
    db: Session,
    user_id: int,
    action_type: str,
    action_details: Optional[Dict] = None,
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    exp_change: int = 0,
):
    log = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        action_details=action_details,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        ip_address=ip_address,
        user_agent=user_agent,
        exp_change=exp_change,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

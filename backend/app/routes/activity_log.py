
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.services.activity_log_service import log_activity
from app.schemas.activity_log import ActivityLogCreate
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/activity-log", tags=["activity-log"])

class ActivityLogResponse(BaseModel):
    student_name: str
    action: str
    time_ago: str

def time_ago(dt):
    now = datetime.now(timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    else:
        return f"{int(seconds // 86400)} days ago"

@router.get("/", response_model=List[ActivityLogResponse])
def get_recent_activity_logs(limit: int = Query(5, ge=1, le=50), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    result = []
    for log in logs:
        student = db.query(User).filter(User.id == log.user_id).first()
        if student:
            student_name = f"{student.first_name} {student.last_name}"
        else:
            student_name = "Unknown"
        result.append(ActivityLogResponse(
            student_name=student_name,
            action=log.action_type,
            time_ago=time_ago(log.timestamp)
        ))
    return result

@router.post("/login", status_code=status.HTTP_201_CREATED)
def log_login_activity(payload: ActivityLogCreate, db: Session = Depends(get_db)):
    """
    Log a login activity for a user (called from frontend after successful login).
    Only logs if the user is a student.
    """
    user = db.query(User).filter(User.moodle_user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "student":
        return {"success": False, "message": "Not a student, login not logged."}
    log = log_activity(
        db=db,
        user_id=user.id,
        action_type="login",
        action_details=payload.action_details,
        related_entity_type="user",
        related_entity_id=payload.user_id,
        ip_address=payload.ip_address,
        user_agent=payload.user_agent,
    )
    return {"success": True, "log_id": log.log_id}

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.services.activity_log_service import log_activity
from app.schemas.activity_log import ActivityLogCreate

router = APIRouter(prefix="/activity-log", tags=["activity-log"])

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

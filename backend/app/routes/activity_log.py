
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.models.quest import QuestEngagementEvent, QuestProgress, Quest
from app.services.activity_log_service import log_activity
from app.schemas.activity_log import ActivityLogCreate
from pydantic import BaseModel
from typing import List, Tuple
from datetime import datetime, timezone, timedelta

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

def format_event_type_to_action(event_type: str, quest_title: str = None) -> str:
    """Convert quest engagement event type to readable action string."""
    event_mappings = {
        # Start events
        'assignment_viewed': 'Viewed assignment',
        'quiz_attempt_started': 'Started quiz',
        'lesson_viewed': 'Viewed lesson',
        'file_viewed': 'Viewed file',
        'book_viewed': 'Viewed book',
        'page_viewed': 'Viewed page',
        'url_viewed': 'Viewed URL',
        # Progress events
        'forum_post_created': 'Created forum post',
        'forum_discussion_created': 'Created forum discussion',
        'glossary_entry_created': 'Created glossary entry',
        'wiki_page_created': 'Created wiki page',
        'wiki_page_updated': 'Updated wiki page',
        'chat_message_sent': 'Sent chat message',
        'choice_answer_submitted': 'Submitted choice answer',
        # Completion events
        'quiz_attempt_submitted': 'Submitted quiz',
        'assignment_submitted': 'Submitted assignment',
        'lesson_completed': 'Completed lesson',
        'feedback_submitted': 'Submitted feedback',
        'assignment_graded': 'Assignment graded',
        'module_completion_updated': 'Completed module',
    }
    
    action = event_mappings.get(event_type, event_type.replace('_', ' ').title())
    
    # Include quest title if available
    if quest_title:
        action = f"{action}: {quest_title}"
    
    return action

@router.get("/", response_model=List[ActivityLogResponse])
def get_recent_activity_logs(limit: int = Query(5, ge=1, le=50), db: Session = Depends(get_db)):
    """
    Get recent activity logs combining both activity_logs and quest_engagement_events.
    Returns unified list sorted by timestamp descending.
    Optimized to fetch limited results from each source and combine efficiently.
    """
    # Only fetch activities from the last 30 days to improve performance
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Fetch a reasonable number from each source (limit * 2 to ensure we have enough after combining)
    fetch_limit = min(limit * 2, 100)
    
    combined_results: List[Tuple[datetime, str, str]] = []
    
    # Fetch activity logs with user join in single query (avoiding N+1)
    activity_logs = db.query(
        ActivityLog.timestamp,
        ActivityLog.action_type,
        func.coalesce(User.first_name, '').label('first_name'),
        func.coalesce(User.last_name, '').label('last_name')
    ).join(
        User, ActivityLog.user_id == User.id
    ).filter(
        ActivityLog.timestamp >= cutoff_date
    ).order_by(
        ActivityLog.timestamp.desc()
    ).limit(fetch_limit).all()
    
    for log in activity_logs:
        student_name = f"{log.first_name or ''} {log.last_name or ''}".strip() or "Unknown"
        combined_results.append((
            log.timestamp,
            student_name,
            log.action_type
        ))
    
    # Fetch quest engagement events with all necessary joins in single query
    quest_events = db.query(
        QuestEngagementEvent.timestamp,
        QuestEngagementEvent.event_type,
        Quest.title.label('quest_title'),
        func.coalesce(User.first_name, '').label('first_name'),
        func.coalesce(User.last_name, '').label('last_name')
    ).join(
        QuestProgress, QuestEngagementEvent.quest_progress_id == QuestProgress.progress_id
    ).join(
        User, QuestProgress.user_id == User.id
    ).join(
        Quest, QuestProgress.quest_id == Quest.quest_id
    ).filter(
        QuestEngagementEvent.timestamp >= cutoff_date
    ).order_by(
        QuestEngagementEvent.timestamp.desc()
    ).limit(fetch_limit).all()
    
    for event in quest_events:
        student_name = f"{event.first_name or ''} {event.last_name or ''}".strip() or "Unknown"
        action = format_event_type_to_action(event.event_type, event.quest_title)
        combined_results.append((
            event.timestamp,
            student_name,
            action
        ))
    
    # Sort by timestamp descending and apply limit
    combined_results.sort(key=lambda x: x[0], reverse=True)
    combined_results = combined_results[:limit]
    
    # Format results
    result = []
    for timestamp, student_name, action in combined_results:
        result.append(ActivityLogResponse(
            student_name=student_name,
            action=action,
            time_ago=time_ago(timestamp)
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

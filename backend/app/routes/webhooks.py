from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database.connection import get_db
from app.models.quest import Quest, QuestProgress, StudentProgress, ExperiencePoints
from app.models.course import Course
from app.models.user import User
from sqlalchemy import Numeric
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func as sa_func
from sqlalchemy import and_ as sa_and
from sqlalchemy import Integer as SAInteger
from sqlalchemy import text
from sqlalchemy.orm import aliased
from sqlalchemy import update
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

Base = get_db().registry.base if hasattr(get_db(), 'registry') else None

def log_and_ack(event_type: str, data: dict, msg: str):
    logger.info(f"📥 {msg}: %s", data)
    return {
        "status": "success",
        "message": msg,
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat()
    }

# ------------------------
# Placeholder handlers
# ------------------------

def handle_user_created(data: dict, db: Session):
    moodle_user_id = data.get("user_id")
    username = data.get("username")
    email = data.get("email")
    if not (moodle_user_id and username and email):
        logger.error("Missing required fields in user_created webhook: %s", data)
        return
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        user = User(moodle_user_id=moodle_user_id, username=username, email=email, role="student", is_active=True)
        db.add(user)
        db.commit()
        logger.info(f"Created new user for moodle_user_id={moodle_user_id}")
    else:
        logger.info(f"User already exists for moodle_user_id={moodle_user_id}")

def handle_quiz_attempt_submitted(data: dict, db: Session):
    # This is a stub for quiz attempt logic. You may want to update quest progress, award XP, etc.
    logger.info(f"Quiz attempt submitted: {data}")
    # TODO: Implement quiz/quest mapping and progress update

def handle_assign_submitted(data: dict, db: Session):
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("assignment_id")
    moodle_user_id = data.get("user_id")
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in webhook payload: %s", data)
        return

    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    if not quest:
        logger.error(f"No active quest found for course_id={course_id}, moodle_activity_id={moodle_activity_id}")
        return

    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # --- QUEST PROGRESS ---
    qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
    if not qp:
        qp = QuestProgress(user_id=user_id, quest_id=quest.quest_id, status="not_started", progress_percent=0)
        db.add(qp)
        db.commit()
        db.refresh(qp)
    if not qp.started_at:
        qp.started_at = now
    qp.status = "completed"
    qp.progress_percent = 100
    qp.completed_at = now
    if quest.validation_method == "manual":
        qp.validation_notes = "Pending manual validation"
        qp.validated_at = None
    else:
        qp.validated_at = now
    db.commit()

    exp_reward = quest.exp_reward or 0
    # --- ORM for student_progress ---
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += exp_reward
        sp.quests_completed += 1
        sp.last_activity = now
    else:
        sp = StudentProgress(user_id=user_id, course_id=course_id, total_exp=exp_reward, quests_completed=1, last_activity=now)
        db.add(sp)
    db.commit()
    # --- ORM for experience_points ---
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=exp_reward,
        source_type="quest",
        source_id=quest.quest_id,
        awarded_at=now,
        notes=f"Auto-awarded for quest completion (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    db.commit()
    logger.info(f"Updated quest progress, student progress, and experience points for user {user_id} on quest {quest.quest_id}")

def handle_assign_graded(data: dict, db: Session):
    # This is a stub for assignment graded logic. You may want to update quest validation, award XP, etc.
    logger.info(f"Assignment graded: {data}")
    # TODO: Implement grading/validation logic

def handle_course_completion_updated(data: dict, db: Session):
    # This is a stub for course completion logic. You may want to update student progress, award XP, etc.
    logger.info(f"Course completion updated: {data}")
    # TODO: Implement course completion logic

def handle_forum_post_created(data: dict, db: Session):
    # This is a stub for forum post logic. You may want to award XP for engagement.
    logger.info(f"Forum post created: {data}")
    # TODO: Implement forum engagement XP logic

def handle_forum_discussion_created(data: dict, db: Session):
    logger.info(f"Forum discussion created: {data}")
    # TODO: Implement forum discussion XP logic

def handle_lesson_completed(data: dict, db: Session):
    logger.info(f"Lesson completed: {data}")
    # TODO: Implement lesson completion XP/quest logic

def handle_lesson_viewed(data: dict, db: Session):
    logger.info(f"Lesson viewed: {data}")
    # TODO: Implement lesson view tracking/XP

def handle_feedback_submitted(data: dict, db: Session):
    logger.info(f"Feedback submitted: {data}")
    # TODO: Implement feedback XP/quest logic

def handle_glossary_entry_created(data: dict, db: Session):
    logger.info(f"Glossary entry created: {data}")
    # TODO: Implement glossary XP/quest logic

def handle_resource_file_viewed(data: dict, db: Session):
    logger.info(f"Resource file viewed: {data}")
    # TODO: Implement resource file view XP/quest logic

def handle_resource_book_viewed(data: dict, db: Session):
    logger.info(f"Resource book viewed: {data}")
    # TODO: Implement resource book view XP/quest logic

def handle_resource_page_viewed(data: dict, db: Session):
    logger.info(f"Resource page viewed: {data}")
    # TODO: Implement resource page view XP/quest logic

def handle_resource_url_viewed(data: dict, db: Session):
    logger.info(f"Resource URL viewed: {data}")
    # TODO: Implement resource URL view XP/quest logic

def handle_choice_answer_submitted(data: dict, db: Session):
    logger.info(f"Choice answer submitted: {data}")
    # TODO: Implement choice answer XP/quest logic

def handle_wiki_page_created(data: dict, db: Session):
    logger.info(f"Wiki page created: {data}")
    # TODO: Implement wiki page XP/quest logic

def handle_wiki_page_updated(data: dict, db: Session):
    logger.info(f"Wiki page updated: {data}")
    # TODO: Implement wiki page update XP/quest logic

def handle_chat_message_sent(data: dict, db: Session):
    logger.info(f"Chat message sent: {data}")
    # TODO: Implement chat message XP/quest logic

# ------------------------
# Dispatcher map: event -> message + handler
# ------------------------

EVENT_HANDLERS = {
    "user-created": {
        "message": "User created webhook received and logged",
        "handler": handle_user_created
    },
    "quiz/attempt-submitted": {
        "message": "Quiz attempt submitted webhook received and logged",
        "handler": handle_quiz_attempt_submitted
    },
    "assign/submitted": {
        "message": "Assignment submitted webhook received and logged",
        "handler": handle_assign_submitted
    },
    "assign/graded": {
        "message": "Assignment graded webhook received and logged",
        "handler": handle_assign_graded
    },
    "course/completion-updated": {
        "message": "Module completion updated webhook received and logged",
        "handler": handle_course_completion_updated
    },
    "forum/post-created": {
        "message": "Forum post created webhook received and logged",
        "handler": handle_forum_post_created
    },
    "forum/discussion-created": {
        "message": "Forum discussion created webhook received and logged",
        "handler": handle_forum_discussion_created
    },
    "lesson/completed": {
        "message": "Lesson completed webhook received and logged",
        "handler": handle_lesson_completed
    },
    "lesson/viewed": {
        "message": "Lesson viewed webhook received and logged",
        "handler": handle_lesson_viewed
    },
    "feedback/submitted": {
        "message": "Feedback submitted webhook received and logged",
        "handler": handle_feedback_submitted
    },
    "glossary/entry-created": {
        "message": "Glossary entry created webhook received and logged",
        "handler": handle_glossary_entry_created
    },
    "resource/file-viewed": {
        "message": "File viewed webhook received and logged",
        "handler": handle_resource_file_viewed
    },
    "resource/book-viewed": {
        "message": "Book viewed webhook received and logged",
        "handler": handle_resource_book_viewed
    },
    "resource/page-viewed": {
        "message": "Page viewed webhook received and logged",
        "handler": handle_resource_page_viewed
    },
    "resource/url-viewed": {
        "message": "URL viewed webhook received and logged",
        "handler": handle_resource_url_viewed
    },
    "choice/answer-submitted": {
        "message": "Choice answer submitted webhook received and logged",
        "handler": handle_choice_answer_submitted
    },
    "wiki/page-created": {
        "message": "Wiki page created webhook received and logged",
        "handler": handle_wiki_page_created
    },
    "wiki/page-updated": {
        "message": "Wiki page updated webhook received and logged",
        "handler": handle_wiki_page_updated
    },
    "chat/message-sent": {
        "message": "Chat message sent webhook received and logged",
        "handler": handle_chat_message_sent
    },
}

# ------------------------
# Main webhook route
# ------------------------

@router.post("/{event_path:path}")
async def handle_webhook(event_path: str, request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()

        if event_path not in EVENT_HANDLERS:
            raise HTTPException(status_code=404, detail="Unknown webhook event path")

        event_info = EVENT_HANDLERS[event_path]
        msg = event_info["message"]

        handler = event_info.get("handler")
        if handler:
            # Pass db session if handler expects it
            import inspect
            if "db" in inspect.signature(handler).parameters:
                handler(data, db)
            else:
                handler(data)

        return log_and_ack(event_path.replace("/", "_"), data, msg)

    except Exception as e:
        logger.error("❌ Error processing webhook for %s: %s", event_path, str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process webhook: {str(e)}")
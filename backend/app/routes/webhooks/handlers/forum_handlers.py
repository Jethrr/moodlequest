"""
Forum-related webhook handlers.
"""

import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.quest import StudentProgress, ExperiencePoints
from app.models.course import Course
from app.models.user import User
from app.services.notification_service import notification_service, create_xp_notification
from app.services.daily_quest_service import DailyQuestService
from ..utils import XP_CONFIG

logger = logging.getLogger(__name__)


def handle_forum_post_created(data: dict, db: Session):
    """
    Handle forum post creation webhook from Moodle.
    Awards XP for forum engagement and participation.
    """
    moodle_course_id = data.get("course_id")
    moodle_user_id = data.get("user_id")
    forum_id = data.get("forum_id")
    discussion_id = data.get("discussion_id")
    post_id = data.get("post_id")
    
    if not (moodle_course_id and moodle_user_id and forum_id):
        logger.error("Missing required fields in forum post webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award XP for forum participation
    now = datetime.utcnow()
    xp_amount = XP_CONFIG["forum_post"]
    
    # Check for duplicate XP (in case webhook is sent multiple times)
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "forum_post",
        ExperiencePoints.source_id == post_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for forum post {post_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="forum_post",
        source_id=post_id,
        awarded_at=now,
        notes=f"Forum participation XP (forum_id={forum_id}, discussion_id={discussion_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for forum post to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing forum post: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing forum post: {e}")
        raise

    # Update EARN_XP daily quest progress
    try:
        result = DailyQuestService(db).complete_earn_xp_quest(user_id, xp_amount)
        logger.info(f"EARN_XP daily quest update result for user {user_id}: {result}")
        
        # If the EARN_XP quest was completed, send XP reward notification
        if result.get("success") and result.get("xp_awarded", 0) > 0:
            try:
                # Get updated student progress for total XP
                updated_sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                total_xp = updated_sp.total_exp if updated_sp else xp_amount
                
                # Create and send XP reward notification for daily quest completion
                daily_quest_notification = create_xp_notification(
                    user_id=user_id,
                    quest_title="Earn XP Daily Quest Completed! 🎉",
                    xp_earned=result["xp_awarded"],
                    total_xp=total_xp,
                    source_type="daily_quest_completion"
                )
                
                # Send XP reward notification asynchronously (non-blocking)
                asyncio.create_task(notification_service.send_notification(daily_quest_notification))
                logger.info(f"Daily quest XP reward notification sent to user {user_id}")
                
            except Exception as notification_error:
                logger.error(f"Failed to send daily quest XP reward notification for user {user_id}: {notification_error}")
                
    except Exception as e:
        logger.error(f"Failed to update EARN_XP daily quest for user {user_id}: {e}")


def handle_forum_discussion_created(data: dict, db: Session):
    """
    Handle forum discussion creation webhook from Moodle.
    Awards higher XP for creating new discussions vs just posting replies.
    """
    moodle_course_id = data.get("course_id")
    moodle_user_id = data.get("user_id")
    forum_id = data.get("forum_id")
    discussion_id = data.get("discussion_id")
    
    if not (moodle_course_id and moodle_user_id and forum_id and discussion_id):
        logger.error("Missing required fields in forum discussion webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award higher XP for starting discussions
    now = datetime.utcnow()
    xp_amount = XP_CONFIG["forum_discussion"]  # Higher than regular posts
    
    # Check for duplicate XP
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "forum_discussion",
        ExperiencePoints.source_id == discussion_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for forum discussion {discussion_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="forum_discussion",
        source_id=discussion_id,
        awarded_at=now,
        notes=f"Forum discussion creation XP (forum_id={forum_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for forum discussion creation to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing forum discussion: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing forum discussion: {e}")
        raise

    # Update EARN_XP daily quest progress
    try:
        result = DailyQuestService(db).complete_earn_xp_quest(user_id, xp_amount)
        logger.info(f"EARN_XP daily quest update result for user {user_id}: {result}")
        
        # If the EARN_XP quest was completed, send XP reward notification
        if result.get("success") and result.get("xp_awarded", 0) > 0:
            try:
                # Get updated student progress for total XP
                updated_sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                total_xp = updated_sp.total_exp if updated_sp else xp_amount
                
                # Create and send XP reward notification for daily quest completion
                daily_quest_notification = create_xp_notification(
                    user_id=user_id,
                    quest_title="Earn XP Daily Quest Completed! 🎉",
                    xp_earned=result["xp_awarded"],
                    total_xp=total_xp,
                    source_type="daily_quest_completion"
                )
                
                # Send XP reward notification asynchronously (non-blocking)
                asyncio.create_task(notification_service.send_notification(daily_quest_notification))
                logger.info(f"Daily quest XP reward notification sent to user {user_id}")
                
            except Exception as notification_error:
                logger.error(f"Failed to send daily quest XP reward notification for user {user_id}: {notification_error}")
                
    except Exception as e:
        logger.error(f"Failed to update EARN_XP daily quest for user {user_id}: {e}")

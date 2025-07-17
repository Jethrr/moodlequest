"""
Lesson-related webhook handlers.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.quest import Quest, QuestProgress, StudentProgress, ExperiencePoints
from app.models.course import Course
from app.models.user import User
from app.services.notification_service import notification_service, create_xp_notification, create_quest_notification
from app.services.daily_quest_service import DailyQuestService
from ..utils import check_badges_after_quest_completion, XP_CONFIG

logger = logging.getLogger(__name__)


def handle_lesson_completed(data: dict, db: Session):
    """
    Handle lesson completion webhook from Moodle.
    Can either be a quest (if mapped) or award general completion XP.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("lesson_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    completion_score = data.get("score", 0)
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in lesson completion webhook payload: %s", data)
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

    # Check if this lesson is mapped to a quest
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if quest:
        # This is a quest - handle like assignment/quiz completion
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
            qp.validation_notes = f"Lesson completed with score: {completion_score}. Pending manual validation."
            qp.validated_at = None
        else:
            qp.validated_at = now
            qp.validation_notes = f"Auto-validated lesson completion with score: {completion_score}"
        
        exp_reward = quest.exp_reward or 0
        
        # Update student progress
        sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += exp_reward
            sp.quests_completed += 1
            sp.last_activity = now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=exp_reward,
                quests_completed=1,
                last_activity=now
            )
            db.add(sp)
        
        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=exp_reward,
            source_type="lesson_quest",
            source_id=quest.quest_id,
            awarded_at=now,
            notes=f"Quest completion for lesson (activity_id={moodle_activity_id}, score={completion_score})"
        )
        db.add(ep)
        
        try:
            db.commit()
            logger.info(f"Successfully processed lesson quest completion for user {user_id}, quest {quest.quest_id}")
            
            # Check for badge achievements after quest completion
            check_badges_after_quest_completion(user_id, db)
            
            # Send real-time notifications
            try:
                # Get updated student progress for total XP
                updated_sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                total_xp = updated_sp.total_exp if updated_sp else exp_reward
                
                # Create and send XP notification
                notification = create_xp_notification(
                    user_id=user_id,
                    quest_title=quest.title,
                    xp_earned=exp_reward,
                    total_xp=total_xp,
                    source_type="lesson_completion"
                )
                
                # Send XP notification asynchronously (non-blocking)
                asyncio.create_task(notification_service.send_notification(notification))
                logger.info(f"Real-time XP notification sent to user {user_id} for lesson completion")
                
                # Also send quest completion notification for badge refresh
                quest_notification = create_quest_notification(
                    user_id=user_id,
                    quest_title=quest.title,
                    notification_type="quest_completion",
                    message=f"Quest completed via lesson completion! You may have earned new badges."
                )
                asyncio.create_task(notification_service.send_notification(quest_notification))
                logger.info(f"Quest completion notification sent to user {user_id} for badge refresh")
                
            except Exception as notification_error:
                # Don't fail the main operation if notification fails
                logger.error(f"Failed to send real-time notification for user {user_id}: {notification_error}")
                
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error processing lesson quest: {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing lesson quest: {e}")
            raise
    else:
        # Regular lesson completion - award general XP
        xp_amount = XP_CONFIG["lesson_completion"]
        
        # Check for duplicate XP
        existing_xp = db.query(ExperiencePoints).filter(
            ExperiencePoints.user_id == user_id,
            ExperiencePoints.course_id == course_id,
            ExperiencePoints.source_type == "lesson",
            ExperiencePoints.source_id == moodle_activity_id
        ).first()
        
        if existing_xp:
            logger.debug(f"XP already awarded for lesson {moodle_activity_id} by user {user_id}")
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
            source_type="lesson",
            source_id=moodle_activity_id,
            awarded_at=now,
            notes=f"Lesson completion XP (activity_id={moodle_activity_id}, score={completion_score})"
        )
        db.add(ep)
        
        try:
            db.commit()
            logger.info(f"Awarded {xp_amount} XP for lesson completion to user {user_id} in course {course_id}")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error processing lesson completion: {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing lesson completion: {e}")
            raise

    # Update EARN_XP daily quest progress
    try:
        xp_for_daily = exp_reward if quest else xp_amount
        result = DailyQuestService(db).complete_earn_xp_quest(user_id, xp_for_daily)
        logger.info(f"EARN_XP daily quest update result for user {user_id}: {result}")
        
        # If the EARN_XP quest was completed, send XP reward notification
        if result.get("success") and result.get("xp_awarded", 0) > 0:
            try:
                # Get updated student progress for total XP
                updated_sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                total_xp = updated_sp.total_exp if updated_sp else xp_for_daily
                
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


def handle_lesson_viewed(data: dict, db: Session):
    """
    Handle lesson view webhook from Moodle.
    Awards small XP for lesson engagement and viewing activities.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("lesson_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    page_id = data.get("page_id")  # Specific lesson page viewed
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in lesson viewed webhook payload: %s", data)
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

    # Award small XP for lesson viewing/engagement
    now = datetime.utcnow()
    xp_amount = XP_CONFIG["lesson_view"]
    
    # Use page_id if available for more granular tracking, otherwise use lesson_id
    source_id = page_id if page_id else moodle_activity_id
    
    # Check for duplicate XP (prevent XP farming by repeatedly viewing same content)
    # Use a time window to allow re-awarding after some time (e.g., 1 hour)
    time_window = now - timedelta(hours=1)
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "lesson_view",
        ExperiencePoints.source_id == source_id,
        ExperiencePoints.awarded_at >= time_window
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded recently for lesson view {source_id} by user {user_id}")
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
        source_type="lesson_view",
        source_id=source_id,
        awarded_at=now,
        notes=f"Lesson viewing engagement XP (lesson_id={moodle_activity_id}, page_id={page_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for lesson view to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing lesson view: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing lesson view: {e}")
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

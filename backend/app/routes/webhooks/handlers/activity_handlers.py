"""
General activity-related webhook handlers.
"""

import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.quest import Quest, QuestProgress, StudentProgress, ExperiencePoints
from app.models.course import Course
from app.models.user import User
from app.services.notification_service import notification_service, create_xp_notification, create_quest_notification
from app.services.daily_quest_service import DailyQuestService
from ..utils import check_badges_after_quest_completion, XP_CONFIG

logger = logging.getLogger(__name__)


def handle_course_completion_updated(data: dict, db: Session):
    """
    Handle course module completion update webhook from Moodle.
    Awards XP for completing course activities that may not be full quests.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("activity_id") or data.get("module_id")
    moodle_user_id = data.get("user_id")
    completion_state = data.get("completion_state", 1)  # 1 = completed
    activity_type = data.get("activity_type", "unknown")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in course completion webhook payload: %s", data)
        return

    # Only process actual completions
    if completion_state != 1:
        logger.debug(f"Ignoring non-completion state {completion_state} for activity {moodle_activity_id}")
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

    # Check if this is already a quest (if so, it should be handled by other webhooks)
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True
    ).first()
    
    if quest:
        logger.debug(f"Activity {moodle_activity_id} is already a quest, skipping completion XP")
        return

    # Award small XP for general activity completion
    now = datetime.utcnow()
    xp_amount = XP_CONFIG["activity_completion"].get(activity_type.lower(), 5)
    
    # Check if we already awarded XP for this completion
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "completion",
        ExperiencePoints.source_id == moodle_activity_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for completion of activity {moodle_activity_id} by user {user_id}")
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
            quests_completed=0,  # This is not a quest completion
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="completion",
        source_id=moodle_activity_id,  # Store the activity_id as source_id
        awarded_at=now,
        notes=f"Activity completion XP for {activity_type} (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for {activity_type} completion to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing course completion: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing course completion: {e}")
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


def handle_feedback_submitted(data: dict, db: Session):
    """
    Handle feedback activity submission webhook from Moodle.
    Awards XP for completing feedback forms and surveys.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("feedback_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in feedback submission webhook payload: %s", data)
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

    # Check if this feedback is mapped to a quest
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if quest:
        # Handle as quest completion
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
        qp.validated_at = now  # Feedback submissions are typically auto-validated
        qp.validation_notes = "Auto-validated feedback submission"
        
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
            source_type="feedback_quest",
            source_id=quest.quest_id,
            awarded_at=now,
            notes=f"Quest completion for feedback (activity_id={moodle_activity_id})"
        )
        db.add(ep)
        
        logger.info(f"Successfully processed feedback quest completion for user {user_id}, quest {quest.quest_id}")
        
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
                source_type="feedback_completion"
            )
            
            # Send XP notification asynchronously (non-blocking)
            asyncio.create_task(notification_service.send_notification(notification))
            logger.info(f"Real-time XP notification sent to user {user_id} for feedback completion")
            
            # Also send quest completion notification for badge refresh
            quest_notification = create_quest_notification(
                user_id=user_id,
                quest_title=quest.title,
                notification_type="quest_completion",
                message=f"Quest completed via feedback submission! You may have earned new badges."
            )
            asyncio.create_task(notification_service.send_notification(quest_notification))
            logger.info(f"Quest completion notification sent to user {user_id} for badge refresh")
            
        except Exception as notification_error:
            # Don't fail the main operation if notification fails
            logger.error(f"Failed to send real-time notification for user {user_id}: {notification_error}")
        
        xp_amount = exp_reward
    else:
        # Regular feedback completion - award engagement XP
        xp_amount = XP_CONFIG["feedback_participation"]
        
        # Check for duplicate XP
        existing_xp = db.query(ExperiencePoints).filter(
            ExperiencePoints.user_id == user_id,
            ExperiencePoints.course_id == course_id,
            ExperiencePoints.source_type == "feedback",
            ExperiencePoints.source_id == moodle_activity_id
        ).first()
        
        if existing_xp:
            logger.debug(f"XP already awarded for feedback {moodle_activity_id} by user {user_id}")
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
            source_type="feedback",
            source_id=moodle_activity_id,
            awarded_at=now,
            notes=f"Feedback participation XP (activity_id={moodle_activity_id})"
        )
        db.add(ep)
        
        logger.info(f"Awarded {xp_amount} XP for feedback submission to user {user_id} in course {course_id}")
    
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing feedback: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing feedback: {e}")
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


def handle_choice_answer_submitted(data: dict, db: Session):
    """
    Handle choice (poll/voting) answer submission webhook from Moodle.
    Awards XP for participating in course polls and voting activities.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("choice_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    choice_answer = data.get("answer", "")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in choice answer webhook payload: %s", data)
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

    # Award XP for participation
    now = datetime.utcnow()
    xp_amount = XP_CONFIG["choice_participation"]
    
    # Check for duplicate XP
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "choice",
        ExperiencePoints.source_id == moodle_activity_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for choice {moodle_activity_id} by user {user_id}")
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
        source_type="choice",
        source_id=moodle_activity_id,
        awarded_at=now,
        notes=f"Choice/poll participation XP (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for choice participation to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing choice: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing choice: {e}")
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

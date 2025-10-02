"""
Base webhook processor to eliminate code duplication.
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
from app.services.quest_engagement_service import QuestEngagementService
from .utils import check_badges_after_quest_completion, XP_CONFIG
from .notification_manager import WebhookNotificationManager

logger = logging.getLogger(__name__)


class WebhookProcessor:
    """
    Base class for processing webhook events with common functionality.
    Eliminates code duplication across different webhook handlers.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.now = datetime.utcnow()
        self.notification_manager = WebhookNotificationManager(db)
        self.engagement_service = QuestEngagementService(db)
    
    def find_course(self, moodle_course_id: int) -> Course:
        """Find course by Moodle course ID."""
        course = self.db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
        if not course:
            raise ValueError(f"No local course found for moodle_course_id={moodle_course_id}")
        return course
    
    def find_user(self, moodle_user_id: int) -> User:
        """Find user by Moodle user ID."""
        user = self.db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
        if not user:
            raise ValueError(f"No local user found for moodle_user_id={moodle_user_id}")
        return user
    
    def find_active_quest(self, course_id: int, moodle_activity_id: int) -> Quest:
        """Find active quest by course and activity ID."""
        quest = self.db.query(Quest).filter(
            Quest.course_id == course_id,
            Quest.moodle_activity_id == moodle_activity_id,
            Quest.is_active == True,
            (Quest.start_date == None) | (Quest.start_date <= self.now),
            (Quest.end_date == None) | (Quest.end_date >= self.now)
        ).first()
        return quest
    
    def get_or_create_quest_progress(self, user_id: int, quest_id: str) -> QuestProgress:
        """Get existing quest progress or create new one."""
        qp = self.db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest_id).first()
        if not qp:
            qp = QuestProgress(user_id=user_id, quest_id=quest_id, status="not_started", progress_percent=0)
            self.db.add(qp)
            self.db.commit()
            self.db.refresh(qp)
        return qp
    
    def complete_quest(self, user_id: int, quest: Quest, additional_notes: str = ""):
        """
        Complete a quest and update all related progress.
        
        Args:
            user_id: ID of the user completing the quest
            quest: The quest being completed
            additional_notes: Additional notes for validation
        
        Returns:
            int: Experience points awarded
        """
        course_id = quest.course_id
        
        # Update quest progress
        qp = self.get_or_create_quest_progress(user_id, quest.quest_id)
        
        if not qp.started_at:
            qp.started_at = self.now
        qp.status = "completed"
        qp.progress_percent = 100
        qp.completed_at = self.now
        
        # Handle validation
        if quest.validation_method == "manual":
            qp.validation_notes = f"{additional_notes}. Pending manual validation."
            qp.validated_at = None
        else:
            qp.validated_at = self.now
            qp.validation_notes = f"Auto-validated. {additional_notes}"
        
        exp_reward = quest.exp_reward or 0
        
        # Update student progress
        sp = self.db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += exp_reward
            sp.quests_completed += 1
            sp.last_activity = self.now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=exp_reward,
                quests_completed=1,
                last_activity=self.now
            )
            self.db.add(sp)
        
        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=exp_reward,
            source_type="quest",
            source_id=quest.quest_id,
            awarded_at=self.now,
            notes=f"Quest completion: {additional_notes}"
        )
        self.db.add(ep)
        
        return exp_reward
    
    def award_engagement_xp(self, user_id: int, course_id: int, amount: int, source_type: str, 
                           source_id: str, notes: str = "", check_duplicates: bool = True):
        """
        Award XP for engagement activities (non-quest).
        
        Args:
            user_id: ID of the user
            course_id: ID of the course
            amount: XP amount to award
            source_type: Type of activity
            source_id: ID of the source activity
            notes: Additional notes
            check_duplicates: Whether to check for duplicate XP awards
        
        Returns:
            bool: True if XP was awarded, False if duplicate was found
        """
        # Check for duplicates if requested
        if check_duplicates:
            existing_xp = self.db.query(ExperiencePoints).filter(
                ExperiencePoints.user_id == user_id,
                ExperiencePoints.course_id == course_id,
                ExperiencePoints.source_type == source_type,
                ExperiencePoints.source_id == source_id
            ).first()
            
            if existing_xp:
                logger.debug(f"XP already awarded for {source_type} {source_id} by user {user_id}")
                return False
        
        # Update student progress
        sp = self.db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += amount
            sp.last_activity = self.now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=amount,
                quests_completed=0,
                last_activity=self.now
            )
            self.db.add(sp)
        
        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=amount,
            source_type=source_type,
            source_id=source_id,
            awarded_at=self.now,
            notes=notes
        )
        self.db.add(ep)
        
        return True
    
    def send_engagement_xp_notifications(self, user_id: int, course_id: int, xp_amount: int, 
                                       activity_title: str, source_type: str):
        """Send notifications for engagement XP (non-quest activities)."""
        try:
            # Use the enhanced notification manager
            asyncio.create_task(
                self.notification_manager.send_engagement_xp_notification(
                    user_id=user_id,
                    xp_amount=xp_amount,
                    activity_title=activity_title,
                    source_type=source_type,
                    course_id=course_id
                )
            )
            logger.info(f"Engagement XP notification task created for user {user_id}")
            
        except Exception as notification_error:
            logger.error(f"Failed to create engagement XP notification task for user {user_id}: {notification_error}")
    
    def send_quest_completion_notifications(self, user_id: int, course_id: int, quest: Quest, exp_reward: int):
        """Send notifications for quest completion using enhanced notification manager."""
        try:
            # Use the enhanced notification manager for better reliability
            asyncio.create_task(
                self.notification_manager.send_quest_completion_notification(
                    user_id=user_id,
                    quest=quest,
                    exp_reward=exp_reward,
                    course_id=course_id
                )
            )
            logger.info(f"Quest completion notification task created for user {user_id}")
            
        except Exception as notification_error:
            # Don't fail the main operation if notification fails
            logger.error(f"Failed to create quest completion notification task for user {user_id}: {notification_error}")
            
            # Fallback to original notification method
            try:
                # Get updated student progress for total XP
                updated_sp = self.db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                total_xp = updated_sp.total_exp if updated_sp else exp_reward
                
                # Create and send XP notification
                notification = create_xp_notification(
                    user_id=user_id,
                    quest_title=quest.title,
                    xp_earned=exp_reward,
                    total_xp=total_xp,
                    source_type="quest_completion_fallback"
                )
                
                # Send XP notification asynchronously (non-blocking)
                asyncio.create_task(notification_service.send_notification(notification))
                logger.info(f"Fallback XP notification sent to user {user_id} for quest completion")
                
            except Exception as fallback_error:
                logger.error(f"Failed to send fallback notification for user {user_id}: {fallback_error}")
    
    def update_daily_quest_progress(self, user_id: int, course_id: int, xp_amount: int):
        """Update EARN_XP daily quest progress and send notifications if completed."""
        try:
            result = DailyQuestService(self.db).complete_earn_xp_quest(user_id, xp_amount)
            logger.info(f"EARN_XP daily quest update result for user {user_id}: {result}")
            
            # If the EARN_XP quest was completed, send XP reward notification
            if result.get("success") and result.get("xp_awarded", 0) > 0:
                try:
                    # Get updated student progress for total XP
                    updated_sp = self.db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
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
    
    def commit_changes_safely(self, success_message: str):
        """
        Safely commit database changes with proper error handling.
        
        Args:
            success_message: Message to log on successful commit
        """
        try:
            self.db.commit()
            logger.info(success_message)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Database integrity error: {e}")
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Database error: {e}")
            raise
    
    def process_engagement_event(self, data: dict, event_type: str):
        """Process webhook event for quest engagement tracking"""
        try:
            return self.engagement_service.process_engagement_event(data, event_type)
        except Exception as e:
            logger.error(f"Error processing engagement event {event_type}: {e}")
            return False

    def process_quest_or_engagement(self, data: dict, source_type: str, 
                                   activity_id_key: str = "activity_id", 
                                   default_xp: int = 10, 
                                   grade_key: str = None):
        """
        Generic method to process either quest completion or engagement XP.
        
        Args:
            data: Webhook payload data
            source_type: Type of source activity
            activity_id_key: Key to get activity ID from data
            default_xp: Default XP for non-quest activities
            grade_key: Key to get grade from data (optional)
        
        Returns:
            bool: True if processing succeeded, False if failed
        """
        # Extract required fields
        moodle_course_id = data.get("course_id")
        moodle_activity_id = data.get(activity_id_key) or data.get("activity_id")
        moodle_user_id = data.get("user_id")
        grade = data.get(grade_key, 0) if grade_key else 0
        
        if not (moodle_course_id and moodle_activity_id and moodle_user_id):
            logger.error(f"Missing required fields in {source_type} webhook payload: %s", data)
            return False
        
        try:
            # Find entities
            course = self.find_course(moodle_course_id)
            user = self.find_user(moodle_user_id)
            quest = self.find_active_quest(course.id, moodle_activity_id)
            
            if quest:
                # Process as quest completion
                additional_notes = f"{source_type} completed"
                if grade:
                    additional_notes += f" with grade: {grade}"
                
                exp_reward = self.complete_quest(user.id, quest, additional_notes)
                self.commit_changes_safely(f"Successfully processed {source_type} quest completion for user {user.id}, quest {quest.quest_id}")
                
                # Send notifications and check badges
                check_badges_after_quest_completion(user.id, self.db)
                self.send_quest_completion_notifications(user.id, course.id, quest, exp_reward)
                self.update_daily_quest_progress(user.id, course.id, exp_reward)
                
            else:
                # Process as engagement XP
                xp_amount = XP_CONFIG.get(f"{source_type}_completion", default_xp)
                notes = f"{source_type.replace('_', ' ').title()} XP (activity_id={moodle_activity_id})"
                if grade:
                    notes += f", grade={grade}"
                
                if self.award_engagement_xp(user.id, course.id, xp_amount, source_type, 
                                          str(moodle_activity_id), notes):
                    self.commit_changes_safely(f"Awarded {xp_amount} XP for {source_type} to user {user.id} in course {course.id}")
                    
                    # Send engagement XP notification for real-time popup
                    activity_title = f"{source_type.replace('_', ' ').title()}"
                    self.send_engagement_xp_notifications(user.id, course.id, xp_amount, activity_title, source_type)
                    
                    self.update_daily_quest_progress(user.id, course.id, xp_amount)
                else:
                    logger.debug(f"Duplicate {source_type} XP award prevented for user {user.id}")
            
            return True
            
        except ValueError as e:
            logger.error(str(e))
            return False
        except Exception as e:
            logger.error(f"Error processing {source_type}: {e}")
            raise

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, cast, Date
import logging

from app.models.daily_quest import DailyQuest, UserDailyQuest, DailyQuestProgress, QuestStatusEnum, QuestTypeEnum
from app.models.user import User
from app.models.quest import ExperiencePoints, StudentProgress
from app.models.streak import UserStreak

logger = logging.getLogger(__name__)

class DailyQuestService:
    def __init__(self, db: Session):
        self.db = db

    def seed_daily_login_quest(self) -> Dict[str, Any]:
        """
        Seed the database with the daily login quest template.
        """
        # Check if daily login quest already exists
        existing_quest = self.db.query(DailyQuest).filter(
            DailyQuest.quest_type == QuestTypeEnum.DAILY_LOGIN.value
        ).first()

        if existing_quest:
            logger.info("Daily login quest template already exists")
            return {
                "success": True,
                "message": "Daily login quest template already exists",
                "quest_id": existing_quest.quest_id
            }

        # Create the daily login quest template
        daily_login_quest = DailyQuest(
            quest_type=QuestTypeEnum.DAILY_LOGIN.value,
            title="Daily Login",
            description="Log in to MoodleQuest to start your daily adventure!",
            xp_reward=10,
            target_count=1,
            criteria={"action": "login", "count": 1},
            is_active=True,
            priority=1,
            difficulty_level=1,
            created_at=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )

        try:
            self.db.add(daily_login_quest)
            self.db.commit()
            self.db.refresh(daily_login_quest)
            
            logger.info(f"Created daily login quest template with ID: {daily_login_quest.quest_id}")
            return {
                "success": True,
                "message": "Daily login quest template created successfully",
                "quest_id": daily_login_quest.quest_id
            }
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating daily login quest template: {e}")
            raise

    def generate_daily_login_quest_for_user(self, user_id: int, target_date: date = None) -> Optional[UserDailyQuest]:
        """
        Generate a daily login quest for a specific user on a specific date.
        """
        if target_date is None:
            target_date = date.today()

        # Check if user already has a daily login quest for this date
        existing_quest = self.db.query(UserDailyQuest).join(DailyQuest).filter(
            and_(
                UserDailyQuest.user_id == user_id,
                DailyQuest.quest_type == QuestTypeEnum.DAILY_LOGIN.value,
                cast(UserDailyQuest.quest_date, Date) == target_date
            )
        ).first()

        if existing_quest:
            logger.info(f"User {user_id} already has daily login quest for {target_date}")
            return existing_quest

        # Get the daily login quest template
        quest_template = self.db.query(DailyQuest).filter(
            and_(
                DailyQuest.quest_type == QuestTypeEnum.DAILY_LOGIN.value,
                DailyQuest.is_active == True
            )
        ).first()

        if not quest_template:
            logger.error("No active daily login quest template found")
            return None

        # Calculate expiration (end of day)
        expires_at = datetime.combine(target_date + timedelta(days=1), datetime.min.time())

        # Create user daily quest record
        user_quest = UserDailyQuest(
            user_id=user_id,
            daily_quest_id=quest_template.quest_id,
            quest_date=datetime.combine(target_date, datetime.min.time()),
            status=QuestStatusEnum.AVAILABLE.value,
            current_progress=0,
            target_progress=quest_template.target_count,
            expires_at=expires_at,
            quest_metadata=quest_template.criteria,
            created_at=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )

        try:
            self.db.add(user_quest)
            self.db.commit()
            self.db.refresh(user_quest)
            
            logger.info(f"Generated daily login quest for user {user_id} on {target_date}")
            return user_quest
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error generating daily login quest: {e}")
            raise

    def complete_daily_login_quest(self, user_id: int) -> Dict[str, Any]:
        """
        Complete the daily login quest for a user.
        Returns information about the completion and XP awarded.
        """
        today = date.today()
        
        # Find the user's daily login quest for today
        user_quest = self.db.query(UserDailyQuest).join(DailyQuest).filter(
            and_(
                UserDailyQuest.user_id == user_id,
                DailyQuest.quest_type == QuestTypeEnum.DAILY_LOGIN.value,
                cast(UserDailyQuest.quest_date, Date) == today,
                UserDailyQuest.status == QuestStatusEnum.AVAILABLE.value
            )
        ).first()

        if not user_quest:
            # Generate the quest if it doesn't exist
            user_quest = self.generate_daily_login_quest_for_user(user_id, today)
            if not user_quest:
                return {
                    "success": False,
                    "message": "Could not generate daily login quest",
                    "xp_awarded": 0
                }

        # Check if already completed
        if user_quest.status == QuestStatusEnum.COMPLETED.value:
            return {
                "success": False,
                "message": "Daily login quest already completed today",
                "xp_awarded": 0
            }

        # Complete the quest
        user_quest.status = QuestStatusEnum.COMPLETED.value
        user_quest.current_progress = user_quest.target_progress
        user_quest.completed_at = datetime.utcnow()
        user_quest.started_at = user_quest.started_at or datetime.utcnow()
        user_quest.xp_awarded = user_quest.daily_quest.xp_reward
        user_quest.last_updated = datetime.utcnow()

        # Record progress
        progress_record = DailyQuestProgress(
            user_daily_quest_id=user_quest.id,
            action_type="daily_login",
            action_data={"login_time": datetime.utcnow().isoformat()},
            progress_increment=1,
            recorded_at=datetime.utcnow()
        )
        self.db.add(progress_record)

        # Award XP
        xp_record = ExperiencePoints(
            user_id=user_id,
            course_id=None,
            amount=user_quest.daily_quest.xp_reward,
            source_type="daily_quest",
            source_id=user_quest.daily_quest.quest_id,
            awarded_at=datetime.utcnow(),
            notes=f"Daily quest: {user_quest.daily_quest.title}"
        )
        self.db.add(xp_record)

        # Update student progress
        self._update_student_progress(user_id, user_quest.daily_quest.xp_reward)

        try:
            self.db.commit()
            logger.info(f"Completed daily login quest for user {user_id}, awarded {user_quest.daily_quest.xp_reward} XP")
            return {
                "success": True,
                "message": "Daily login quest completed successfully!",
                "xp_awarded": user_quest.daily_quest.xp_reward,
                "quest": user_quest
            }
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error completing daily login quest: {e}")
            raise

    def get_user_daily_quests(self, user_id: int, target_date: date = None) -> List[UserDailyQuest]:
        """Get all daily quests for a user on a specific date."""
        if target_date is None:
            target_date = date.today()
        
        return self.db.query(UserDailyQuest).join(DailyQuest).filter(
            and_(
                UserDailyQuest.user_id == user_id,
                cast(UserDailyQuest.quest_date, Date) == target_date
            )
        ).order_by(DailyQuest.priority.desc()).all()

    def get_user_quest_summary(self, user_id: int) -> Dict[str, Any]:
        """Get user's daily quest summary for today."""
        today = date.today()
        
        # Ensure user has daily login quest for today
        self.generate_daily_login_quest_for_user(user_id, today)
          # Get all quests for today
        quests = self.get_user_daily_quests(user_id, today)
        
        total_quests = len(quests)
        completed_quests = len([q for q in quests if q.status == QuestStatusEnum.COMPLETED.value])
        total_xp_earned = sum(q.xp_awarded for q in quests if q.status == QuestStatusEnum.COMPLETED.value)
        
        return {
            "date": today.isoformat(),
            "total_quests": total_quests,
            "completed_quests": completed_quests,
            "completion_percentage": (completed_quests / total_quests * 100) if total_quests > 0 else 0,
            "total_xp_earned": total_xp_earned,
            "quests": quests
        }

    def _update_student_progress(self, user_id: int, xp_amount: int):
        """Update student progress and handle login streaks."""
        progress = self.db.query(StudentProgress).filter(
            StudentProgress.user_id == user_id
        ).first()

        if progress:
            progress.total_exp += xp_amount
            progress.last_activity = datetime.utcnow()
        else:
            # Create new progress record
            progress = StudentProgress(
                user_id=user_id,
                course_id=None,
                total_exp=xp_amount,
                quests_completed=0,
                badges_earned=0,
                study_hours=0.0,
                streak_days=0,  # Will be updated by streak system
                last_activity=datetime.utcnow()
            )
            self.db.add(progress)

        # Update login streak for daily login quests
        self._update_login_streak(user_id)

    def _update_login_streak(self, user_id: int):
        """Update login streak for daily login quests using the streak table."""
        today = date.today()
        
        # Get or create login streak record
        login_streak = self.db.query(UserStreak).filter(
            and_(
                UserStreak.user_id == user_id,
                UserStreak.streak_type == "daily_login"
            )
        ).first()
        
        if not login_streak:
            # Create new streak record
            login_streak = UserStreak(
                user_id=user_id,
                streak_type="daily_login",
                current_streak=1,
                longest_streak=1,
                last_activity_date=today,
                start_date=today
            )
            self.db.add(login_streak)
        else:
            # Check if this is a consecutive day
            yesterday = today - timedelta(days=1)
            
            if login_streak.last_activity_date == yesterday:
                # Consecutive day - increment streak
                login_streak.current_streak += 1
                login_streak.longest_streak = max(login_streak.longest_streak, login_streak.current_streak)
            elif login_streak.last_activity_date == today:
                # Same day - no change (already logged in today)
                return
            else:
                # Streak broken - reset
                login_streak.current_streak = 1
                login_streak.start_date = today
            
            login_streak.last_activity_date = today

        # Update student progress with current streak
        progress = self.db.query(StudentProgress).filter(
            StudentProgress.user_id == user_id
        ).first()
        
        if progress:
            progress.streak_days = login_streak.current_streak

    def expire_old_quests(self):
        """Mark expired quests as expired. Should be run daily via cron job."""
        now = datetime.utcnow()
        expired_quests = self.db.query(UserDailyQuest).filter(
            and_(
                UserDailyQuest.status == QuestStatusEnum.AVAILABLE.value,
                UserDailyQuest.expires_at < now
            )
        ).all()
        
        for quest in expired_quests:
            quest.status = QuestStatusEnum.EXPIRED.value
            quest.last_updated = now
        
        if expired_quests:
            self.db.commit()
            logger.info(f"Expired {len(expired_quests)} old quests")
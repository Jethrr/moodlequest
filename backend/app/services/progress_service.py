import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract, case
from sqlalchemy.sql import text

from app.models.user import User
from app.models.quest import Quest, QuestProgress
from app.models.badge import Badge, UserBadge
from app.models.activity_log import ActivityLog
from app.models.course import Course
from app.models.enrollment import CourseEnrollment
from app.models.streak import UserStreak
from app.models.leaderboard import ExperiencePoint, StudentProgress
from app.schemas.progress import (
    WeeklyDataPoint, MonthlyDataPoint, StreakDay
)

logger = logging.getLogger(__name__)


class ProgressService:
    def __init__(self, db: Session):
        self.db = db

    def get_weekly_activity_data(self, user_id: int) -> List[WeeklyDataPoint]:
        """Get weekly activity data for the last 7 days from database"""
        try:
            # Get the start of the week (Monday)
            today = datetime.now()
            start_of_week = today - timedelta(days=today.weekday())
            start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Get experience points earned per day for the last 7 days
            exp_query = self.db.query(
                func.date(ExperiencePoint.awarded_at).label('date'),
                func.sum(ExperiencePoint.amount).label('total_exp'),
                func.count(ExperiencePoint.exp_id).label('exp_events')
            ).filter(
                ExperiencePoint.user_id == user_id,
                ExperiencePoint.awarded_at >= start_of_week - timedelta(days=6),
                ExperiencePoint.awarded_at < start_of_week + timedelta(days=7)
            ).group_by(
                func.date(ExperiencePoint.awarded_at)
            ).all()
            
            # Get quests completed per day for the last 7 days
            quest_query = self.db.query(
                func.date(QuestProgress.completed_at).label('date'),
                func.count(QuestProgress.progress_id).label('quests_completed')
            ).filter(
                QuestProgress.user_id == user_id,
                QuestProgress.status == 'completed',
                QuestProgress.completed_at >= start_of_week - timedelta(days=6),
                QuestProgress.completed_at < start_of_week + timedelta(days=7)
            ).group_by(
                func.date(QuestProgress.completed_at)
            ).all()
            
            # Create a mapping for the data
            exp_data = {str(record.date): record.total_exp for record in exp_query}
            quest_data = {str(record.date): record.quests_completed for record in quest_query}
            
            # Generate data for each day of the week
            weekly_data = []
            day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            
            for i in range(7):
                current_date = start_of_week + timedelta(days=i)
                date_str = current_date.strftime("%Y-%m-%d")
                
                exp_reward = exp_data.get(date_str, 0)
                quests_completed = quest_data.get(date_str, 0)
                
                weekly_data.append(WeeklyDataPoint(
                    day=day_names[i],
                    exp_reward=int(exp_reward),
                    quests_completed=int(quests_completed)
                ))
            
            return weekly_data
            
        except Exception as e:
            logger.error(f"Error getting weekly activity data for user {user_id}: {e}")
            # Return empty data on error
            return [
                WeeklyDataPoint(day="Mon", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Tue", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Wed", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Thu", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Fri", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Sat", exp_reward=0, quests_completed=0),
                WeeklyDataPoint(day="Sun", exp_reward=0, quests_completed=0),
            ]

    def get_monthly_activity_data(self, user_id: int) -> List[MonthlyDataPoint]:
        """Get monthly activity data for the last 4 weeks from database"""
        try:
            # Get the start of the current week (Monday)
            today = datetime.now()
            start_of_current_week = today - timedelta(days=today.weekday())
            start_of_current_week = start_of_current_week.replace(hour=0, minute=0, second=0, microsecond=0)
            
            monthly_data = []
            
            # Get data for the last 4 weeks
            for week_num in range(4):
                week_start = start_of_current_week - timedelta(weeks=3-week_num)
                week_end = week_start + timedelta(days=7)
                
                # Get experience points for this week
                exp_query = self.db.query(
                    func.sum(ExperiencePoint.amount).label('total_exp')
                ).filter(
                    ExperiencePoint.user_id == user_id,
                    ExperiencePoint.awarded_at >= week_start,
                    ExperiencePoint.awarded_at < week_end
                ).scalar()
                
                # Get quests completed for this week
                quest_query = self.db.query(
                    func.count(QuestProgress.progress_id).label('quests_completed')
                ).filter(
                    QuestProgress.user_id == user_id,
                    QuestProgress.status == 'completed',
                    QuestProgress.completed_at >= week_start,
                    QuestProgress.completed_at < week_end
                ).scalar()
                
                exp_reward = exp_query or 0
                quests_completed = quest_query or 0
                
                monthly_data.append(MonthlyDataPoint(
                    week=f"Week {week_num + 1}",
                    exp_reward=int(exp_reward),
                    quests_completed=int(quests_completed)
                ))
            
            return monthly_data
            
        except Exception as e:
            logger.error(f"Error getting monthly activity data for user {user_id}: {e}")
            # Return empty data on error
            return [
                MonthlyDataPoint(week="Week 1", exp_reward=0, quests_completed=0),
                MonthlyDataPoint(week="Week 2", exp_reward=0, quests_completed=0),
                MonthlyDataPoint(week="Week 3", exp_reward=0, quests_completed=0),
                MonthlyDataPoint(week="Week 4", exp_reward=0, quests_completed=0),
            ]

    def get_streak_data_for_graph(self, user_id: int) -> List[StreakDay]:
        """Generate real streak data for the last 105 days (15 weeks) from database, optimized for performance."""
        try:
            streak_data = []
            today = datetime.now()
            start_date = today - timedelta(days=104)
            date_list = [(start_date + timedelta(days=i)).date() for i in range(105)]

            # Batch query for all exp activities in range
            exp_activities = set(
                r[0] for r in self.db.query(func.date(ExperiencePoint.awarded_at))
                .filter(
                    ExperiencePoint.user_id == user_id,
                    ExperiencePoint.awarded_at >= start_date,
                    ExperiencePoint.awarded_at <= today
                ).distinct().all()
            )

            # Batch query for all quest completions in range
            quest_activities = set(
                r[0] for r in self.db.query(func.date(QuestProgress.completed_at))
                .filter(
                    QuestProgress.user_id == user_id,
                    QuestProgress.status == 'completed',
                    QuestProgress.completed_at >= start_date,
                    QuestProgress.completed_at <= today
                ).distinct().all()
            )

            # Batch query for all activity logs in range
            log_activities = set(
                r[0] for r in self.db.query(func.date(ActivityLog.timestamp))
                .filter(
                    ActivityLog.user_id == user_id,
                    ActivityLog.timestamp >= start_date,
                    ActivityLog.timestamp <= today
                ).distinct().all()
            )

            for d in date_list:
                day_of_week = d.weekday()
                total_activities = (
                    (1 if d in exp_activities else 0) +
                    (1 if d in quest_activities else 0) +
                    (1 if d in log_activities else 0)
                )
                if total_activities == 0:
                    intensity = 0
                elif total_activities == 1:
                    intensity = 1
                elif total_activities == 2:
                    intensity = 2
                else:
                    intensity = 3
                streak_data.append(StreakDay(
                    date=d.strftime('%Y-%m-%d'),
                    intensity=intensity,
                    dayOfWeek=day_of_week
                ))
            return streak_data
        except Exception as e:
            logger.error(f"Error getting streak data for user {user_id}: {e}")
            return [] 
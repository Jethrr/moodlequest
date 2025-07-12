from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from typing import List, Optional
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.models.badge import UserBadge
from app.models.quest import QuestProgress, Quest
from app.models.user import User
from app.auth.dependencies import get_current_user_optional

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/engagement")
async def get_engagement_analytics(
    time_range: str = Query("week", description="Time range: week, month, semester"),
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get engagement analytics data including active users, badges earned, and quests completed
    """
    try:
        # Calculate date range based on time_range parameter
        end_date = datetime.now()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
        elif time_range == "semester":
            start_date = end_date - timedelta(days=90)
        else:
            raise HTTPException(status_code=400, detail="Invalid time range")

        # Base query conditions
        base_conditions = [
            ActivityLog.timestamp >= start_date,
            ActivityLog.timestamp <= end_date
        ]

        # Filter by course if specified
        if course_id:
            base_conditions.append(ActivityLog.related_entity_id == course_id)

        # Get daily active users
        daily_active_users = db.query(
            func.date(ActivityLog.timestamp).label('day'),
            func.count(func.distinct(ActivityLog.user_id)).label('activeUsers')
        ).filter(
            and_(*base_conditions)
        ).group_by(
            func.date(ActivityLog.timestamp)
        ).order_by(
            func.date(ActivityLog.timestamp)
        ).all()

        # Get daily badges earned
        badge_conditions = [
            UserBadge.awarded_at >= start_date,
            UserBadge.awarded_at <= end_date
        ]
        if course_id:
            badge_conditions.append(UserBadge.course_id == course_id)

        daily_badges_earned = db.query(
            func.date(UserBadge.awarded_at).label('day'),
            func.count(UserBadge.user_badge_id).label('badgesEarned')
        ).filter(
            and_(*badge_conditions)
        ).group_by(
            func.date(UserBadge.awarded_at)
        ).order_by(
            func.date(UserBadge.awarded_at)
        ).all()

        # Get daily quests completed
        quest_conditions = [
            QuestProgress.completed_at >= start_date,
            QuestProgress.completed_at <= end_date,
            QuestProgress.status == 'completed'
        ]
        if course_id:
            # Join with quests table to filter by course
            daily_quests_completed = db.query(
                func.date(QuestProgress.completed_at).label('day'),
                func.count(QuestProgress.progress_id).label('questsCompleted')
            ).join(
                Quest, QuestProgress.quest_id == Quest.quest_id
            ).filter(
                and_(*quest_conditions, Quest.course_id == course_id)
            ).group_by(
                func.date(QuestProgress.completed_at)
            ).order_by(
                func.date(QuestProgress.completed_at)
            ).all()
        else:
            daily_quests_completed = db.query(
                func.date(QuestProgress.completed_at).label('day'),
                func.count(QuestProgress.progress_id).label('questsCompleted')
            ).filter(
                and_(*quest_conditions)
            ).group_by(
                func.date(QuestProgress.completed_at)
            ).order_by(
                func.date(QuestProgress.completed_at)
            ).all()

        # Combine all data by day
        engagement_data = {}
        
        # Initialize all days in the range
        current_date = start_date.date()
        while current_date <= end_date.date():
            day_name = current_date.strftime("%A")
            engagement_data[current_date] = {
                "day": day_name,
                "activeUsers": 0,
                "badgesEarned": 0,
                "questsCompleted": 0
            }
            current_date += timedelta(days=1)

        # Fill in actual data
        for record in daily_active_users:
            day_name = record.day.strftime("%A")
            engagement_data[record.day]["activeUsers"] = record.activeUsers

        for record in daily_badges_earned:
            day_name = record.day.strftime("%A")
            engagement_data[record.day]["badgesEarned"] = record.badgesEarned

        for record in daily_quests_completed:
            day_name = record.day.strftime("%A")
            engagement_data[record.day]["questsCompleted"] = record.questsCompleted

        # Convert to list format for frontend
        result = list(engagement_data.values())

        return {
            "success": True,
            "data": result,
            "timeRange": time_range,
            "courseId": course_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching engagement analytics: {str(e)}")

@router.get("/summary")
async def get_engagement_summary(
    time_range: str = Query("week", description="Time range: week, month, semester"),
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for engagement analytics
    """
    try:
        # Calculate date range
        end_date = datetime.now()
        if time_range == "week":
            start_date = end_date - timedelta(days=7)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
        elif time_range == "semester":
            start_date = end_date - timedelta(days=90)
        else:
            raise HTTPException(status_code=400, detail="Invalid time range")

        # Base conditions
        base_conditions = [
            ActivityLog.timestamp >= start_date,
            ActivityLog.timestamp <= end_date
        ]

        if course_id:
            base_conditions.append(ActivityLog.related_entity_id == course_id)

        # Total active users
        total_active_users = db.query(
            func.count(func.distinct(ActivityLog.user_id))
        ).filter(and_(*base_conditions)).scalar()

        # Total badges earned
        badge_conditions = [
            UserBadge.awarded_at >= start_date,
            UserBadge.awarded_at <= end_date
        ]
        if course_id:
            badge_conditions.append(UserBadge.course_id == course_id)

        total_badges_earned = db.query(
            func.count(UserBadge.user_badge_id)
        ).filter(and_(*badge_conditions)).scalar()

        # Total quests completed
        quest_conditions = [
            QuestProgress.completed_at >= start_date,
            QuestProgress.completed_at <= end_date,
            QuestProgress.status == 'completed'
        ]

        if course_id:
            total_quests_completed = db.query(
                func.count(QuestProgress.progress_id)
            ).join(
                Quest, QuestProgress.quest_id == Quest.quest_id
            ).filter(
                and_(*quest_conditions, Quest.course_id == course_id)
            ).scalar()
        else:
            total_quests_completed = db.query(
                func.count(QuestProgress.progress_id)
            ).filter(and_(*quest_conditions)).scalar()

        return {
            "success": True,
            "data": {
                "totalActiveUsers": total_active_users or 0,
                "totalBadgesEarned": total_badges_earned or 0,
                "totalQuestsCompleted": total_quests_completed or 0,
                "timeRange": time_range,
                "courseId": course_id
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching engagement summary: {str(e)}") 
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class WeeklyDataPoint(BaseModel):
    """Weekly activity data point"""
    day: str
    exp_reward: int
    quests_completed: int


class MonthlyDataPoint(BaseModel):
    """Monthly activity data point"""
    week: str
    exp_reward: int
    quests_completed: int


class StreakDay(BaseModel):
    """Daily streak data"""
    date: str
    intensity: int
    dayOfWeek: int


class ProgressOverviewResponse(BaseModel):
    """Main progress overview response"""
    success: bool
    message: str
    weekly_data: List[WeeklyDataPoint]
    monthly_data: List[MonthlyDataPoint]
    streak_data: List[StreakDay]


class DetailedProgressResponse(BaseModel):
    """Detailed progress with additional metrics"""
    success: bool
    message: str
    weekly_data: List[WeeklyDataPoint]
    monthly_data: List[MonthlyDataPoint]
    streak_data: List[StreakDay]
    recent_activities: List[Dict[str, Any]]
    badges_earned: List[Dict[str, Any]] 
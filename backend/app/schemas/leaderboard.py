from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Base schemas
class LeaderboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    metric_type: str  # 'exp', 'quests_completed', 'badges_earned', 'engagement_score'
    timeframe: str  # 'weekly', 'monthly', 'all_time'
    is_active: bool = True

class LeaderboardCreate(LeaderboardBase):
    pass

class LeaderboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    metric_type: Optional[str] = None
    timeframe: Optional[str] = None
    is_active: Optional[bool] = None

class LeaderboardEntryBase(BaseModel):
    user_id: int
    score: Decimal
    rank: Optional[int] = None

class LeaderboardEntryResponse(LeaderboardEntryBase):
    model_config = ConfigDict(from_attributes=True)
    
    entry_id: int
    leaderboard_id: int
    last_updated: datetime
    
    # User details
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None

class LeaderboardResponse(LeaderboardBase):
    model_config = ConfigDict(from_attributes=True)
    
    leaderboard_id: int
    created_at: datetime
    last_updated: datetime
    entries: List[LeaderboardEntryResponse] = []

class StudentProgressBase(BaseModel):
    user_id: int
    course_id: int
    total_exp: int = 0
    quests_completed: int = 0
    badges_earned: int = 0
    engagement_score: Optional[Decimal] = None
    study_hours: Decimal = Decimal('0')
    last_activity: Optional[datetime] = None
    streak_days: int = 0

class StudentProgressCreate(StudentProgressBase):
    pass

class StudentProgressUpdate(BaseModel):
    total_exp: Optional[int] = None
    quests_completed: Optional[int] = None
    badges_earned: Optional[int] = None
    engagement_score: Optional[Decimal] = None
    study_hours: Optional[Decimal] = None
    last_activity: Optional[datetime] = None
    streak_days: Optional[int] = None

class StudentProgressResponse(StudentProgressBase):
    model_config = ConfigDict(from_attributes=True)
    
    progress_id: int
    last_updated: datetime
    
    # User details
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ExperiencePointBase(BaseModel):
    user_id: int
    course_id: Optional[int] = None
    amount: int
    source_type: str  # 'quest_completion', 'badge_earned', 'bonus', 'manual'
    source_id: Optional[int] = None
    awarded_by: Optional[int] = None
    notes: Optional[str] = None

class ExperiencePointCreate(ExperiencePointBase):
    pass

class ExperiencePointResponse(ExperiencePointBase):
    model_config = ConfigDict(from_attributes=True)
    
    exp_id: int
    awarded_at: datetime

# Leaderboard summary responses
class LeaderboardSummary(BaseModel):
    leaderboard_id: int
    name: str
    metric_type: str
    timeframe: str
    total_participants: int
    top_score: Optional[Decimal] = None
    last_updated: datetime

class TopStudentResponse(BaseModel):
    user_id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    score: Decimal
    rank: int
    total_exp: Optional[int] = None
    quests_completed: Optional[int] = None
    badges_earned: Optional[int] = None

class CourseLeaderboardResponse(BaseModel):
    course_id: int
    course_name: str
    leaderboards: List[LeaderboardSummary] = []
    top_students: List[TopStudentResponse] = []

# Request models for filtering and pagination
class LeaderboardFilter(BaseModel):
    course_id: Optional[int] = None
    metric_type: Optional[str] = None
    timeframe: Optional[str] = None
    is_active: Optional[bool] = True
    limit: int = 10
    offset: int = 0

class StudentProgressFilter(BaseModel):
    course_id: Optional[int] = None
    user_id: Optional[int] = None
    min_exp: Optional[int] = None
    min_quests: Optional[int] = None
    limit: int = 50
    offset: int = 0 
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    badge_type: str
    image_url: Optional[str] = "/badges/default-badge.png"
    criteria: Dict[str, Any]
    exp_value: int = 0
    is_active: bool = True


class BadgeCreate(BadgeBase):
    pass


class BadgeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    badge_type: Optional[str] = None
    image_url: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    exp_value: Optional[int] = None
    is_active: Optional[bool] = None


class Badge(BadgeBase):
    badge_id: int
    created_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True


class UserBadgeBase(BaseModel):
    user_id: int
    badge_id: int
    progress: Dict[str, Any] = {}


class UserBadgeCreate(UserBadgeBase):
    pass


class UserBadge(UserBadgeBase):
    id: int
    earned_at: datetime
    badge: Badge
    
    class Config:
        from_attributes = True


class UserBadgeProgress(BaseModel):
    badge_id: int
    badge: Badge
    earned: bool
    earned_at: Optional[datetime] = None
    progress: Dict[str, Any] = {}
    completion_percentage: float = 0.0
    
    class Config:
        from_attributes = True


class BadgeSystemResponse(BaseModel):
    total_badges: int
    earned_badges: int
    completion_percentage: float
    earned: List[UserBadge]
    locked: List[UserBadgeProgress]
    
    class Config:
        from_attributes = True

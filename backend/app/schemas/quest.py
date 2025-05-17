from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class QuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    exp_reward: int = 0
    quest_type: str
    validation_method: str
    validation_criteria: Optional[Dict[str, Any]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    difficulty_level: int = 1

class QuestCreate(QuestBase):
    pass

class QuestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    exp_reward: Optional[int] = None
    quest_type: Optional[str] = None
    validation_method: Optional[str] = None
    validation_criteria: Optional[Dict[str, Any]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    difficulty_level: Optional[int] = None

class Quest(QuestBase):
    quest_id: int
    creator_id: int
    created_at: datetime
    last_updated: datetime

    class Config:
        from_attributes = True 
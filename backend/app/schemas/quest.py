from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, computed_field

class QuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    quest_type: str
    validation_method: str
    validation_criteria: Optional[Dict[str, Any]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    difficulty_level: int = 1
    
    @computed_field
    @property
    def exp_reward(self) -> int:
        """Calculate XP reward based on difficulty level"""
        difficulty_xp_map = {
            1: 20,  # Easy
            2: 50,  # Medium
            3: 100, # Hard
            4: 150  # Epic (bonus level)
        }
        return difficulty_xp_map.get(self.difficulty_level, 50)  # Default to Medium if invalid

class QuestCreate(QuestBase):
    pass

class QuestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
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
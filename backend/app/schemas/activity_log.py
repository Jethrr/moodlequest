from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class ActivityLogCreate(BaseModel):
    user_id: int
    action_type: str
    action_details: Optional[Dict] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    exp_change: int = 0

class ActivityLogRead(ActivityLogCreate):
    log_id: int
    timestamp: datetime

    class Config:
        orm_mode = True

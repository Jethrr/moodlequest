from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TeacherProfileResponse(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    joined_date: datetime
    total_courses: int
    active_courses: int
    total_students: int
    quests_created: int
    badges_designed: int
    account_status: str

    class Config:
        from_attributes = True


class TeacherProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    profile_image_url: Optional[str] = Field(None, max_length=255)

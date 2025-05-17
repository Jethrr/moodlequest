from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: Optional[str] = None
    moodle_user_id: Optional[str] = None
    moodle_token: Optional[str] = None


class UserResponse(UserBase):
    id: int
    moodle_user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str
    service: Optional[str] = "modquest"


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


class MoodleToken(BaseModel):
    token: str
    error: Optional[str] = None


class MoodleLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[UserResponse] = None
    error: Optional[str] = None


class MoodleConfigBase(BaseModel):
    base_url: str
    service_name: str = "modquest"


class MoodleConfigCreate(MoodleConfigBase):
    pass


class MoodleConfigResponse(MoodleConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 
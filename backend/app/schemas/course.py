from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Base Course Schema
class CourseBase(BaseModel):
    title: str
    short_name: str
    description: Optional[str] = None
    visible: Optional[bool] = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format: Optional[str] = None
    category_id: Optional[int] = None


# Schema for creating a new course
class CourseCreate(CourseBase):
    moodle_course_id: int


# Schema for updating a course
class CourseUpdate(BaseModel):
    title: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    visible: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format: Optional[str] = None
    category_id: Optional[int] = None


# Schema for course enrollment in responses
class CourseEnrollmentInfo(BaseModel):
    role: str
    completion: float = 0.0
    last_access: Optional[datetime] = None
    enrolled_at: datetime

    class Config:
        orm_mode = True


# Schema for course in responses
class CourseResponse(CourseBase):
    id: int
    moodle_course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Extended course response with enrollment info
class CourseWithEnrollment(CourseResponse):
    enrollment: Optional[CourseEnrollmentInfo] = None


# Schema for multiple courses in responses
class CoursesResponse(BaseModel):
    courses: List[CourseWithEnrollment]
    count: int


# Schema for course enrollment in requests
class CourseEnrollmentCreate(BaseModel):
    user_id: int
    course_id: int
    role: str = "student"
    completion: float = 0.0
    last_access: Optional[datetime] = None


# Schema for updating enrollment
class CourseEnrollmentUpdate(BaseModel):
    role: Optional[str] = None
    completion: Optional[float] = None
    last_access: Optional[datetime] = None


# Schema for filtering courses
class CourseFilter(BaseModel):
    user_id: Optional[int] = None
    course_id: Optional[int] = None
    title: Optional[str] = None
    course_code: Optional[str] = None
    visible: Optional[bool] = None 
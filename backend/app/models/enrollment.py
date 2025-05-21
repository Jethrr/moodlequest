from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from app.database.connection import Base

class CourseEnrollment(Base):
    """Course enrollment model representing course_enrollments table from the schema."""
    __tablename__ = "course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    moodle_enrollment_id = Column(Integer, nullable=True)
    role = Column(String(50), nullable=False)
    status = Column(String(50), default="active")
    last_access = Column(DateTime(timezone=True), nullable=True)
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_modified = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Use string references to avoid circular imports
    course = relationship("Course", back_populates="enrollments")
    user = relationship("User", back_populates="enrollments")
    
    class Config:
        orm_mode = True 
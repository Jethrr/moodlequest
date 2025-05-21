from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime

from app.models.course import Course, CourseEnrollment
from app.schemas.course import CourseCreate, CourseUpdate, CourseFilter
from app.models.user import User


# Get course by ID
def get_course(db: Session, course_id: int) -> Optional[Course]:
    return db.query(Course).filter(Course.id == course_id).first()


# Get course by Moodle course ID
def get_course_by_moodle_id(db: Session, moodle_course_id: int) -> Optional[Course]:
    return db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()


# Get all courses
def get_courses(db: Session, skip: int = 0, limit: int = 100) -> List[Course]:
    return db.query(Course).offset(skip).limit(limit).all()


# Get courses for a user
def get_user_courses(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Tuple[Course, CourseEnrollment]]:
    return db.query(Course, CourseEnrollment)\
        .join(CourseEnrollment, CourseEnrollment.course_id == Course.id)\
        .filter(CourseEnrollment.user_id == user_id)\
        .offset(skip).limit(limit).all()


# Create a new course
def create_course(db: Session, course: CourseCreate) -> Course:
    db_course = Course(
        title=course.title,
        short_name=course.short_name,
        description=course.description,
        moodle_course_id=course.moodle_course_id,
        visible=course.visible,
        start_date=course.start_date,
        end_date=course.end_date,
        format=course.format,
        category_id=course.category_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


# Update existing course
def update_course(db: Session, course_id: int, course_data: CourseUpdate) -> Optional[Course]:
    db_course = get_course(db, course_id)
    if db_course is None:
        return None
        
    # Update only provided fields
    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db_course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_course)
    return db_course


# Delete a course
def delete_course(db: Session, course_id: int) -> bool:
    db_course = get_course(db, course_id)
    if db_course is None:
        return False
        
    db.delete(db_course)
    db.commit()
    return True


# Create a new course enrollment
def create_enrollment(db: Session, user_id: int, course_id: int, role: str = "student") -> Optional[CourseEnrollment]:
    # Check if user and course exist
    user = db.query(User).filter(User.id == user_id).first()
    course = get_course(db, course_id)
    
    if not user or not course:
        return None
    
    # Check if enrollment already exists
    existing = db.query(CourseEnrollment)\
        .filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()
    
    if existing:
        return existing
    
    # Create new enrollment
    db_enrollment = CourseEnrollment(
        user_id=user_id,
        course_id=course_id,
        role=role,
        last_access=datetime.utcnow()
    )
    
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


# Update an enrollment
def update_enrollment(
    db: Session, 
    user_id: int, 
    course_id: int, 
    completion: Optional[float] = None,
    role: Optional[str] = None,
    last_access: Optional[datetime] = None
) -> Optional[CourseEnrollment]:
    db_enrollment = db.query(CourseEnrollment)\
        .filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()
    
    if not db_enrollment:
        return None
    
    if completion is not None:
        db_enrollment.completion = completion
    
    if role is not None:
        db_enrollment.role = role
    
    if last_access is not None:
        db_enrollment.last_access = last_access
    
    db_enrollment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


# Filter courses
def filter_courses(db: Session, filters: CourseFilter, skip: int = 0, limit: int = 100) -> List[Course]:
    query = db.query(Course)
    
    if filters.user_id:
        query = query.join(CourseEnrollment, CourseEnrollment.course_id == Course.id)\
            .filter(CourseEnrollment.user_id == filters.user_id)
    
    if filters.course_id:
        query = query.filter(Course.id == filters.course_id)
    
    if filters.title:
        query = query.filter(Course.title.ilike(f'%{filters.title}%'))
    
    if filters.course_code:
        query = query.filter(Course.short_name.ilike(f'%{filters.course_code}%'))
    
    if filters.visible is not None:
        query = query.filter(Course.visible == filters.visible)
    
    return query.offset(skip).limit(limit).all()


# Search courses by text
def search_courses(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Course]:
    return db.query(Course)\
        .filter(
            or_(
                Course.title.ilike(f'%{search_term}%'),
                Course.short_name.ilike(f'%{search_term}%'),
                Course.description.ilike(f'%{search_term}%')
            )
        )\
        .offset(skip).limit(limit).all() 
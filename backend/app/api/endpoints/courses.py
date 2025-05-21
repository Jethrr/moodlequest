from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from sqlalchemy.orm import Session
import requests
import logging
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.schemas.course import (
    CourseCreate, CourseResponse, CourseUpdate, 
    CourseWithEnrollment, CoursesResponse, CourseFilter
)
from app.crud import course as course_crud
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Constants
MOODLE_URL = settings.MOODLE_URL
MOODLE_API_PATH = "/webservice/rest/server.php"


@router.get("", response_model=CoursesResponse)
async def get_courses(
    user_id: Optional[int] = None,
    course_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get courses based on filters.
    If user_id is provided, returns courses for that user.
    If course_id is provided, returns that specific course.
    """
    if user_id:
        # Get courses for specific user
        course_enrollments = course_crud.get_user_courses(db, user_id, skip, limit)
        courses = []
        
        for c, e in course_enrollments:
            course_data = CourseWithEnrollment.from_orm(c)
            course_data.enrollment = {
                "role": e.role,
                "completion": e.completion,
                "last_access": e.last_access,
                "enrolled_at": e.enrolled_at
            }
            courses.append(course_data)
        
        return {"courses": courses, "count": len(courses)}
    
    elif course_id:
        # Get specific course
        db_course = course_crud.get_course(db, course_id)
        if not db_course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if user is enrolled in course
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == db_course.id
        ).first()
        
        course_data = CourseWithEnrollment.from_orm(db_course)
        if enrollment:
            course_data.enrollment = {
                "role": enrollment.role,
                "completion": enrollment.completion,
                "last_access": enrollment.last_access,
                "enrolled_at": enrollment.enrolled_at
            }
        
        return {"courses": [course_data], "count": 1}
    
    else:
        # Get all courses
        db_courses = course_crud.get_courses(db, skip, limit)
        
        courses = []
        for c in db_courses:
            # Check if user is enrolled in course
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == current_user.id,
                CourseEnrollment.course_id == c.id
            ).first()
            
            course_data = CourseWithEnrollment.from_orm(c)
            if enrollment:
                course_data.enrollment = {
                    "role": enrollment.role,
                    "completion": enrollment.completion,
                    "last_access": enrollment.last_access,
                    "enrolled_at": enrollment.enrolled_at
                }
            
            courses.append(course_data)
        
        return {"courses": courses, "count": len(courses)}


@router.post("/search", response_model=CoursesResponse)
async def search_courses(
    filters: CourseFilter = Body(...),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search courses based on filter criteria.
    """
    db_courses = course_crud.filter_courses(db, filters, skip, limit)
    
    courses = []
    for c in db_courses:
        # Check if user is enrolled
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == c.id
        ).first()
        
        course_data = CourseWithEnrollment.from_orm(c)
        if enrollment:
            course_data.enrollment = {
                "role": enrollment.role,
                "completion": enrollment.completion,
                "last_access": enrollment.last_access,
                "enrolled_at": enrollment.enrolled_at
            }
        
        courses.append(course_data)
    
    return {"courses": courses, "count": len(courses)}


@router.get("/sync", response_model=CoursesResponse)
async def sync_courses_from_moodle(
    background_tasks: BackgroundTasks,
    force: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync courses from Moodle for the current user.
    If force is True, will sync even if courses were recently synced.
    """
    if not current_user.moodle_token:
        raise HTTPException(status_code=401, detail="Moodle authentication required")
    
    # Run synchronization
    courses = await sync_user_courses(db, current_user, force)
    return {"courses": courses, "count": len(courses)}


async def sync_user_courses(
    db: Session, 
    user: User, 
    force: bool = False
) -> List[CourseWithEnrollment]:
    """
    Sync courses from Moodle for a specific user.
    Returns a list of courses with enrollment information.
    """
    # Check for existing courses and last sync time
    if not force:
        # Check if we've synced recently (within the last hour)
        # Implement this logic if needed
        pass
    
    try:
        # Call Moodle API to get user courses
        params = {
            "wstoken": user.moodle_token,
            "wsfunction": "core_enrol_get_users_courses",
            "userid": user.moodle_user_id,
            "moodlewsrestformat": "json"
        }
        
        response = requests.get(f"{MOODLE_URL}{MOODLE_API_PATH}", params=params)
        response.raise_for_status()
        
        moodle_courses = response.json()
        synced_courses = []
        
        for moodle_course in moodle_courses:
            # Check if course already exists
            db_course = course_crud.get_course_by_moodle_id(db, moodle_course["id"])
            
            # Create or update course
            if not db_course:
                # Create new course
                course_data = CourseCreate(
                    title=moodle_course["fullname"],
                    short_name=moodle_course["shortname"],
                    description=moodle_course.get("summary", ""),
                    moodle_course_id=moodle_course["id"],
                    visible=moodle_course.get("visible", 1) == 1,
                    start_date=datetime.fromtimestamp(moodle_course["startdate"]) if moodle_course.get("startdate") else None,
                    end_date=datetime.fromtimestamp(moodle_course["enddate"]) if moodle_course.get("enddate") and moodle_course["enddate"] > 0 else None,
                    format=moodle_course.get("format"),
                    category_id=moodle_course.get("category")
                )
                db_course = course_crud.create_course(db, course_data)
            else:
                # Update existing course
                course_data = CourseUpdate(
                    title=moodle_course["fullname"],
                    short_name=moodle_course["shortname"],
                    description=moodle_course.get("summary", ""),
                    visible=moodle_course.get("visible", 1) == 1,
                    start_date=datetime.fromtimestamp(moodle_course["startdate"]) if moodle_course.get("startdate") else None,
                    end_date=datetime.fromtimestamp(moodle_course["enddate"]) if moodle_course.get("enddate") and moodle_course["enddate"] > 0 else None,
                    format=moodle_course.get("format"),
                    category_id=moodle_course.get("category")
                )
                course_crud.update_course(db, db_course.id, course_data)
            
            # Create or update enrollment
            role = moodle_course.get("role", "student")
            progress = float(moodle_course.get("progress", 0))
            last_access = datetime.fromtimestamp(moodle_course["lastaccess"]) if moodle_course.get("lastaccess") else None
            
            # Check if enrollment exists
            db_enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == user.id,
                CourseEnrollment.course_id == db_course.id
            ).first()
            
            if not db_enrollment:
                # Create enrollment
                db_enrollment = course_crud.create_enrollment(
                    db, user.id, db_course.id, role
                )
            
            # Update enrollment
            course_crud.update_enrollment(
                db, user.id, db_course.id,
                completion=progress,
                role=role,
                last_access=last_access
            )
            
            # Add to result
            course_data = CourseWithEnrollment.from_orm(db_course)
            course_data.enrollment = {
                "role": role,
                "completion": progress,
                "last_access": last_access,
                "enrolled_at": db_enrollment.enrolled_at
            }
            synced_courses.append(course_data)
        
        return synced_courses
    
    except Exception as e:
        logger.error(f"Error syncing courses from Moodle: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error syncing courses from Moodle: {str(e)}"
        )


@router.get("/{course_id}", response_model=CourseWithEnrollment)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific course by ID.
    """
    db_course = course_crud.get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == db_course.id
    ).first()
    
    course_data = CourseWithEnrollment.from_orm(db_course)
    if enrollment:
        course_data.enrollment = {
            "role": enrollment.role,
            "completion": enrollment.completion,
            "last_access": enrollment.last_access,
            "enrolled_at": enrollment.enrolled_at
        }
    
    return course_data 
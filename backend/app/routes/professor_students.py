from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.database.connection import get_db
from app.models.user import User as UserModel
from app.models.course import Course as CourseModel
from app.models.enrollment import CourseEnrollment
from datetime import datetime

router = APIRouter(
    prefix="/professor",
    tags=["professor"],
    responses={404: {"description": "Not found"}},
)

@router.get("/students/{professor_id}")
def get_professor_students(
    professor_id: int,
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(50, ge=1, le=100, description="Number of students per page"),
    course_id: Optional[int] = Query(None, description="Filter by specific course ID"),
    search: Optional[str] = Query(None, description="Search by student name or email"),
    db: Session = Depends(get_db)
):
    """
    Get all students enrolled in courses handled by a specific professor.
    
    Args:
        professor_id: The professor's user ID (can be local ID or moodle_user_id)
        page: Page number for pagination (default: 1)
        limit: Number of students per page (default: 50, max: 100)
        course_id: Optional filter by specific course ID
        search: Optional search by student name or email
    
    Returns:
        Dictionary containing professor info, courses, students grouped by course, and pagination info
    """
    try:
        # Find the professor by ID (try both local id and moodle_user_id)
        professor = db.query(UserModel).filter(
            or_(
                UserModel.id == professor_id,
                UserModel.moodle_user_id == professor_id
            ),
            UserModel.role == "teacher",
            UserModel.is_active == True
        ).first()
        
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        # Get all courses taught by this professor
        courses_query = db.query(CourseModel).filter(
            CourseModel.teacher_id == professor.id,
            CourseModel.is_active == True
        )
        
        # Filter by specific course if requested
        if course_id:
            courses_query = courses_query.filter(CourseModel.id == course_id)
        
        courses = courses_query.all()
        
        if not courses:
            return {
                "success": True,
                "professor": {
                    "id": professor.id,
                    "name": f"{professor.first_name} {professor.last_name}",
                    "email": professor.email,
                    "moodle_user_id": professor.moodle_user_id
                },
                "courses": [],
                "students_by_course": {},
                "total_students": 0,
                "total_courses": 0,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total_pages": 0,
                    "has_next": False,
                    "has_previous": False
                }
            }
        
        course_ids = [course.id for course in courses]
        
        # Build the student query with joins
        students_query = db.query(
            CourseEnrollment,
            UserModel,
            CourseModel
        ).join(
            UserModel, CourseEnrollment.user_id == UserModel.id
        ).join(
            CourseModel, CourseEnrollment.course_id == CourseModel.id
        ).filter(
            CourseEnrollment.course_id.in_(course_ids),
            CourseEnrollment.role == "student",
            CourseEnrollment.status == "active",
            UserModel.is_active == True
        )
        
        # Apply search filter if provided
        if search:
            search_term = f"%{search.lower()}%"
            students_query = students_query.filter(
                or_(
                    UserModel.first_name.ilike(search_term),
                    UserModel.last_name.ilike(search_term),
                    UserModel.email.ilike(search_term),
                    (UserModel.first_name + ' ' + UserModel.last_name).ilike(search_term)
                )
            )
        
        # Order by course title and then by student last name
        students_query = students_query.order_by(
            CourseModel.title.asc(),
            UserModel.last_name.asc(),
            UserModel.first_name.asc()
        )
        
        # Get total count for pagination
        total_students = students_query.count()
        total_pages = (total_students + limit - 1) // limit
        
        # Apply pagination
        offset = (page - 1) * limit
        student_enrollments = students_query.offset(offset).limit(limit).all()
        
        # Group students by course
        students_by_course = {}
        all_students = []
        
        for enrollment, user, course in student_enrollments:
            course_key = course.id
            
            student_data = {
                "id": user.id,
                "moodle_user_id": user.moodle_user_id,
                "full_name": f"{user.first_name} {user.last_name}",
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "enrollment_status": enrollment.status,
                "enrollment_role": enrollment.role,
                "last_access": enrollment.last_access.isoformat() if enrollment.last_access else None,
                "time_enrolled": enrollment.time_created.isoformat() if enrollment.time_created else None,
                "course_id": course.id,
                "course_title": course.title,
                "course_code": course.course_code
            }
            
            # Add to course grouping
            if course_key not in students_by_course:
                students_by_course[course_key] = {
                    "course_info": {
                        "id": course.id,
                        "title": course.title,
                        "description": course.description,
                        "course_code": course.course_code,
                        "start_date": course.start_date.isoformat() if course.start_date else None,
                        "end_date": course.end_date.isoformat() if course.end_date else None
                    },
                    "students": []
                }
            
            students_by_course[course_key]["students"].append(student_data)
            all_students.append(student_data)
        
        # Calculate course summaries
        course_summaries = []
        for course in courses:
            student_count = len([s for s in all_students if s["course_id"] == course.id])
            course_summaries.append({
                "id": course.id,
                "title": course.title,
                "course_code": course.course_code,
                "student_count": student_count,
                "is_active": course.is_active
            })
        
        return {
            "success": True,
            "professor": {
                "id": professor.id,
                "name": f"{professor.first_name} {professor.last_name}",
                "email": professor.email,
                "moodle_user_id": professor.moodle_user_id
            },
            "courses": course_summaries,
            "students_by_course": students_by_course,
            "all_students": all_students,
            "total_students": total_students,
            "total_courses": len(courses),
            "pagination": {
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1,
                "offset": offset
            },
            "filters": {
                "course_id": course_id,
                "search": search
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error fetching professor students: {str(e)}")
        print(error_details)
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching professor students: {str(e)}"
        )

@router.get("/students/{professor_id}/summary")
def get_professor_students_summary(
    professor_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a summary of students and courses for a professor.
    
    Args:
        professor_id: The professor's user ID (can be local ID or moodle_user_id)
    
    Returns:
        Summary information about the professor's courses and student counts
    """
    try:
        # Find the professor
        professor = db.query(UserModel).filter(
            or_(
                UserModel.id == professor_id,
                UserModel.moodle_user_id == professor_id
            ),
            UserModel.role == "teacher",
            UserModel.is_active == True
        ).first()
        
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        # Get course and student counts
        courses = db.query(CourseModel).filter(
            CourseModel.teacher_id == professor.id,
            CourseModel.is_active == True
        ).all()
        
        total_courses = len(courses)
        course_ids = [course.id for course in courses]
        
        if not course_ids:
            return {
                "success": True,
                "professor": {
                    "id": professor.id,
                    "name": f"{professor.first_name} {professor.last_name}",
                    "email": professor.email
                },
                "summary": {
                    "total_courses": 0,
                    "total_students": 0,
                    "active_students": 0,
                    "courses": []
                }
            }
        
        # Count total active students across all courses
        total_students = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id.in_(course_ids),
            CourseEnrollment.role == "student",
            CourseEnrollment.status == "active"
        ).count()
        
        # Get course-wise student counts
        course_summaries = []
        for course in courses:
            student_count = db.query(CourseEnrollment).filter(
                CourseEnrollment.course_id == course.id,
                CourseEnrollment.role == "student",
                CourseEnrollment.status == "active"
            ).count()
            
            course_summaries.append({
                "id": course.id,
                "title": course.title,
                "course_code": course.course_code,
                "student_count": student_count,
                "start_date": course.start_date.isoformat() if course.start_date else None,
                "end_date": course.end_date.isoformat() if course.end_date else None
            })
        
        return {
            "success": True,
            "professor": {
                "id": professor.id,
                "name": f"{professor.first_name} {professor.last_name}",
                "email": professor.email,
                "moodle_user_id": professor.moodle_user_id
            },
            "summary": {
                "total_courses": total_courses,
                "total_students": total_students,
                "active_students": total_students,  # Since we're only counting active ones
                "courses": course_summaries
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching professor summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching professor summary: {str(e)}"
        )

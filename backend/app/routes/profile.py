from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import CourseEnrollment
from app.models.quest import Quest
from app.models.badge import Badge
from app.schemas.teacher_profile import TeacherProfileResponse
from app.utils.auth import get_current_active_user, get_role_required
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/teacher", response_model=TeacherProfileResponse)
async def get_teacher_profile(
    current_user: User = Depends(get_role_required("teacher")),
    db: Session = Depends(get_db)
):
    """
    Get teacher profile information with real statistics.
    """
    try:
        # Get teacher's courses
        teacher_courses = db.query(Course).filter(
            Course.teacher_id == current_user.id
        ).all()
        
        total_courses = len(teacher_courses)
        active_courses = len([c for c in teacher_courses if c.is_active])
        
        # Get total students across all teacher's courses
        total_students = 0
        if teacher_courses:
            course_ids = [c.id for c in teacher_courses]
            total_students = db.query(func.count(CourseEnrollment.id)).filter(
                CourseEnrollment.course_id.in_(course_ids),
                CourseEnrollment.role == "student"
            ).scalar() or 0
        
        # Get quests created by this teacher
        quests_created = db.query(func.count(Quest.quest_id)).filter(
            Quest.creator_id == current_user.id
        ).scalar() or 0
        
        # Get badges designed by this teacher
        badges_designed = db.query(func.count(Badge.badge_id)).filter(
            Badge.created_by == current_user.id
        ).scalar() or 0
        
        # Determine account status
        account_status = "Active" if current_user.is_active else "Inactive"
        if current_user.is_active and total_courses > 0:
            account_status = "Active Teacher"
        elif current_user.is_active and quests_created > 0:
            account_status = "Active Teacher"
        
        # Build response
        profile_data = TeacherProfileResponse(
            id=current_user.id,
            username=current_user.username,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            email=current_user.email,
            profile_image_url=current_user.profile_image_url,
            bio=current_user.bio,
            joined_date=current_user.created_at,
            total_courses=total_courses,
            active_courses=active_courses,
            total_students=total_students,
            quests_created=quests_created,
            badges_designed=badges_designed,
            account_status=account_status
        )
        
        logger.info(f"Teacher profile loaded for user {current_user.id}: {total_courses} courses, {total_students} students, {quests_created} quests, {badges_designed} badges")
        return profile_data
        
    except Exception as e:
        logger.error(f"Error loading teacher profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load teacher profile"
        )
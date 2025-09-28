from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import CourseEnrollment
from app.models.auth import MoodleConfig
from app.services.moodle import MoodleService

router = APIRouter(
    prefix="/enrollment",
    tags=["enrollments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/sync-for-user/{user_id}")
async def sync_enrollments_for_user(user_id: int, token: str, db: Session = Depends(get_db)):
    """
    Sync a user's Moodle course enrollments to the local CourseEnrollment table.
    The Moodle API token must be provided as a query parameter (?token=...)
    """
    # Get the user and their moodle_user_id
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user or not user.moodle_user_id:
        raise HTTPException(status_code=404, detail="User or moodle_user_id not found")
    local_user_id = user.id  # Use the local user ID for enrollments

    # Get Moodle base URL from config or environment
    from app.models.auth import MoodleConfig
    import os
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL")

    # Fetch enrolled courses directly from Moodle web service
    import httpx
    url = f"{base_url.rstrip('/')}/webservice/rest/server.php"
    params = {
        "wstoken": token,
        "wsfunction": "core_enrol_get_users_courses",
        "moodlewsrestformat": "json",
        "userid": str(user.moodle_user_id)
    }
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            moodle_courses = response.json()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to fetch courses from Moodle: {str(exc)}")

    # Map Moodle course IDs to local course IDs
    moodle_course_ids = [c['id'] for c in moodle_courses]
    local_courses = db.query(Course).filter(Course.moodle_course_id.in_(moodle_course_ids)).all()
    local_course_map = {c.moodle_course_id: c.id for c in local_courses}

    # Sync enrollments
    new_enrollments = 0
    for moodle_course_id in moodle_course_ids:
        local_course_id = local_course_map.get(moodle_course_id)
        if not local_course_id:
            continue
        exists = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == local_user_id, CourseEnrollment.course_id == local_course_id).first()
        if not exists:
            # Always default to 'student' if user.role is None or empty
            user_role = user.role if getattr(user, 'role', None) else 'student'
            print(f"Enrolling user_id={local_user_id} in course_id={local_course_id} with role={user_role}")
            db.add(CourseEnrollment(user_id=local_user_id, course_id=local_course_id, role=user_role, status='active'))
            new_enrollments += 1
    db.commit()
    return {"success": True, "new_enrollments": new_enrollments}

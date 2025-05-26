from fastapi import APIRouter

from app.api.endpoints import users, auth, quests, courses, enrollment

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(quests.router, prefix="/quests", tags=["quests"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"]) 
api_router.include_router(enrollment.router, prefix="/enrollment", tags=["enrollment"])
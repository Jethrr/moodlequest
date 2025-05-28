# This file makes the models directory a Python package
# Import models only when explicitly requested rather than on module initialization
# to prevent duplicate table definitions 

# Import all models here to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import CourseEnrollment
from app.models.auth import Token, MoodleConfig
from app.models.quest import Quest
from app.models.leaderboard import Leaderboard, LeaderboardEntry, StudentProgress, ExperiencePoint

# This file ensures proper loading order of models when using relationships 
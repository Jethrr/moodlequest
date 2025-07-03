from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import date
import logging

from app.database.connection import get_db
from app.models.user import User
from app.services.daily_quest_service import DailyQuestService
from app.schemas.daily_quest import (
    DailyQuestSummary, 
    UserDailyQuestResponse, 
    QuestCompletionRequest,
    QuestCompletionResponse
)
from app.models.streak import UserStreak

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/daily-quests",
    tags=["daily-quests"],
    responses={404: {"description": "Not found"}},
)

@router.post("/seed")
async def seed_daily_quests(db: Session = Depends(get_db)):
    """
    Seed the database with all daily quest templates.
    This should be run once during setup.
    """
    service = DailyQuestService(db)
    try:
        result = service.seed_daily_login_quest()  # This now seeds all quest types
        return result
    except Exception as e:
        logger.error(f"Error seeding daily quests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=DailyQuestSummary)
async def get_user_daily_quests(
    user_id: int,
    target_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get daily quests for a specific user on a specific date.
    If no date provided, uses today's date.
    The user_id parameter is the Moodle user ID.
    """
    # Verify user exists - look up by moodle_user_id
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = DailyQuestService(db)
    
    try:
        # Parse date if provided
        quest_date = None
        if target_date:
            quest_date = date.fromisoformat(target_date)
        
        # Get quest summary using the local user ID (this will auto-generate quests if needed)
        summary = service.get_user_quest_summary(user.id)
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error getting user daily quests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/complete", response_model=QuestCompletionResponse)
async def complete_daily_quest(
    user_id: int,
    request: QuestCompletionRequest,
    db: Session = Depends(get_db)
):
    """
    Complete a daily quest for a user.
    Supports daily_login, feed_pet, and earn_xp quest types.
    The user_id parameter is the Moodle user ID.
    """
    # Verify user exists - look up by moodle_user_id
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = DailyQuestService(db)
    
    try:
        # Handle different quest types
        if request.quest_type == "daily_login":
            result = service.complete_daily_login_quest(user.id)
        elif request.quest_type == "feed_pet":
            result = service.complete_feed_pet_quest(user.id)
        elif request.quest_type == "earn_xp":
            # For earn_xp quest, we may need additional parameters
            xp_amount = getattr(request, 'xp_amount', 10)  # Default XP contribution
            result = service.complete_earn_xp_quest(user.id, xp_amount)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported quest type: {request.quest_type}")
        
        if not result["success"]:
            return QuestCompletionResponse(
                success=False,
                message=result["message"],
                xp_awarded=0
            )
        
        # Convert UserDailyQuest model to response schema
        quest_response = UserDailyQuestResponse.from_orm(result["quest"]) if result.get("quest") else None
        
        return QuestCompletionResponse(
            success=True,
            message=result["message"],
            xp_awarded=result["xp_awarded"],
            quest=quest_response
        )
    except Exception as e:
        logger.error(f"Error completing daily quest: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/generate")
async def generate_daily_quest_for_user(
    user_id: int,
    target_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Manually generate daily quests for a user on a specific date.
    Useful for testing or manual quest assignment.
    The user_id parameter is the Moodle user ID.
    """
    # Verify user exists - look up by moodle_user_id
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    service = DailyQuestService(db)
    
    try:
        # Parse date if provided
        quest_date = date.today()
        if target_date:
            quest_date = date.fromisoformat(target_date)
        
        # Use the local user ID for the service
        quest = service.generate_daily_login_quest_for_user(user.id, quest_date)
        
        if not quest:
            raise HTTPException(status_code=500, detail="Failed to generate daily quest")
        
        return {
            "success": True,
            "message": f"Daily quest generated for user {user_id} on {quest_date}",
            "quest_id": quest.id
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error generating daily quest: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/expire-old")
async def expire_old_quests(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Expire old quests that have passed their expiration time.
    This should be run daily via cron job.
    """
    service = DailyQuestService(db)
    
    try:
        background_tasks.add_task(service.expire_old_quests)
        return {"message": "Old quest expiration task queued"}
    except Exception as e:
        logger.error(f"Error expiring old quests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_quest_templates(db: Session = Depends(get_db)):
    """
    Get all available daily quest templates.
    """
    from app.models.daily_quest import DailyQuest
    
    try:
        templates = db.query(DailyQuest).filter(DailyQuest.is_active == True).all()
        return {
            "success": True,
            "templates": templates
        }
    except Exception as e:
        logger.error(f"Error getting quest templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/streak")
async def get_user_streak(
    user_id: int,
    streak_type: str = "daily_login",
    db: Session = Depends(get_db)
):
    """
    Get user's streak information for a specific streak type.
    The user_id parameter is the Moodle user ID.
    """
    # Verify user exists - look up by moodle_user_id
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Get user's streak information
        streak = db.query(UserStreak).filter(
            UserStreak.user_id == user.id,
            UserStreak.streak_type == streak_type
        ).first()
        
        if not streak:
            return {
                "success": True,
                "streak": {
                    "current_streak": 0,
                    "longest_streak": 0,
                    "last_activity_date": None,
                    "streak_type": streak_type
                }
            }
        
        return {
            "success": True,
            "streak": {
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "last_activity_date": streak.last_activity_date.isoformat() if streak.last_activity_date else None,
                "start_date": streak.start_date.isoformat() if streak.start_date else None,
                "streak_type": streak.streak_type
            }
        }
    except Exception as e:
        logger.error(f"Error getting user streak: {e}")
        raise HTTPException(status_code=500, detail=str(e))

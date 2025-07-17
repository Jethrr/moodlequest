"""
Common utilities and helper functions for webhook processing.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.badge_service import BadgeService

logger = logging.getLogger(__name__)


def log_and_ack(event_type: str, data: dict, msg: str):
    """
    Standard logging and acknowledgment response for webhook events.
    
    Args:
        event_type: Type of webhook event
        data: Webhook payload data
        msg: Message to log
        
    Returns:
        dict: Standard acknowledgment response
    """
    logger.info(f"📨 {msg}")
    logger.debug(f"📋 Event data for {event_type}: {data}")
    return {"status": "received", "event": event_type, "message": msg}


def check_badges_after_quest_completion(user_id: int, db: Session):
    """
    Check and award badges after a quest completion.
    
    Args:
        user_id: ID of the user who completed the quest
        db: Database session
        
    Returns:
        list: List of awarded badges
    """
    try:
        logger.info(f"🔍 Checking badges for user {user_id} after quest completion...")
        
        badge_service = BadgeService(db)
        
        # Debug: Check what badges exist
        all_badges = badge_service.get_all_badges()
        logger.info(f"📊 Found {len(all_badges)} active badges in system")
        
        # Debug: Check user's current progress
        user_progress = badge_service.get_user_badges_with_progress(user_id)
        logger.info(f"👤 User {user_id} has progress on {len(user_progress)} badges")
        
        awarded_badges = badge_service.check_and_award_badges(user_id)
        
        if awarded_badges:
            logger.info(f"🏆 User {user_id} earned {len(awarded_badges)} badges after webhook quest completion")
            for badge_award in awarded_badges:
                badge_info = badge_award.get('badge', {})
                logger.info(f"  🎖️ Awarded badge '{getattr(badge_info, 'name', 'Unknown')}' to user {user_id}")
        else:
            logger.info(f"📝 No new badges earned by user {user_id} after quest completion")
        
        return awarded_badges
    except Exception as e:
        logger.error(f"❌ Error checking badges for user {user_id} after webhook quest completion: {e}")
        import traceback
        logger.error(f"📋 Full traceback: {traceback.format_exc()}")
        return []


# XP Configuration
XP_CONFIG = {
    "quiz_completion": 50,
    "assignment_submission": 40,
    "forum_post": 10,
    "forum_discussion": 15,
    "lesson_completion": 15,
    "lesson_view": 3,
    "feedback_participation": 10,
    "choice_participation": 5,
    "glossary_entry": 8,
    "activity_completion": {
        "page": 5,
        "url": 5,
        "resource": 5,
        "book": 10,
        "lesson": 15,
        "scorm": 20,
        "h5pactivity": 15,
        "unknown": 5
    },
    "high_grade_bonus_percent": 20,
    "min_grade_threshold": 70
}

"""
Assignment-related webhook handlers.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.quest import Quest, QuestProgress
from app.models.course import Course
from app.models.user import User
from app.models.quest import ExperiencePoints
from ..base_processor import WebhookProcessor
from ..utils import XP_CONFIG

logger = logging.getLogger(__name__)


def handle_assign_submitted(data: dict, db: Session):
    """
    Handle assignment submission webhook from Moodle.
    Updates quest progress, student progress, and awards experience points.
    """
    processor = WebhookProcessor(db)
    
    # Use the generic processor for assignment submission
    success = processor.process_quest_or_engagement(
        data=data,
        source_type="assignment",
        activity_id_key="assignment_id",
        default_xp=40  # Default XP for assignment completion
    )
    
    if success:
        logger.info("Successfully processed assignment submission")
    else:
        logger.warning("Failed to process assignment submission")


def handle_assign_graded(data: dict, db: Session):
    """
    Handle assignment grading webhook from Moodle.
    Updates quest validation status and may award additional XP based on grade.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("assignment_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    grade = data.get("grade", 0)
    max_grade = data.get("max_grade", 100)
    grader_id = data.get("grader_id")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in assignment graded webhook payload: %s", data)
        return

    processor = WebhookProcessor(db)
    
    try:
        # Find entities
        course = processor.find_course(moodle_course_id)
        user = processor.find_user(moodle_user_id)
        
        # Find the quest associated with this assignment
        quest = db.query(Quest).filter(
            Quest.course_id == course.id,
            Quest.moodle_activity_id == moodle_activity_id,
            Quest.is_active == True
        ).first()
        
        if not quest:
            logger.warning(f"No quest found for graded assignment course_id={course.id}, moodle_activity_id={moodle_activity_id}")
            return

        # Find existing quest progress
        qp = db.query(QuestProgress).filter_by(user_id=user.id, quest_id=quest.quest_id).first()
        if not qp:
            logger.warning(f"No quest progress found for user {user.id}, quest {quest.quest_id}")
            return

        # Update validation status based on grade
        now = datetime.utcnow()
        grade_percentage = (grade / max_grade) * 100 if max_grade > 0 else 0
        
        qp.validated_at = now
        qp.validation_notes = f"Graded: {grade}/{max_grade} ({grade_percentage:.1f}%)"
        
        min_grade_threshold = XP_CONFIG["min_grade_threshold"]
        
        if grade_percentage >= min_grade_threshold:
            # Quest remains completed and validated
            if qp.status == "completed":
                # Optionally award bonus XP for high grades
                if grade_percentage >= 90:
                    bonus_xp = int((quest.exp_reward or 0) * XP_CONFIG["high_grade_bonus_percent"] / 100)
                    if bonus_xp > 0:
                        processor.award_engagement_xp(
                            user_id=user.id,
                            course_id=course.id,
                            amount=bonus_xp,
                            source_type="grade_bonus",
                            source_id=str(quest.quest_id),
                            notes=f"High grade bonus XP for {grade_percentage:.1f}% grade",
                            check_duplicates=False  # Allow bonus XP even if already awarded
                        )
        else:
            # Grade too low, quest needs revision
            qp.status = "needs_revision"
            qp.validation_notes += f" - Grade below threshold ({min_grade_threshold}%), revision required"
        
        processor.commit_changes_safely(f"Successfully processed assignment grade for user {user.id}, quest {quest.quest_id}, grade {grade}/{max_grade}")
        
    except ValueError as e:
        logger.error(str(e))
    except Exception as e:
        logger.error(f"Error processing assignment grade: {e}")
        raise

"""
Quiz-related webhook handlers.
"""

import logging
from sqlalchemy.orm import Session

from ..base_processor import WebhookProcessor

logger = logging.getLogger(__name__)


def handle_quiz_attempt_submitted(data: dict, db: Session):
    """
    Handle quiz attempt submission webhook.
    Similar to assignment submission but specifically for quiz activities.
    """
    processor = WebhookProcessor(db)
    
    # Extract quiz-specific data
    attempt_grade = data.get("grade", 0)
    
    # Use the generic processor with quiz-specific parameters
    success = processor.process_quest_or_engagement(
        data=data,
        source_type="quiz",
        activity_id_key="quiz_id",
        default_xp=50,  # Default XP for quiz completion
        grade_key="grade"
    )
    
    if success:
        logger.info(f"Successfully processed quiz attempt submission with grade {attempt_grade}")
    else:
        logger.warning("Failed to process quiz attempt submission")

"""
Enhanced notification manager for webhook events.
Ensures reliable XP reward notifications reach the frontend.
"""

import asyncio
import logging
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.quest import Quest, StudentProgress
from app.services.notification_service import (
    notification_service, 
    create_xp_notification, 
    create_quest_notification,
    NotificationData
)

logger = logging.getLogger(__name__)


class WebhookNotificationManager:
    """
    Manages notifications for webhook events with improved reliability.
    Ensures XP reward popups appear when quests are completed via Moodle.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def send_quest_completion_notification(
        self, 
        user_id: int, 
        quest: Quest, 
        exp_reward: int,
        course_id: Optional[int] = None
    ) -> bool:
        """
        Send comprehensive quest completion notification.
        
        Args:
            user_id: ID of the user who completed the quest
            quest: The completed quest object
            exp_reward: Experience points awarded
            course_id: Optional course ID for context
            
        Returns:
            bool: True if notification was sent successfully
        """
        try:
            # Get updated student progress for accurate total XP
            if course_id:
                student_progress = self.db.query(StudentProgress).filter_by(
                    user_id=user_id, 
                    course_id=course_id
                ).first()
            else:
                # Fallback: get any student progress record for the user
                student_progress = self.db.query(StudentProgress).filter_by(
                    user_id=user_id
                ).first()
            
            total_xp = student_progress.total_exp if student_progress else exp_reward
            
            # Create XP reward notification for the popup
            xp_notification = create_xp_notification(
                user_id=user_id,
                quest_title=quest.title,
                xp_earned=exp_reward,
                total_xp=total_xp,
                source_type="webhook_quest_completion"
            )
            
            # Create quest completion notification for badge refresh
            quest_notification = create_quest_notification(
                user_id=user_id,
                quest_title=quest.title,
                notification_type="quest_completion",
                message=f"Quest '{quest.title}' completed! You may have earned new badges."
            )
            
            # Send both notifications
            await self._send_notification_with_retry(xp_notification)
            await self._send_notification_with_retry(quest_notification)
            
            logger.info(
                f"Successfully sent quest completion notifications for user {user_id}, "
                f"quest '{quest.title}', {exp_reward} XP awarded"
            )
            
            return True
            
        except Exception as e:
            logger.error(
                f"Failed to send quest completion notification for user {user_id}, "
                f"quest '{quest.title}': {e}"
            )
            return False
    
    async def send_engagement_xp_notification(
        self, 
        user_id: int, 
        xp_amount: int, 
        activity_title: str,
        source_type: str,
        course_id: Optional[int] = None
    ) -> bool:
        """
        Send XP notification for engagement activities (non-quest).
        
        Args:
            user_id: ID of the user who earned XP
            xp_amount: Amount of XP earned
            activity_title: Title of the activity
            source_type: Type of activity (e.g., 'assignment', 'quiz')
            course_id: Optional course ID for context
            
        Returns:
            bool: True if notification was sent successfully
        """
        try:
            # Get updated student progress for accurate total XP
            if course_id:
                student_progress = self.db.query(StudentProgress).filter_by(
                    user_id=user_id, 
                    course_id=course_id
                ).first()
            else:
                student_progress = self.db.query(StudentProgress).filter_by(
                    user_id=user_id
                ).first()
            
            total_xp = student_progress.total_exp if student_progress else xp_amount
            
            # Create XP reward notification
            notification = create_xp_notification(
                user_id=user_id,
                quest_title=f"{activity_title} Completed! 🎉",
                xp_earned=xp_amount,
                total_xp=total_xp,
                source_type=f"webhook_{source_type}"
            )
            
            # Send notification
            await self._send_notification_with_retry(notification)
            
            logger.info(
                f"Successfully sent engagement XP notification for user {user_id}, "
                f"activity '{activity_title}', {xp_amount} XP awarded"
            )
            
            return True
            
        except Exception as e:
            logger.error(
                f"Failed to send engagement XP notification for user {user_id}, "
                f"activity '{activity_title}': {e}"
            )
            return False
    
    async def _send_notification_with_retry(
        self, 
        notification: NotificationData, 
        max_retries: int = 3
    ) -> bool:
        """
        Send notification with retry logic for improved reliability.
        
        Args:
            notification: The notification to send
            max_retries: Maximum number of retry attempts
            
        Returns:
            bool: True if notification was sent successfully
        """
        for attempt in range(max_retries):
            try:
                await notification_service.send_notification(notification)
                
                # Check if user has active connections
                connected_users = notification_service.get_connected_users()
                if notification.user_id in connected_users:
                    logger.debug(
                        f"Notification sent successfully to user {notification.user_id} "
                        f"(attempt {attempt + 1})"
                    )
                    return True
                else:
                    logger.warning(
                        f"User {notification.user_id} not connected to SSE, "
                        f"notification may not be received (attempt {attempt + 1})"
                    )
                    
                    # Still return True as notification was "sent" to the service
                    # The user will receive it when they reconnect
                    return True
                    
            except Exception as e:
                logger.warning(
                    f"Failed to send notification to user {notification.user_id} "
                    f"(attempt {attempt + 1}/{max_retries}): {e}"
                )
                
                if attempt < max_retries - 1:
                    # Wait before retry with exponential backoff
                    await asyncio.sleep(0.5 * (2 ** attempt))
        
        logger.error(
            f"Failed to send notification to user {notification.user_id} "
            f"after {max_retries} attempts"
        )
        return False
    
    def get_connection_status(self, user_id: int) -> dict:
        """
        Get SSE connection status for a user (for debugging).
        
        Args:
            user_id: ID of the user to check
            
        Returns:
            dict: Connection status information
        """
        connected_users = notification_service.get_connected_users()
        connection_count = notification_service.get_connection_count(user_id)
        
        return {
            "user_id": user_id,
            "is_connected": user_id in connected_users,
            "connection_count": connection_count,
            "total_connected_users": len(connected_users),
            "all_connected_users": connected_users
        }

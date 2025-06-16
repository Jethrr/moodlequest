# filepath: backend/app/services/notification_service.py
import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from fastapi import BackgroundTasks
from datetime import datetime
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class NotificationData:
    """Data structure for real-time notifications"""
    def __init__(self, 
                 notification_type: str,
                 user_id: int,
                 title: str,
                 message: str,
                 xp_earned: int = 0,
                 total_xp: int = 0,
                 quest_data: Optional[Dict[str, Any]] = None,
                 timestamp: Optional[datetime] = None):
        self.notification_type = notification_type
        self.user_id = user_id
        self.title = title
        self.message = message
        self.xp_earned = xp_earned
        self.total_xp = total_xp
        self.quest_data = quest_data or {}
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.notification_type,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "xp_earned": self.xp_earned,
            "total_xp": self.total_xp,
            "quest_data": self.quest_data,
            "timestamp": self.timestamp.isoformat(),
            "id": f"{self.user_id}_{int(self.timestamp.timestamp())}"
        }

class SSENotificationService:
    """Service for managing Server-Sent Events notifications"""
    
    def __init__(self):
        # Dictionary to store active connections: user_id -> asyncio.Queue
        self.active_connections: Dict[int, List[asyncio.Queue]] = {}
        
    async def connect_user(self, user_id: int) -> asyncio.Queue:
        """Connect a user to the SSE notification system"""
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        # Create a new queue for this connection
        queue = asyncio.Queue()
        self.active_connections[user_id].append(queue)
        
        logger.info(f"User {user_id} connected to SSE notifications")
        return queue
    
    async def disconnect_user(self, user_id: int, queue: asyncio.Queue):
        """Disconnect a user from the SSE notification system"""
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(queue)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                logger.info(f"User {user_id} disconnected from SSE notifications")
            except ValueError:
                # Queue not in list, already removed
                pass
    
    async def send_notification(self, notification: NotificationData):
        """Send a notification to a specific user via SSE"""
        user_id = notification.user_id
        
        if user_id in self.active_connections:
            # Send to all active connections for this user
            disconnected_queues = []
            
            for queue in self.active_connections[user_id]:
                try:
                    await queue.put(notification.to_dict())
                    logger.debug(f"Sent notification to user {user_id}: {notification.title}")
                except asyncio.QueueFull:
                    logger.warning(f"Queue full for user {user_id}, dropping notification")
                except Exception as e:
                    logger.error(f"Failed to send notification to user {user_id}: {e}")
                    disconnected_queues.append(queue)
            
            # Clean up disconnected queues
            for queue in disconnected_queues:
                await self.disconnect_user(user_id, queue)
        else:
            logger.debug(f"No active connections for user {user_id}, notification not sent")
    
    async def broadcast_notification(self, notification: NotificationData, user_ids: List[int]):
        """Broadcast a notification to multiple users"""
        for user_id in user_ids:
            user_notification = NotificationData(
                notification_type=notification.notification_type,
                user_id=user_id,
                title=notification.title,
                message=notification.message,
                xp_earned=notification.xp_earned,
                total_xp=notification.total_xp,
                quest_data=notification.quest_data,
                timestamp=notification.timestamp
            )
            await self.send_notification(user_notification)
    
    def get_connected_users(self) -> List[int]:
        """Get a list of currently connected user IDs"""
        return list(self.active_connections.keys())
    
    def get_connection_count(self, user_id: int) -> int:
        """Get the number of active connections for a user"""
        return len(self.active_connections.get(user_id, []))

# Global instance
notification_service = SSENotificationService()

def create_xp_notification(
    user_id: int,
    quest_title: str,
    xp_earned: int,
    total_xp: int,
    source_type: str = "quest_completion"
) -> NotificationData:
    """Helper function to create standardized XP reward notifications"""
    
    return NotificationData(
        notification_type="xp_reward",
        user_id=user_id,
        title=f"{quest_title} Completed! 🎉",
        message=f"You earned {xp_earned} XP!",
        xp_earned=xp_earned,
        total_xp=total_xp,
        quest_data={
            "source_type": source_type,
            "quest_title": quest_title
        }
    )

def create_quest_notification(
    user_id: int,
    quest_title: str,
    notification_type: str = "quest_assigned",
    message: str = ""
) -> NotificationData:
    """Helper function to create quest-related notifications"""
    
    title_map = {
        "quest_assigned": f"New Quest Available! 📝",
        "quest_progress": f"Quest Progress Updated",
        "quest_completed": f"Quest Completed! 🎉",
        "quest_validated": f"Quest Validated! ✅"
    }
    
    return NotificationData(
        notification_type=notification_type,
        user_id=user_id,
        title=title_map.get(notification_type, "Quest Update"),
        message=message or f"Quest: {quest_title}",
        quest_data={"quest_title": quest_title}
    )

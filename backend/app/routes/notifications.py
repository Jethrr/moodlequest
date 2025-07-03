# filepath: backend/app/routes/notifications.py
import asyncio
import json
import logging
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.services.notification_service import notification_service
from app.auth.dependencies import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/events/{user_id}")
async def stream_notifications(
    user_id: int,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Server-Sent Events endpoint for real-time notifications.
    
    This endpoint establishes a persistent connection to stream real-time
    notifications to the frontend when users complete quizzes or other activities.
    """
    
    # Verify user exists and has permission to receive notifications
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # For now, allow any user to connect (could add authorization checks here)
    # if current_user and current_user.id != user.id:
    #     raise HTTPException(status_code=403, detail="Access denied")

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate Server-Sent Events for the client"""
        
        # Connect user to notification service
        queue = await notification_service.connect_user(user.id)
        
        try:
            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'message': 'SSE connection established'})}\n\n"
            
            # Keep connection alive and send notifications
            while True:
                try:
                    # Wait for notification with timeout to send heartbeat
                    notification = await asyncio.wait_for(queue.get(), timeout=30.0)
                    
                    # Send the notification as SSE data
                    event_data = json.dumps(notification)
                    yield f"data: {event_data}\n\n"
                    
                except asyncio.TimeoutError:
                    # Send heartbeat to keep connection alive
                    heartbeat = {
                        "type": "heartbeat",
                        "timestamp": notification_service.active_connections and 
                                   len(notification_service.active_connections) or 0
                    }
                    yield f"data: {json.dumps(heartbeat)}\n\n"
                    
                except asyncio.CancelledError:
                    # Client disconnected
                    logger.info(f"SSE connection cancelled for user {user.id}")
                    break
                    
                except Exception as e:
                    logger.error(f"Error in SSE event generator for user {user.id}: {e}")
                    error_event = {
                        "type": "error",
                        "message": "An error occurred in the notification stream"
                    }
                    yield f"data: {json.dumps(error_event)}\n\n"
                    break
                    
        except Exception as e:
            logger.error(f"Fatal error in SSE connection for user {user.id}: {e}")
        finally:
            # Clean up connection
            await notification_service.disconnect_user(user.id, queue)
            logger.info(f"SSE connection closed for user {user.id}")

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    )

@router.get("/status")
async def get_notification_status():
    """Get the current status of the notification service"""
    connected_users = notification_service.get_connected_users()
    
    return {
        "service_status": "active",
        "connected_users_count": len(connected_users),
        "connected_users": connected_users
    }

@router.post("/test/{user_id}")
async def send_test_notification(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Send a test notification to a user (for testing purposes)"""
    
    # Verify user exists
    user = db.query(User).filter(User.moodle_user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from app.services.notification_service import NotificationData
    
    test_notification = NotificationData(
        notification_type="test",
        user_id=user.id,
        title="Test Notification 🧪",
        message="This is a test notification to verify the real-time system is working!",
        xp_earned=0,
        total_xp=0
    )
    
    await notification_service.send_notification(test_notification)
    
    return {
        "success": True,
        "message": f"Test notification sent to user {user_id}",
        "connected": notification_service.get_connection_count(user.id) > 0
    }

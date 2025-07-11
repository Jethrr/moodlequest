# filepath: backend/app/routes/notifications.py
import asyncio
import json
import logging
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.services.notification_service import notification_service, NotificationData
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
    # Try to find user by internal ID first, then by moodle_user_id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback to moodle_user_id for backward compatibility
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

@router.post("/test/{user_id}")
async def test_notification(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Test endpoint to send a notification to a specific user"""
    try:
        data = await request.json()
        
        # Create test notification
        notification_data = NotificationData(
            notification_type="xp_reward",
            user_id=user_id,
            title=data.get("quest_title", "Test Quest Completed! 🎉"),
            message=f"You earned {data.get('xp_earned', 10)} XP!",
            xp_earned=data.get("xp_earned", 10),
            total_xp=data.get("total_xp", 100),
            quest_data={
                "source_type": data.get("source_type", "test"),
                "quest_title": data.get("quest_title", "Test Quest")
            }
        )
        
        # Send the notification
        await notification_service.send_notification(notification_data)
        
        return {
            "success": True,
            "message": f"Test notification sent to user {user_id}",
            "notification": notification_data.to_dict()
        }
        
    except Exception as e:
        logging.error(f"Error sending test notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_notification_status():
    """Get the status of the notification service"""
    return {
        "active_connections": len(notification_service.active_connections),
        "connected_users": notification_service.get_connected_users(),
        "service_status": "running"
    }

"""
Debugging utilities for webhook notifications.
Helps troubleshoot SSE connection and notification issues.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.connection import get_db
from app.models.user import User
from app.utils.auth import get_current_user_from_moodle_token
from app.routes.webhooks.notification_manager import WebhookNotificationManager
from app.services.notification_service import notification_service, create_xp_notification

router = APIRouter(prefix="/webhooks/debug", tags=["webhook-debug"])


@router.get("/notification-status/{user_id}")
async def get_notification_status(
    user_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get notification system status for a specific user.
    Useful for debugging webhook notification issues.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get connection status using notification manager
    notification_manager = WebhookNotificationManager(db)
    connection_status = notification_manager.get_connection_status(user_id)
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "moodle_user_id": user.moodle_user_id
        },
        "sse_connection": connection_status,
        "notification_service": {
            "total_active_connections": len(notification_service.active_connections),
            "all_connected_users": notification_service.get_connected_users()
        },
        "recommendations": _get_troubleshooting_recommendations(connection_status)
    }


@router.post("/test-notification/{user_id}")
async def test_webhook_notification(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_moodle_token)
) -> Dict[str, Any]:
    """
    Send a test notification to verify the webhook notification system.
    Only accessible to authenticated users for security.
    """
    # Verify target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    try:
        # Create test notification using notification manager
        notification_manager = WebhookNotificationManager(db)
        
        success = await notification_manager.send_engagement_xp_notification(
            user_id=user_id,
            xp_amount=25,
            activity_title="Webhook Test Activity",
            source_type="webhook_test",
            course_id=None
        )
        
        # Get updated connection status
        connection_status = notification_manager.get_connection_status(user_id)
        
        return {
            "success": success,
            "message": "Test notification sent successfully" if success else "Failed to send test notification",
            "target_user": {
                "id": target_user.id,
                "username": target_user.username
            },
            "connection_status": connection_status,
            "test_details": {
                "xp_amount": 25,
                "activity_title": "Webhook Test Activity",
                "source_type": "webhook_test"
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error sending test notification: {str(e)}",
            "error": str(e)
        }


def _get_troubleshooting_recommendations(connection_status: Dict[str, Any]) -> list:
    """Generate troubleshooting recommendations based on connection status."""
    recommendations = []
    
    if not connection_status["is_connected"]:
        recommendations.extend([
            "User is not connected to SSE. Check if frontend is establishing SSE connection.",
            "Verify that the user is logged in and the SSE hook is being called.",
            "Check browser console for SSE connection errors.",
            "Ensure CORS settings allow SSE connections."
        ])
    
    if connection_status["total_connected_users"] == 0:
        recommendations.extend([
            "No users are connected to SSE service. This might indicate:",
            "- Frontend SSE system not working",
            "- Network/firewall blocking SSE connections",
            "- Backend SSE service not properly initialized"
        ])
    
    if connection_status["connection_count"] == 0:
        recommendations.append(
            "User has no active connections. Check if useSSENotifications hook is properly implemented."
        )
    
    if not recommendations:
        recommendations.append("Connection status looks good! Notifications should work properly.")
    
    return recommendations

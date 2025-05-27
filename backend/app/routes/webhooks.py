from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/user-created")
async def handle_user_created_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received webhook payload: %s", data)
        return {
            "status": "success",
            "message": "Webhook received and logged successfully",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/quiz/attempt-submitted")
async def handle_quiz_attempt_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received quiz attempt webhook: %s", data)
        return {
            "status": "success",
            "message": "Quiz attempt webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing quiz attempt webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/assign/submitted")
async def handle_assignment_submission_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received assignment submission webhook: %s", data)
        return {
            "status": "success",
            "message": "Assignment submission webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing assignment submission webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/assign/graded")
async def handle_assignment_graded_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received assignment grading webhook: %s", data)
        return {
            "status": "success",
            "message": "Assignment grading webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing assignment grading webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/course/completion-updated")
async def handle_module_completion_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received module completion webhook: %s", data)
        return {
            "status": "success",
            "message": "Module completion webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing module completion webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/forum/post-created")
async def handle_forum_post_created_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received forum post created webhook: %s", data)
        return {
            "status": "success",
            "message": "Forum post created webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing forum post created webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/lesson/completed")
async def handle_lesson_completed_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received lesson completed webhook: %s", data)
        return {
            "status": "success",
            "message": "Lesson completed webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing lesson completed webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/feedback/submitted")
async def handle_feedback_submitted_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received feedback submitted webhook: %s", data)
        return {
            "status": "success",
            "message": "Feedback submitted webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing feedback submitted webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/glossary/entry-created")
async def handle_glossary_entry_created_webhook(request: Request):
    try:
        data = await request.json()
        logger.info("📥 Received glossary entry created webhook: %s", data)
        return {
            "status": "success",
            "message": "Glossary entry created webhook received and logged",
            "event_type": data.get("event_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("❌ Error processing glossary entry created webhook: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )

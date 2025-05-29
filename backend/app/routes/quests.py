from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.connection import get_db
from app.models.quest import Quest, QuestProgress
from app.schemas.quest import QuestCreate, QuestUpdate, Quest as QuestSchema
from app.models.course import Course as CourseModel
from app.models.user import User as UserModel
from app.models.enrollment import CourseEnrollment
import random
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/quests",
    tags=["quests"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=QuestSchema, status_code=status.HTTP_201_CREATED)
def create_quest(quest: QuestCreate, creator_id: int = Query(..., description="ID of the user creating the quest"), db: Session = Depends(get_db)):
    """
    Create a new quest.
    """
    quest_dict = quest.model_dump()
    quest_dict["creator_id"] = creator_id
    db_quest = Quest(**quest_dict)
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest

@router.get("/", response_model=List[QuestSchema])
def get_quests(
    skip: int = 0, 
    limit: int = 100, 
    course_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    difficulty_level: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve quests with optional filters.
    """
    query = db.query(Quest)
    
    if course_id is not None:
        query = query.filter(Quest.course_id == course_id)
    if is_active is not None:
        query = query.filter(Quest.is_active == is_active)
    if difficulty_level is not None:
        query = query.filter(Quest.difficulty_level == difficulty_level)
    
    quests = query.offset(skip).limit(limit).all()
    return quests

@router.get("/{quest_id}", response_model=QuestSchema)
def get_quest(quest_id: int, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest

@router.put("/{quest_id}", response_model=QuestSchema)
def update_quest(quest_id: int, quest: QuestUpdate, db: Session = Depends(get_db)):
    db_quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if db_quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    quest_data = quest.model_dump(exclude_unset=True)
    for field, value in quest_data.items():
        setattr(db_quest, field, value)
    
    db.commit()
    db.refresh(db_quest)
    return db_quest

@router.delete("/{quest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quest(quest_id: int, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    db.delete(quest)
    db.commit()

@router.get("/creator/{creator_id}", response_model=List[QuestSchema])
def get_quests_by_creator(creator_id: int, db: Session = Depends(get_db)):
    return db.query(Quest).filter(Quest.creator_id == creator_id).all()

@router.get("/courses", response_model=dict)
async def get_courses(db: Session = Depends(get_db)):
    """
    Get all courses for quest creation.
    """
    try:
        # Query all courses
        courses = db.query(CourseModel).filter(CourseModel.is_active == True).all()
        
        # Format the response
        course_list = []
        for course in courses:
            course_data = {
                "id": course.course_id,
                "title": course.title,
                "description": course.description,
                "course_code": course.course_code,
                "teacher_id": course.teacher_id,
                "is_active": course.is_active,
                "start_date": course.start_date.isoformat() if course.start_date else None,
                "end_date": course.end_date.isoformat() if course.end_date else None,
                "created_at": course.created_at.isoformat() if course.created_at else None
            }
            course_list.append(course_data)
        
        return {
            "success": True,
            "courses": course_list,
            "count": len(course_list)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching courses: {str(e)}"
        )

@router.post("/create-quest", status_code=201)
def create_quest_from_frontend(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Create a quest from frontend payload.
    This endpoint handles the specific payload structure from the frontend.
    """
    try:
        # Extract quest data from payload
        quest_data = {
            "title": payload.get("title"),
            "description": payload.get("description"),
            "course_id": payload.get("course_id"),
            "creator_id": payload.get("creator_id", 1),  # Default to user ID 1 if not provided
            "exp_reward": payload.get("exp_reward", 100),
            "quest_type": payload.get("quest_type", "assignment"),
            "validation_method": payload.get("validation_method", "manual"),
            "validation_criteria": payload.get("validation_criteria", {}),
            "is_active": payload.get("is_active", True),
            "difficulty_level": payload.get("difficulty_level", 1),
            "moodle_activity_id": payload.get("moodle_activity_id"),
            "start_date": datetime.utcnow(),
            "end_date": datetime.utcnow() + timedelta(days=30)  # Default 30 days from now
        }
        
        # Validate required fields
        if not quest_data["title"]:
            raise HTTPException(status_code=400, detail="Title is required")
        if not quest_data["description"]:
            raise HTTPException(status_code=400, detail="Description is required")
        if not quest_data["course_id"]:
            raise HTTPException(status_code=400, detail="Course ID is required")
        
        # Verify course exists
        course = db.query(CourseModel).filter(CourseModel.course_id == quest_data["course_id"]).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Verify user exists
        user = db.query(UserModel).filter(UserModel.id == quest_data["creator_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="Creator user not found")
        
        # Create the quest
        db_quest = Quest(**quest_data)
        db.add(db_quest)
        db.commit()
        db.refresh(db_quest)
        
        return {
            "message": "Quest created successfully",
            "quest_id": db_quest.quest_id,
            "quest": {
                "quest_id": db_quest.quest_id,
                "title": db_quest.title,
                "description": db_quest.description,
                "course_id": db_quest.course_id,
                "creator_id": db_quest.creator_id,
                "exp_reward": db_quest.exp_reward,
                "quest_type": db_quest.quest_type,
                "validation_method": db_quest.validation_method,
                "is_active": db_quest.is_active,
                "difficulty_level": db_quest.difficulty_level,
                "moodle_activity_id": db_quest.moodle_activity_id,
                "created_at": db_quest.created_at.isoformat() if db_quest.created_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error creating quest: {str(e)}")
        print(error_details)
        raise HTTPException(status_code=500, detail=f"Error creating quest: {str(e)}")

@router.get("/assigned-activity-ids", response_model=List[int])
def get_assigned_activity_ids(db: Session = Depends(get_db)):
    """Get all assigned Moodle activity IDs"""
    assigned_ids = db.query(Quest.moodle_activity_id).filter(Quest.moodle_activity_id != None).all()
    return [activity_id[0] for activity_id in assigned_ids]

@router.get("/for-user/{user_id}")
def get_quests_for_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get all quests for a specific user based on their enrolled courses.
    Returns quests with completion status, progress, and organized by completion state.
    """
    try:
        # Verify user exists
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all courses the user is enrolled in
        user_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.status == "active"
        ).all()
        
        if not user_enrollments:
            return {
                "success": True,
                "user_id": user_id,
                "total_quests": 0,
                "completed_quests": 0,
                "incomplete_quests": 0,
                "completion_rate": 0.0,
                "quests": {
                    "completed": [],
                    "incomplete": []
                }
            }
        
        # Get course IDs from enrollments
        enrolled_course_ids = [enrollment.course_id for enrollment in user_enrollments]
        
        # Get current time for active quest filtering
        now = datetime.utcnow()
        
        # Fetch all active quests from enrolled courses
        quests_query = db.query(Quest).filter(
            Quest.course_id.in_(enrolled_course_ids),
            Quest.is_active == True,
            or_(
                Quest.start_date == None,
                Quest.start_date <= now
            ),
            or_(
                Quest.end_date == None,
                Quest.end_date >= now
            )
        ).order_by(Quest.created_at.desc())
        
        quests = quests_query.all()
        
        if not quests:
            return {
                "success": True,
                "user_id": user_id,
                "total_quests": 0,
                "completed_quests": 0,
                "incomplete_quests": 0,
                "completion_rate": 0.0,
                "quests": {
                    "completed": [],
                    "incomplete": []
                }
            }
        
        # Get quest progress for this user
        quest_ids = [quest.quest_id for quest in quests]
        quest_progress_records = db.query(QuestProgress).filter(
            QuestProgress.user_id == user_id,
            QuestProgress.quest_id.in_(quest_ids)
        ).all()
        
        # Create a mapping of quest_id to progress
        progress_map = {progress.quest_id: progress for progress in quest_progress_records}
        
        # Organize quests with their completion status
        completed_quests = []
        incomplete_quests = []
        
        for quest in quests:
            # Get course information
            course = db.query(CourseModel).filter(CourseModel.id == quest.course_id).first()
            course_title = course.title if course else "Unknown Course"
            
            # Get progress for this quest
            progress = progress_map.get(quest.quest_id)
            
            # Determine completion status and progress percentage
            if progress:
                is_completed = progress.status == "completed"
                progress_percent = progress.progress_percent
                started_at = progress.started_at.isoformat() if progress.started_at else None
                completed_at = progress.completed_at.isoformat() if progress.completed_at else None
                validated_at = progress.validated_at.isoformat() if progress.validated_at else None
                validation_notes = progress.validation_notes
                status = progress.status
            else:
                is_completed = False
                progress_percent = 0
                started_at = None
                completed_at = None
                validated_at = None
                validation_notes = None
                status = "not_started"
            
            # Build quest object with completion information
            quest_data = {
                "quest_id": quest.quest_id,
                "title": quest.title,
                "description": quest.description,
                "course_id": quest.course_id,
                "course_title": course_title,
                "creator_id": quest.creator_id,
                "exp_reward": quest.exp_reward,
                "quest_type": quest.quest_type,
                "validation_method": quest.validation_method,
                "validation_criteria": quest.validation_criteria,
                "difficulty_level": quest.difficulty_level,
                "moodle_activity_id": quest.moodle_activity_id,
                "start_date": quest.start_date.isoformat() if quest.start_date else None,
                "end_date": quest.end_date.isoformat() if quest.end_date else None,
                "created_at": quest.created_at.isoformat() if quest.created_at else None,
                "is_active": quest.is_active,
                # Progress and completion information
                "is_completed": is_completed,
                "status": status,
                "progress_percent": progress_percent,
                "started_at": started_at,
                "completed_at": completed_at,
                "validated_at": validated_at,
                "validation_notes": validation_notes
            }
            
            # Categorize quest
            if is_completed:
                completed_quests.append(quest_data)
            else:
                incomplete_quests.append(quest_data)
        
        # Calculate statistics
        total_quests = len(quests)
        completed_count = len(completed_quests)
        incomplete_count = len(incomplete_quests)
        completion_rate = (completed_count / total_quests * 100) if total_quests > 0 else 0.0
        
        return {
            "success": True,
            "user_id": user_id,
            "total_quests": total_quests,
            "completed_quests": completed_count,
            "incomplete_quests": incomplete_count,
            "completion_rate": round(completion_rate, 2),
            "quests": {
                "completed": completed_quests,
                "incomplete": incomplete_quests
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error fetching quests for user {user_id}: {str(e)}")
        print(error_details)
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching quests for user: {str(e)}"
        )
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.quest import Quest
from app.schemas.quest import QuestCreate, QuestUpdate, Quest as QuestSchema
from app.models.course import Course as CourseModel
from app.models.user import User as UserModel
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

@router.get("/for-user/{user_id}", response_model=List[QuestSchema])
def get_quests_for_user(user_id: int, db: Session = Depends(get_db)):
    """Get all quests for a specific user (based on their enrolled courses)"""
    # This would need to be implemented based on your enrollment system
    # For now, just return all active quests
    return db.query(Quest).filter(Quest.is_active == True).all()
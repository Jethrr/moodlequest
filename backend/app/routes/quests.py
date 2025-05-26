from typing import List, Optional
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
    db_quest = Quest(
        **quest.model_dump(),
        creator_id=creator_id
    )
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
    query = db.query(Quest)
    
    if course_id is not None:
        query = query.filter(Quest.course_id == course_id)
    
    if is_active is not None:
        query = query.filter(Quest.is_active == is_active)
        
    if difficulty_level is not None:
        query = query.filter(Quest.difficulty_level == difficulty_level)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{quest_id}", response_model=QuestSchema)
def get_quest(quest_id: int, db: Session = Depends(get_db)):
    db_quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if db_quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    return db_quest

@router.put("/{quest_id}", response_model=QuestSchema)
def update_quest(quest_id: int, quest: QuestUpdate, db: Session = Depends(get_db)):
    db_quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if db_quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    update_data = quest.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_quest, key, value)
    
    db.commit()
    db.refresh(db_quest)
    return db_quest

@router.delete("/{quest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quest(quest_id: int, db: Session = Depends(get_db)):
    db_quest = db.query(Quest).filter(Quest.quest_id == quest_id).first()
    if db_quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    db.delete(db_quest)
    db.commit()
    return None

@router.get("/creator/{creator_id}", response_model=List[QuestSchema])
def get_quests_by_creator(creator_id: int, db: Session = Depends(get_db)):
    quests = db.query(Quest).filter(Quest.creator_id == creator_id).all()
    return quests

@router.get("/courses", response_model=dict)
async def get_courses(db: Session = Depends(get_db)):
    """
    Get all available courses.
    """
    try:
        from app.models.course import Course as CourseModel
        
        # Fetch courses
        courses = db.query(CourseModel).all()
        
        # Convert to dict for response
        courses_data = []
        for course in courses:
            courses_data.append({
                "id": course.id,
                "title": course.title,
                "short_name": course.short_name or "",
                "description": course.description,
                "moodle_course_id": course.moodle_course_id,
                "is_active": course.is_active
            })
        
        return {
            "success": True,
            "courses": courses_data
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error getting courses: {str(e)}")
        print(error_details)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error getting courses: {str(e)}"
        )

@router.post("/sample", response_model=QuestSchema, status_code=status.HTTP_201_CREATED)
def create_sample_quest(db: Session = Depends(get_db)):
    """
    Create a sample quest for testing purposes.
    """
    sample_quest = Quest(
        title="Complete Programming Assignment",
        description="Implement a simple algorithm to solve the given problem",
        course_id=1,  # Assuming course with ID 1 exists
        creator_id=1,  # Assuming user with ID 1 exists
        exp_reward=100,
        quest_type="assignment",
        validation_method="manual",
        validation_criteria={"min_score": 70, "required_elements": ["documentation", "tests"]},
        is_active=True,
        difficulty_level=2
    )
    db.add(sample_quest)
    db.commit()
    db.refresh(sample_quest)
    return sample_quest

@router.post("/dummy-data", status_code=201)
async def create_dummy_data(db: Session = Depends(get_db)):
    """
    Create dummy data for testing purposes.
    This endpoint will create dummy quests, courses, and users.
    """
    try:
        # Create dummy courses if none exist
        courses = db.query(CourseModel).all()
        if not courses:
            # Get a teacher user or create one if none exists
            teacher = db.query(UserModel).filter(UserModel.role == "teacher").first()
            if not teacher:
                teacher = UserModel(
                    username="teacher1",
                    email="teacher1@example.com",
                    password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "password"
                    first_name="Teacher",
                    last_name="One",
                    role="teacher",
                    is_active=True
                )
                db.add(teacher)
                db.commit()
            
            dummy_courses = [
                CourseModel(
                    title=f"Course {i}",
                    description=f"Description for Course {i}",
                    course_code=f"COURSE{i}",
                    teacher_id=teacher.id,
                    is_active=True,
                    start_date=datetime.now().date(),
                    end_date=(datetime.now() + timedelta(days=90)).date()
                )
                for i in range(1, 6)
            ]
            db.add_all(dummy_courses)
            db.commit()
            courses = dummy_courses
        
        # Create dummy users if none exist
        users = db.query(UserModel).all()
        if not users:
            dummy_users = [
                UserModel(
                    username=f"user{i}",
                    email=f"user{i}@example.com",
                    password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "password"
                    first_name=f"First{i}",
                    last_name=f"Last{i}",
                    role=random.choice(["student", "teacher"]),
                    is_active=True,
                    profile_image_url=None,
                    moodle_user_id=None,
                    settings={"theme": "light"}
                )
                for i in range(1, 6)
            ]
            db.add_all(dummy_users)
            db.commit()
            users = dummy_users
        
        # Create dummy quests
        now = datetime.now()
        dummy_quests = [
            Quest(
                title=f"Quest {i}",
                description=f"Description for Quest {i}",
                course_id=random.choice(courses).id,  # Changed from course_id to id
                creator_id=random.choice(users).id,
                exp_reward=random.randint(10, 100) * 5,
                quest_type=random.choice(["assignment", "quiz", "project", "reading"]),
                validation_method=random.choice(["automatic", "manual", "peer"]),
                validation_criteria={"criteria": "sample criteria"},
                start_date=now,
                end_date=now + timedelta(days=random.randint(7, 30)),
                is_active=random.choice([True, False]),
                difficulty_level=random.randint(1, 5)
            )
            for i in range(1, 11)
        ]
        
        db.add_all(dummy_quests)
        db.commit()
        
        return {
            "message": "Dummy data created successfully",
            "data": {
                "quests": len(dummy_quests),
                "courses": len(courses),
                "users": len(users)
            }
        }
    except Exception as e:
        # Log the error
        import traceback
        error_details = traceback.format_exc()
        print(f"Error creating dummy data: {str(e)}")
        print(error_details)
        raise HTTPException(status_code=500, detail=f"Error creating dummy data: {str(e)}")

@router.post("/single-dummy", status_code=201)
async def create_single_dummy(db: Session = Depends(get_db)):
    """
    Create a single dummy quest
    """
    try:
        # First make sure we have at least one course and one user
        course = db.query(CourseModel).first()
        if not course:
            teacher = UserModel(
                username="teacherdummy",
                email="teacherdummy@example.com",
                password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                first_name="Teacher",
                last_name="Dummy",
                role="teacher",
                is_active=True
            )
            db.add(teacher)
            db.commit()
            
            course = CourseModel(
                title="Dummy Course",
                description="A dummy course for testing",
                course_code="DUMMY101",
                teacher_id=teacher.id,
                is_active=True,
                start_date=datetime.now().date(),
                end_date=(datetime.now() + timedelta(days=90)).date()
            )
            db.add(course)
            db.commit()
            
            user = teacher
        else:
            user = db.query(UserModel).first()
            if not user:
                user = UserModel(
                    username="userdummy",
                    email="userdummy@example.com",
                    password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                    first_name="User",
                    last_name="Dummy",
                    role="teacher",
                    is_active=True
                )
                db.add(user)
                db.commit()
        
        # Now create a quest
        quest = Quest(
            title="Dummy Quest",
            description="A simple dummy quest for testing",
            course_id=course.id,
            creator_id=user.id,
            exp_reward=100,
            quest_type="assignment",
            validation_method="manual",
            validation_criteria={"criteria": "simple criteria"},
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=7),
            is_active=True,
            difficulty_level=2
        )
        
        db.add(quest)
        db.commit()
        db.refresh(quest)
        
        return {
            "message": "Dummy quest created successfully",
            "quest_id": quest.quest_id
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error creating dummy quest: {str(e)}")
        print(error_details)
        raise HTTPException(status_code=500, detail=f"Error creating dummy quest: {str(e)}")

from typing import Dict, Any

@router.post("/create-quest", status_code=201)
def create_quest_from_frontend(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Create a quest from the frontend payload and save to the database.
    """
    try:
        # Map difficulty string to integer
        difficulty_map = {"Easy": 1, "Medium": 2, "Hard": 3}
        difficulty_raw = payload.get("difficulty", 1)
        if isinstance(difficulty_raw, str):
            difficulty_level = difficulty_map.get(difficulty_raw, 1)
        else:
            difficulty_level = difficulty_raw if isinstance(difficulty_raw, int) else 1

        # Debug: print all courses and their moodle_course_id
        all_courses = db.query(CourseModel).all()
        print("Available courses in DB:")
        for c in all_courses:
            print(f"id={c.id}, moodle_course_id={c.moodle_course_id}, title={c.title}")

        # Map moodleCourse (Moodle course id) to local course id (ensure int type)
        moodle_course_id = payload.get("moodleCourse")
        try:
            moodle_course_id_int = int(moodle_course_id)
        except Exception:
            return {"success": False, "error": f"Invalid moodleCourse id: {moodle_course_id}"}
        course = db.query(CourseModel).filter(CourseModel.moodle_course_id == moodle_course_id_int).first()
        if not course:
            return {"success": False, "error": f"No local course found with moodle_course_id={moodle_course_id_int}"}
        local_course_id = course.id

        # Map creatorId (Moodle user id) to local user id (ensure int type)
        creator_moodle_id = payload.get("creatorId")
        try:
            creator_moodle_id_int = int(creator_moodle_id)
        except Exception:
            return {"success": False, "error": f"Invalid creatorId: {creator_moodle_id}"}
        user = db.query(UserModel).filter(UserModel.moodle_user_id == creator_moodle_id_int).first()
        if not user:
            return {"success": False, "error": f"No local user found with moodle_user_id={creator_moodle_id_int}"}
        local_creator_id = user.id

        quest = Quest(
            title=payload.get("title"),
            description=payload.get("description"),
            course_id=local_course_id,
            creator_id=local_creator_id,
            exp_reward=payload.get("xp", 0),
            quest_type=payload.get("category", "assignment"),
            validation_method="manual",  # or map from payload if available
            validation_criteria={
                "tasks": payload.get("tasks", []),
                "learningObjectives": payload.get("learningObjectives", []),
                "rewards": payload.get("rewards", []),
                "status": payload.get("status"),
                "progress": payload.get("progress"),
            },
            start_date=None,
            end_date=payload.get("deadline"),
            is_active=True,
            difficulty_level=difficulty_level,
            moodle_activity_id=payload.get("moodleActivityId")
        )
        db.add(quest)
        db.commit()
        db.refresh(quest)
        return {"success": True, "quest_id": quest.quest_id, "message": "Quest created successfully"}
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    


@router.get("/assigned-activity-ids", response_model=List[int])
def get_assigned_activity_ids(db: Session = Depends(get_db)):
    assigned_ids = db.query(Quest.moodle_activity_id).filter(Quest.moodle_activity_id != None).all()
    # Flatten the list of tuples
    return [row[0] for row in assigned_ids if row[0] is not None]
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database.connection import get_db
from app.models.quest import Quest, QuestProgress, StudentProgress, ExperiencePoints
from app.models.course import Course
from app.models.user import User
from sqlalchemy import Numeric
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func as sa_func
from sqlalchemy import and_ as sa_and
from sqlalchemy import Integer as SAInteger
from sqlalchemy import text
from sqlalchemy.orm import aliased
from sqlalchemy import update
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

Base = get_db().registry.base if hasattr(get_db(), 'registry') else None

def log_and_ack(event_type: str, data: dict, msg: str):
    logger.info(f"📥 {msg}: %s", data)
    return {
        "status": "success",
        "message": msg,
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat()
    }

# ------------------------
# Placeholder handlers
# ------------------------

# def handle_user_created(data: dict, db: Session):
    """
    Handle user creation webhook from Moodle.
    Creates a new user in the local database if they don't exist.
    """
    moodle_user_id = data.get("user_id")
    username = data.get("username")
    email = data.get("email")
    firstname = data.get("firstname", "")
    lastname = data.get("lastname", "")
    
    if not (moodle_user_id and username and email):
        logger.error("Missing required fields in user_created webhook: %s", data)
        return
    
    # Check if user already exists
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        # Create new user
        user = User(
            moodle_user_id=moodle_user_id, 
            username=username, 
            email=email, 
            first_name=firstname,
            last_name=lastname,
            role="student",  # Default role, can be updated later
            is_active=True
        )
        try:
            db.add(user)
            db.commit()
            logger.info(f"Created new user for moodle_user_id={moodle_user_id}, username={username}")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error creating user: {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {e}")
            raise
    else:
        logger.info(f"User already exists for moodle_user_id={moodle_user_id}, username={username}")

def handle_quiz_attempt_submitted(data: dict, db: Session):
    """
    Handle quiz attempt submission webhook.
    Similar to assignment submission but specifically for quiz activities.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("quiz_id") or data.get("activity_id")  # Support both fields
    moodle_user_id = data.get("user_id")
    attempt_grade = data.get("grade", 0)  # Quiz grade/score
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in quiz attempt webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the quest associated with this quiz
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if not quest:
        logger.warning(f"No active quest found for quiz course_id={course_id}, moodle_activity_id={moodle_activity_id}")
        return

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # --- QUEST PROGRESS ---
    qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
    if not qp:
        qp = QuestProgress(user_id=user_id, quest_id=quest.quest_id, status="not_started", progress_percent=0)
        db.add(qp)
        db.commit()
        db.refresh(qp)

    # Update quest progress
    if not qp.started_at:
        qp.started_at = now
    
    # For quizzes, we might want to consider completion based on grade threshold
    # For now, treat any submission as completion
    qp.status = "completed"
    qp.progress_percent = 100
    qp.completed_at = now
    
    # Handle validation based on quest settings
    if quest.validation_method == "manual":
        qp.validation_notes = f"Quiz submitted with grade: {attempt_grade}. Pending manual validation."
        qp.validated_at = None
    else:
        qp.validated_at = now
        qp.validation_notes = f"Auto-validated quiz submission with grade: {attempt_grade}"
    
    db.commit()

    # --- EXPERIENCE POINTS AND STUDENT PROGRESS ---
    exp_reward = quest.exp_reward or 0
    
    # Could potentially scale XP based on quiz performance
    # For example: exp_reward = int((attempt_grade / 100) * (quest.exp_reward or 0))
    
    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += exp_reward
        sp.quests_completed += 1
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id, 
            course_id=course_id, 
            total_exp=exp_reward, 
            quests_completed=1, 
            last_activity=now
        )
        db.add(sp)
    
    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=exp_reward,
        source_type="quiz",
        source_id=quest.quest_id,
        awarded_at=now,
        notes=f"Auto-awarded for quiz completion (activity_id={moodle_activity_id}, grade={attempt_grade})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Successfully processed quiz attempt for user {user_id}, quest {quest.quest_id}, grade {attempt_grade}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing quiz attempt: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing quiz attempt: {e}")
        raise

def handle_assign_submitted(data: dict, db: Session):
    """
    Handle assignment submission webhook from Moodle.
    Updates quest progress, student progress, and awards experience points.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("assignment_id") or data.get("activity_id")  # Support both fields
    moodle_user_id = data.get("user_id")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in assignment submission webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the quest associated with this assignment
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if not quest:
        logger.warning(f"No active quest found for assignment course_id={course_id}, moodle_activity_id={moodle_activity_id}")
        return

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # --- QUEST PROGRESS ---
    qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
    if not qp:
        qp = QuestProgress(user_id=user_id, quest_id=quest.quest_id, status="not_started", progress_percent=0)
        db.add(qp)
        db.commit()
        db.refresh(qp)
    
    # Update quest progress
    if not qp.started_at:
        qp.started_at = now
    qp.status = "completed"
    qp.progress_percent = 100
    qp.completed_at = now
    
    # Handle validation based on quest settings
    if quest.validation_method == "manual":
        qp.validation_notes = "Assignment submitted. Pending manual validation."
        qp.validated_at = None
    else:
        qp.validated_at = now
        qp.validation_notes = "Auto-validated assignment submission"
    
    exp_reward = quest.exp_reward or 0
    
    # --- STUDENT PROGRESS ---
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += exp_reward
        sp.quests_completed += 1
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id, 
            course_id=course_id, 
            total_exp=exp_reward, 
            quests_completed=1, 
            last_activity=now
        )
        db.add(sp)
    
    # --- EXPERIENCE POINTS ---
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=exp_reward,
        source_type="assignment",
        source_id=quest.quest_id,
        awarded_at=now,
        notes=f"Auto-awarded for assignment completion (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Successfully processed assignment submission for user {user_id}, quest {quest.quest_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing assignment submission: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing assignment submission: {e}")
        raise

def handle_assign_graded(data: dict, db: Session):
    """
    Handle assignment grading webhook from Moodle.
    Updates quest validation status and may award additional XP based on grade.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("assignment_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    grade = data.get("grade", 0)
    max_grade = data.get("max_grade", 100)
    grader_id = data.get("grader_id")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in assignment graded webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the quest associated with this assignment
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True
    ).first()
    
    if not quest:
        logger.warning(f"No quest found for graded assignment course_id={course_id}, moodle_activity_id={moodle_activity_id}")
        return

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Find existing quest progress
    qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
    if not qp:
        logger.warning(f"No quest progress found for user {user_id}, quest {quest.quest_id}")
        return

    # Update validation status based on grade
    now = datetime.utcnow()
    grade_percentage = (grade / max_grade) * 100 if max_grade > 0 else 0
    
    qp.validated_at = now
    qp.validation_notes = f"Graded: {grade}/{max_grade} ({grade_percentage:.1f}%)"
    
    # You might want to implement grade-based validation criteria
    # For example, require minimum 70% to validate the quest
    min_grade_threshold = 70  # This could be configurable per quest
    
    if grade_percentage >= min_grade_threshold:
        # Quest remains completed and validated
        if qp.status == "completed":
            # Optionally award bonus XP for high grades
            if grade_percentage >= 90:
                bonus_xp = int((quest.exp_reward or 0) * 0.2)  # 20% bonus for 90%+
                if bonus_xp > 0:
                    # Update student progress
                    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
                    if sp:
                        sp.total_exp += bonus_xp
                        sp.last_activity = now
                    
                    # Record bonus experience points
                    ep = ExperiencePoints(
                        user_id=user_id,
                        course_id=course_id,
                        amount=bonus_xp,
                        source_type="grade_bonus",
                        source_id=quest.quest_id,
                        awarded_at=now,
                        notes=f"Bonus XP for excellent grade: {grade}/{max_grade} on quest {quest.title}"
                    )
                    db.add(ep)
    else:
        # Grade too low, quest needs revision
        qp.status = "needs_revision"
        qp.validation_notes += f" - Grade below threshold ({min_grade_threshold}%), revision required"
    
    try:
        db.commit()
        logger.info(f"Successfully processed assignment grade for user {user_id}, quest {quest.quest_id}, grade {grade}/{max_grade}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing assignment grade: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing assignment grade: {e}")
        raise

def handle_course_completion_updated(data: dict, db: Session):
    """
    Handle course module completion update webhook from Moodle.
    Awards XP for completing course activities that may not be full quests.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("activity_id") or data.get("module_id")
    moodle_user_id = data.get("user_id")
    completion_state = data.get("completion_state", 1)  # 1 = completed
    activity_type = data.get("activity_type", "unknown")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in course completion webhook payload: %s", data)
        return

    # Only process actual completions
    if completion_state != 1:
        logger.debug(f"Ignoring non-completion state {completion_state} for activity {moodle_activity_id}")
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Check if this is already a quest (if so, it should be handled by other webhooks)
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True
    ).first()
    
    if quest:
        logger.debug(f"Activity {moodle_activity_id} is already a quest, skipping completion XP")
        return

    # Award small XP for general activity completion
    now = datetime.utcnow()
    base_xp_by_type = {
        "page": 5,
        "url": 5,
        "resource": 5,
        "book": 10,
        "lesson": 15,
        "scorm": 20,
        "h5pactivity": 15,
        "unknown": 5
    }
    
    xp_amount = base_xp_by_type.get(activity_type.lower(), 5)
    
    # Check if we already awarded XP for this completion
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "completion",
        ExperiencePoints.source_id == moodle_activity_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for completion of activity {moodle_activity_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,  # This is not a quest completion
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="completion",
        source_id=moodle_activity_id,  # Store the activity_id as source_id
        awarded_at=now,
        notes=f"Activity completion XP for {activity_type} (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for {activity_type} completion to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing course completion: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing course completion: {e}")
        raise

def handle_forum_post_created(data: dict, db: Session):
    """
    Handle forum post creation webhook from Moodle.
    Awards XP for forum engagement and participation.
    """
    moodle_course_id = data.get("course_id")
    moodle_user_id = data.get("user_id")
    forum_id = data.get("forum_id")
    discussion_id = data.get("discussion_id")
    post_id = data.get("post_id")
    
    if not (moodle_course_id and moodle_user_id and forum_id):
        logger.error("Missing required fields in forum post webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award XP for forum participation
    now = datetime.utcnow()
    xp_amount = 10  # Base XP for forum post
    
    # Check for duplicate XP (in case webhook is sent multiple times)
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "forum_post",
        ExperiencePoints.source_id == post_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for forum post {post_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="forum_post",
        source_id=post_id,
        awarded_at=now,
        notes=f"Forum participation XP (forum_id={forum_id}, discussion_id={discussion_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for forum post to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing forum post: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing forum post: {e}")
        raise

def handle_forum_discussion_created(data: dict, db: Session):
    """
    Handle forum discussion creation webhook from Moodle.
    Awards higher XP for creating new discussions vs just posting replies.
    """
    moodle_course_id = data.get("course_id")
    moodle_user_id = data.get("user_id")
    forum_id = data.get("forum_id")
    discussion_id = data.get("discussion_id")
    
    if not (moodle_course_id and moodle_user_id and forum_id and discussion_id):
        logger.error("Missing required fields in forum discussion webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award higher XP for starting discussions
    now = datetime.utcnow()
    xp_amount = 15  # Higher than regular posts (10 XP)
    
    # Check for duplicate XP
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "forum_discussion",
        ExperiencePoints.source_id == discussion_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for forum discussion {discussion_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="forum_discussion",
        source_id=discussion_id,
        awarded_at=now,
        notes=f"Forum discussion creation XP (forum_id={forum_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for forum discussion creation to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing forum discussion: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing forum discussion: {e}")
        raise

def handle_lesson_completed(data: dict, db: Session):
    """
    Handle lesson completion webhook from Moodle.
    Can either be a quest (if mapped) or award general completion XP.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("lesson_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    completion_score = data.get("score", 0)
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in lesson completion webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Check if this lesson is mapped to a quest
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if quest:
        # This is a quest - handle like assignment/quiz completion
        qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
        if not qp:
            qp = QuestProgress(user_id=user_id, quest_id=quest.quest_id, status="not_started", progress_percent=0)
            db.add(qp)
            db.commit()
            db.refresh(qp)
        
        if not qp.started_at:
            qp.started_at = now
        qp.status = "completed"
        qp.progress_percent = 100
        qp.completed_at = now
        
        if quest.validation_method == "manual":
            qp.validation_notes = f"Lesson completed with score: {completion_score}. Pending manual validation."
            qp.validated_at = None
        else:
            qp.validated_at = now
            qp.validation_notes = f"Auto-validated lesson completion with score: {completion_score}"
        
        exp_reward = quest.exp_reward or 0
        
        # Update student progress
        sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += exp_reward
            sp.quests_completed += 1
            sp.last_activity = now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=exp_reward,
                quests_completed=1,
                last_activity=now
            )
            db.add(sp)
        
        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=exp_reward,
            source_type="lesson_quest",
            source_id=quest.quest_id,
            awarded_at=now,
            notes=f"Quest completion for lesson (activity_id={moodle_activity_id}, score={completion_score})"
        )
        db.add(ep)
        
        try:
            db.commit()
            logger.info(f"Successfully processed lesson quest completion for user {user_id}, quest {quest.quest_id}")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error processing lesson quest: {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing lesson quest: {e}")
            raise
    else:
        # Regular lesson completion - award general XP
        xp_amount = 15  # Base XP for lesson completion
        
        # Check for duplicate XP
        existing_xp = db.query(ExperiencePoints).filter(
            ExperiencePoints.user_id == user_id,
            ExperiencePoints.course_id == course_id,
            ExperiencePoints.source_type == "lesson",
            ExperiencePoints.source_id == moodle_activity_id
        ).first()
        
        if existing_xp:
            logger.debug(f"XP already awarded for lesson {moodle_activity_id} by user {user_id}")
            return

        # Update student progress
        sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += xp_amount
            sp.last_activity = now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=xp_amount,
                quests_completed=0,
                last_activity=now
            )
            db.add(sp)

        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=xp_amount,
            source_type="lesson",
            source_id=moodle_activity_id,
            awarded_at=now,
            notes=f"Lesson completion XP (activity_id={moodle_activity_id}, score={completion_score})"
        )
        db.add(ep)
        
        try:
            db.commit()
            logger.info(f"Awarded {xp_amount} XP for lesson completion to user {user_id} in course {course_id}")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error processing lesson completion: {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing lesson completion: {e}")
            raise

def handle_lesson_viewed(data: dict, db: Session):
    """
    Handle lesson view webhook from Moodle.
    Awards small XP for lesson engagement and viewing activities.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("lesson_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    page_id = data.get("page_id")  # Specific lesson page viewed
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in lesson viewed webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award small XP for lesson viewing/engagement
    now = datetime.utcnow()
    xp_amount = 3  # Small XP for viewing activities (less than completion)
    
    # Use page_id if available for more granular tracking, otherwise use lesson_id
    source_id = page_id if page_id else moodle_activity_id
    
    # Check for duplicate XP (prevent XP farming by repeatedly viewing same content)
    # Use a time window to allow re-awarding after some time (e.g., 1 hour)
    time_window = now - timedelta(hours=1)
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "lesson_view",
        ExperiencePoints.source_id == source_id,
        ExperiencePoints.awarded_at >= time_window
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded recently for lesson view {source_id} by user {user_id}")
        return    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="lesson_view",
        source_id=source_id,
        awarded_at=now,
        notes=f"Lesson viewing engagement XP (lesson_id={moodle_activity_id}, page_id={page_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for lesson view to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing lesson view: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing lesson view: {e}")
        raise

def handle_feedback_submitted(data: dict, db: Session):
    """
    Handle feedback activity submission webhook from Moodle.
    Awards XP for completing feedback forms and surveys.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("feedback_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in feedback submission webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Check if this feedback is mapped to a quest
    now = datetime.utcnow()
    quest = db.query(Quest).filter(
        Quest.course_id == course_id,
        Quest.moodle_activity_id == moodle_activity_id,
        Quest.is_active == True,
        (Quest.start_date == None) | (Quest.start_date <= now),
        (Quest.end_date == None) | (Quest.end_date >= now)
    ).first()
    
    if quest:
        # Handle as quest completion
        qp = db.query(QuestProgress).filter_by(user_id=user_id, quest_id=quest.quest_id).first()
        if not qp:
            qp = QuestProgress(user_id=user_id, quest_id=quest.quest_id, status="not_started", progress_percent=0)
            db.add(qp)
            db.commit()
            db.refresh(qp)
        
        if not qp.started_at:
            qp.started_at = now
        qp.status = "completed"
        qp.progress_percent = 100
        qp.completed_at = now
        qp.validated_at = now  # Feedback submissions are typically auto-validated
        qp.validation_notes = "Auto-validated feedback submission"
        
        exp_reward = quest.exp_reward or 0
        
        # Update student progress
        sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += exp_reward
            sp.quests_completed += 1
            sp.last_activity = now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=exp_reward,
                quests_completed=1,
                last_activity=now
            )
            db.add(sp)
        
        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=exp_reward,
            source_type="feedback_quest",
            source_id=quest.quest_id,
            awarded_at=now,
            notes=f"Quest completion for feedback (activity_id={moodle_activity_id})"
        )
        db.add(ep)
        
        logger.info(f"Successfully processed feedback quest completion for user {user_id}, quest {quest.quest_id}")
    else:
        # Regular feedback completion - award engagement XP
        xp_amount = 10  # Base XP for feedback participation
        
        # Check for duplicate XP
        existing_xp = db.query(ExperiencePoints).filter(
            ExperiencePoints.user_id == user_id,
            ExperiencePoints.course_id == course_id,
            ExperiencePoints.source_type == "feedback",
            ExperiencePoints.source_id == moodle_activity_id
        ).first()
        
        if existing_xp:
            logger.debug(f"XP already awarded for feedback {moodle_activity_id} by user {user_id}")
            return

        # Update student progress
        sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
        if sp:
            sp.total_exp += xp_amount
            sp.last_activity = now
        else:
            sp = StudentProgress(
                user_id=user_id,
                course_id=course_id,
                total_exp=xp_amount,
                quests_completed=0,
                last_activity=now
            )
            db.add(sp)

        # Record experience points
        ep = ExperiencePoints(
            user_id=user_id,
            course_id=course_id,
            amount=xp_amount,
            source_type="feedback",
            source_id=moodle_activity_id,
            awarded_at=now,
            notes=f"Feedback participation XP (activity_id={moodle_activity_id})"
        )
        db.add(ep)
        
        logger.info(f"Awarded {xp_amount} XP for feedback submission to user {user_id} in course {course_id}")
    
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing feedback: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing feedback: {e}")
        raise

def handle_glossary_entry_created(data: dict, db: Session):
    logger.info(f"Glossary entry created: {data}")
    # TODO: Implement glossary XP/quest logic

def handle_resource_file_viewed(data: dict, db: Session):
    logger.info(f"Resource file viewed: {data}")
    # TODO: Implement resource file view XP/quest logic

def handle_resource_book_viewed(data: dict, db: Session):
    logger.info(f"Resource book viewed: {data}")
    # TODO: Implement resource book view XP/quest logic

def handle_resource_page_viewed(data: dict, db: Session):
    logger.info(f"Resource page viewed: {data}")
    # TODO: Implement resource page view XP/quest logic

def handle_resource_url_viewed(data: dict, db: Session):
    logger.info(f"Resource URL viewed: {data}")
    # TODO: Implement resource URL view XP/quest logic

def handle_choice_answer_submitted(data: dict, db: Session):
    """
    Handle choice (poll/voting) answer submission webhook from Moodle.
    Awards XP for participating in course polls and voting activities.
    """
    moodle_course_id = data.get("course_id")
    moodle_activity_id = data.get("choice_id") or data.get("activity_id")
    moodle_user_id = data.get("user_id")
    choice_answer = data.get("answer", "")
    
    if not (moodle_course_id and moodle_activity_id and moodle_user_id):
        logger.error("Missing required fields in choice answer webhook payload: %s", data)
        return

    # Find the course
    course = db.query(Course).filter(Course.moodle_course_id == moodle_course_id).first()
    if not course:
        logger.error(f"No local course found for moodle_course_id={moodle_course_id}")
        return
    course_id = course.id

    # Find the user
    user = db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
    if not user:
        logger.error(f"No local user found for moodle_user_id={moodle_user_id}")
        return
    user_id = user.id

    # Award XP for participation
    now = datetime.utcnow()
    xp_amount = 5  # Small XP for quick participation activities
    
    # Check for duplicate XP
    existing_xp = db.query(ExperiencePoints).filter(
        ExperiencePoints.user_id == user_id,
        ExperiencePoints.course_id == course_id,
        ExperiencePoints.source_type == "choice",
        ExperiencePoints.source_id == moodle_activity_id
    ).first()
    
    if existing_xp:
        logger.debug(f"XP already awarded for choice {moodle_activity_id} by user {user_id}")
        return

    # Update student progress
    sp = db.query(StudentProgress).filter_by(user_id=user_id, course_id=course_id).first()
    if sp:
        sp.total_exp += xp_amount
        sp.last_activity = now
    else:
        sp = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_exp=xp_amount,
            quests_completed=0,
            last_activity=now
        )
        db.add(sp)

    # Record experience points
    ep = ExperiencePoints(
        user_id=user_id,
        course_id=course_id,
        amount=xp_amount,
        source_type="choice",
        source_id=moodle_activity_id,
        awarded_at=now,
        notes=f"Choice/poll participation XP (activity_id={moodle_activity_id})"
    )
    db.add(ep)
    
    try:
        db.commit()
        logger.info(f"Awarded {xp_amount} XP for choice participation to user {user_id} in course {course_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error processing choice: {e}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing choice: {e}")
        raise

def handle_wiki_page_created(data: dict, db: Session):
    logger.info(f"Wiki page created: {data}")
    # TODO: Implement wiki page XP/quest logic

def handle_wiki_page_updated(data: dict, db: Session):
    logger.info(f"Wiki page updated: {data}")
    # TODO: Implement wiki page update XP/quest logic

def handle_chat_message_sent(data: dict, db: Session):
    logger.info(f"Chat message sent: {data}")
    # TODO: Implement chat message XP/quest logic

# ------------------------
# Dispatcher map: event -> message + handler
# ------------------------

EVENT_HANDLERS = {
    # "user-created": {
    #     "message": "User created webhook received and logged",
    #     "handler": handle_user_created
    # },
    "quiz/attempt-submitted": {
        "message": "Quiz attempt submitted webhook received and logged",
        "handler": handle_quiz_attempt_submitted
    },
    "assign/submitted": {
        "message": "Assignment submitted webhook received and logged",
        "handler": handle_assign_submitted
    },
    "assign/graded": {
        "message": "Assignment graded webhook received and logged",
        "handler": handle_assign_graded
    },
    "course/completion-updated": {
        "message": "Module completion updated webhook received and logged",
        "handler": handle_course_completion_updated
    },
    "forum/post-created": {
        "message": "Forum post created webhook received and logged",
        "handler": handle_forum_post_created
    },
    "forum/discussion-created": {
        "message": "Forum discussion created webhook received and logged",
        "handler": handle_forum_discussion_created
    },
    "lesson/completed": {
        "message": "Lesson completed webhook received and logged",
        "handler": handle_lesson_completed
    },
    "lesson/viewed": {
        "message": "Lesson viewed webhook received and logged",
        "handler": handle_lesson_viewed
    },
    "feedback/submitted": {
        "message": "Feedback submitted webhook received and logged",
        "handler": handle_feedback_submitted
    },
    "glossary/entry-created": {
        "message": "Glossary entry created webhook received and logged",
        "handler": handle_glossary_entry_created
    },
    "resource/file-viewed": {
        "message": "File viewed webhook received and logged",
        "handler": handle_resource_file_viewed
    },
    "resource/book-viewed": {
        "message": "Book viewed webhook received and logged",
        "handler": handle_resource_book_viewed
    },
    "resource/page-viewed": {
        "message": "Page viewed webhook received and logged",
        "handler": handle_resource_page_viewed
    },
    "resource/url-viewed": {
        "message": "URL viewed webhook received and logged",
        "handler": handle_resource_url_viewed
    },
    "choice/answer-submitted": {
        "message": "Choice answer submitted webhook received and logged",
        "handler": handle_choice_answer_submitted
    },
    "wiki/page-created": {
        "message": "Wiki page created webhook received and logged",
        "handler": handle_wiki_page_created
    },
    "wiki/page-updated": {
        "message": "Wiki page updated webhook received and logged",
        "handler": handle_wiki_page_updated
    },
    "chat/message-sent": {
        "message": "Chat message sent webhook received and logged",
        "handler": handle_chat_message_sent
    },
}

# ------------------------
# Main webhook route
# ------------------------

@router.post("/{event_path:path}")
async def handle_webhook(event_path: str, request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()

        if event_path not in EVENT_HANDLERS:
            raise HTTPException(status_code=404, detail="Unknown webhook event path")

        event_info = EVENT_HANDLERS[event_path]
        msg = event_info["message"]

        handler = event_info.get("handler")
        if handler:
            # Pass db session if handler expects it
            import inspect
            if "db" in inspect.signature(handler).parameters:
                handler(data, db)
            else:
                handler(data)

        return log_and_ack(event_path.replace("/", "_"), data, msg)

    except Exception as e:
        logger.error("❌ Error processing webhook for %s: %s", event_path, str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process webhook: {str(e)}")
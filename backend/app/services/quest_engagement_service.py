"""
Quest Engagement Service
Handles quest engagement tracking and analytics
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.quest import Quest, QuestProgress, QuestEngagementEvent
from app.models.user import User
from app.models.course import Course

logger = logging.getLogger(__name__)

class QuestEngagementService:
    def __init__(self, db: Session):
        self.db = db
    
    # Event to engagement stage mapping
    EVENT_STAGE_MAPPING = {
        # Start events
        'assignment_viewed': 'started',
        'quiz_attempt_started': 'started',
        'lesson_viewed': 'started',
        'file_viewed': 'started',
        'book_viewed': 'started',
        'page_viewed': 'started',
        'url_viewed': 'started',
        
        # Progress events
        'forum_post_created': 'in_progress',
        'forum_discussion_created': 'in_progress',
        'glossary_entry_created': 'in_progress',
        'wiki_page_created': 'in_progress',
        'wiki_page_updated': 'in_progress',
        'chat_message_sent': 'in_progress',
        'choice_answer_submitted': 'in_progress',
        
        # Completion events (final stage)
        'quiz_attempt_submitted': 'completed',
        'assignment_submitted': 'completed',
        'lesson_completed': 'completed',
        'feedback_submitted': 'completed',
        'assignment_graded': 'completed',
        'module_completion_updated': 'completed'
    }
    
    # Event point values
    EVENT_POINTS = {
        # Start
        'assignment_viewed': 5,
        'quiz_attempt_started': 8,
        'lesson_viewed': 5,
        'file_viewed': 3,
        'book_viewed': 3,
        'page_viewed': 3,
        'url_viewed': 3,
        # Progress
        'forum_post_created': 10,
        'forum_discussion_created': 15,
        'glossary_entry_created': 20,
        'wiki_page_created': 25,
        'wiki_page_updated': 15,
        'chat_message_sent': 5,
        'choice_answer_submitted': 10,
        # Completion
        'quiz_attempt_submitted': 50,
        'assignment_submitted': 50,
        'lesson_completed': 50,
        'feedback_submitted': 50,
        'assignment_graded': 25,
        'module_completion_updated': 25
    }

    # Milestone-based progress per activity type (percent when milestone occurs)
    ACTIVITY_MILESTONES = {
        'assignment': {
            'assignment_viewed': 50,
            'assignment_submitted': 100,
            'assignment_graded': 100,
            'module_completion_updated': 100,
        },
        'quiz': {
            'quiz_attempt_started': 25,
            'quiz_attempt_submitted': 75,
            'module_completion_updated': 100,
        },
        'lesson': {
            'lesson_viewed': 50,
            'lesson_completed': 100,
            'module_completion_updated': 100,
        },
        'forum': {
            'forum_discussion_created': 60,
            'forum_post_created': 80,
            'module_completion_updated': 100,
        },
        'resource': {  # files, pages, books, urls
            'file_viewed': 100,
            'book_viewed': 100,
            'page_viewed': 100,
            'url_viewed': 100,
        },
        'feedback': {
            'feedback_submitted': 100,
            'module_completion_updated': 100,
        },
        'choice': {
            'choice_answer_submitted': 100,
            'module_completion_updated': 100,
        },
        'wiki': {
            'wiki_page_created': 60,
            'wiki_page_updated': 80,
            'module_completion_updated': 100,
        },
        'chat': {
            'chat_message_sent': 50,
            'module_completion_updated': 100,
        },
    }

    def _infer_activity_from_event(self, event_type: str) -> str:
        if event_type.startswith('assignment_'):
            return 'assignment'
        if event_type.startswith('quiz_'):
            return 'quiz'
        if event_type.startswith('lesson_'):
            return 'lesson'
        if event_type.startswith('forum_'):
            return 'forum'
        if event_type.startswith('file_') or event_type.startswith('book_') or event_type.startswith('page_') or event_type.startswith('url_'):
            return 'resource'
        if event_type.startswith('feedback_'):
            return 'feedback'
        if event_type.startswith('choice_'):
            return 'choice'
        if event_type.startswith('wiki_'):
            return 'wiki'
        if event_type.startswith('chat_'):
            return 'chat'
        return 'unknown'

    def _apply_milestone_progress(self, qp: QuestProgress, event_type: str):
        activity = self._infer_activity_from_event(event_type)
        milestones = self.ACTIVITY_MILESTONES.get(activity)
        if not milestones:
            return
        if event_type in milestones:
            qp.progress_percent = max(qp.progress_percent or 0, milestones[event_type])
    
    def process_engagement_event(self, data: dict, event_type: str) -> bool:
        """Process a webhook event for quest engagement tracking"""
        try:
            logger.info(f"[ENG] event={event_type} payload={data}")
            # Find quest and user
            quest = self.find_quest_by_activity(data)
            user = self.find_user(data)
            
            if not quest or not user:
                logger.debug(f"No quest or user found for event {event_type}")
                return False
            
            # Get or create quest progress
            qp = self.get_or_create_quest_progress(user.id, quest.quest_id)
            
            # Process the engagement event
            self.update_quest_engagement(qp, data, event_type)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing engagement event {event_type}: {e}")
            return False
    
    def find_quest_by_activity(self, data: dict) -> Optional[Quest]:
        """Find quest by Moodle activity ID"""
        activity_id = (
            data.get('activity_id')
            or data.get('module_id')
            or data.get('quiz_id')
            or data.get('assignment_id')
            or data.get('lesson_id')
            or data.get('forum_id')
            or data.get('file_id')
            or data.get('book_id')
            or data.get('page_id')
            or data.get('url_id')
            or data.get('feedback_id')
            or data.get('choice_id')
            or data.get('wiki_id')
            or data.get('chat_id')
        )
        course_id = data.get('course_id')
        
        if not activity_id or not course_id:
            return None
        
        # Find course
        course = self.db.query(Course).filter(Course.moodle_course_id == course_id).first()
        if not course:
            return None
        
        # Find quest
        quest = self.db.query(Quest).filter(
            Quest.course_id == course.id,
            Quest.moodle_activity_id == activity_id,
            Quest.is_active == True
        ).first()
        logger.info(f"[ENG] resolved activity_id={activity_id} course_id={course_id} -> quest={(quest.quest_id if quest else None)}")
        
        return quest
    
    def find_user(self, data: dict) -> Optional[User]:
        """Find user by Moodle user ID"""
        moodle_user_id = data.get('user_id') or data.get('student_id')
        if not moodle_user_id:
            return None
        
        user = self.db.query(User).filter(User.moodle_user_id == moodle_user_id).first()
        logger.info(f"[ENG] resolve user moodle_user_id={moodle_user_id} -> user={(user.id if user else None)}")
        return user
    
    def get_or_create_quest_progress(self, user_id: int, quest_id: int) -> QuestProgress:
        """Get or create quest progress record"""
        qp = self.db.query(QuestProgress).filter(
            QuestProgress.user_id == user_id,
            QuestProgress.quest_id == quest_id
        ).first()
        
        if not qp:
            qp = QuestProgress(
                user_id=user_id,
                quest_id=quest_id,
                status="not_started",
                progress_percent=0,
                engagement_stage="not_started",
                interaction_count=0,
                engagement_score=0
            )
            self.db.add(qp)
            self.db.commit()
            self.db.refresh(qp)
        
        return qp
    
    def update_quest_engagement(self, qp: QuestProgress, data: dict, event_type: str):
        """Update quest progress based on engagement event"""
        now = datetime.utcnow()
        
        # Update interaction timestamps
        if not qp.first_interaction_at:
            qp.first_interaction_at = now
        qp.last_interaction_at = now
        
        # Determine stage for this event
        new_stage = self.EVENT_STAGE_MAPPING.get(event_type)
        
        # Deduplicate noisy events (e.g., repeated views)
        start_events = {
            'assignment_viewed','quiz_attempt_started','lesson_viewed',
            'file_viewed','book_viewed','page_viewed','url_viewed'
        }
        should_award = True
        if event_type in start_events:
            # Only award start-type event once per quest progress
            existing_start = self.db.query(QuestEngagementEvent).filter(
                QuestEngagementEvent.quest_progress_id == qp.progress_id,
                QuestEngagementEvent.event_type == event_type
            ).first()
            if existing_start:
                should_award = False
        else:
            # For non-start events, avoid awarding if exact same event fired within 5 seconds
            last_same = self.db.query(QuestEngagementEvent).filter(
                QuestEngagementEvent.quest_progress_id == qp.progress_id,
                QuestEngagementEvent.event_type == event_type
            ).order_by(QuestEngagementEvent.id.desc()).first()
            if last_same and last_same.timestamp and (now - last_same.timestamp).total_seconds() < 5:
                should_award = False

        # Apply points and interaction count only if not a duplicate
        points = self.EVENT_POINTS.get(event_type, 0) if should_award else 0
        if should_award:
            qp.engagement_score += points
            qp.interaction_count += 1
        
        if new_stage and self.should_update_stage(qp.engagement_stage, new_stage):
            qp.engagement_stage = new_stage
            if new_stage == 'started' and not qp.started_at:
                qp.started_at = now
            
            # Update status for backward compatibility
            if new_stage in ['started', 'in_progress']:
                qp.status = 'started'
            elif new_stage == 'completed':
                qp.status = 'completed'
                qp.completed_at = now
            elif new_stage == 'validated':
                qp.validated_at = now
        
        # Update progress percentage
        # If quest is completed, automatically set to 100%
        if qp.engagement_stage == 'completed':
            qp.progress_percent = 100
        else:
            # First: apply milestone-based progress if we recognize this event
            before = qp.progress_percent or 0
            self._apply_milestone_progress(qp, event_type)
            # Fallback: if no milestones matched, keep score-based heuristic
            if (qp.progress_percent or 0) == before:
                qp.progress_percent = min(100, qp.engagement_score)
        
        # Record engagement event (store points actually awarded)
        self.record_engagement_event(qp, event_type, data, points)
        
        # Commit changes
        logger.info(f"[ENG] commit qp user={qp.user_id} quest={qp.quest_id} stage={qp.engagement_stage} score={qp.engagement_score} interactions={qp.interaction_count}")
        self.db.commit()
    
    def fix_completed_quest_percentages(self):
        """Fix progress percentages for completed quests that aren't at 100%"""
        try:
            # Find completed quests with progress < 100%
            completed_quests = self.db.query(QuestProgress).filter(
                QuestProgress.engagement_stage == 'completed',
                QuestProgress.progress_percent < 100
            ).all()
            
            fixed_count = 0
            for qp in completed_quests:
                old_percent = qp.progress_percent
                qp.progress_percent = 100
                fixed_count += 1
                logger.info(f"[ENG] Fixed progress: quest={qp.quest_id} user={qp.user_id} {old_percent}% -> 100%")
            
            if fixed_count > 0:
                self.db.commit()
                logger.info(f"[ENG] Fixed {fixed_count} completed quest progress percentages")
            
            return fixed_count
        except Exception as e:
            logger.error(f"Error fixing completed quest percentages: {e}")
            return 0
    
    def should_update_stage(self, current_stage: str, new_stage: str) -> bool:
        """Determine if engagement stage should be updated"""
        stage_order = ['not_started', 'started', 'in_progress', 'completed']
        current_index = stage_order.index(current_stage) if current_stage in stage_order else 0
        new_index = stage_order.index(new_stage) if new_stage in stage_order else 0
        
        return new_index > current_index
    
    def record_engagement_event(self, qp: QuestProgress, event_type: str, data: dict, points: int):
        """Record engagement event in database"""
        event = QuestEngagementEvent(
            quest_progress_id=qp.progress_id,
            event_type=event_type,
            event_data=data,
            engagement_points=points
        )
        self.db.add(event)
    
    def get_quest_analytics(self, quest_id: int) -> Dict:
        """Get analytics for a specific quest"""
        quest = self.db.query(Quest).filter(Quest.quest_id == quest_id).first()
        if not quest:
            return {}
        
        # Get engagement data
        engagement_data = self.db.query(
            QuestProgress.engagement_stage,
            func.count(QuestProgress.progress_id).label('count'),
            func.avg(QuestProgress.engagement_score).label('avg_score'),
            func.avg(QuestProgress.interaction_count).label('avg_interactions')
        ).filter(
            QuestProgress.quest_id == quest_id
        ).group_by(QuestProgress.engagement_stage).all()
        
        # Calculate metrics
        total_students = sum(row.count for row in engagement_data)
        started_count = sum(row.count for row in engagement_data if row.engagement_stage != 'not_started')
        completed_count = sum(row.count for row in engagement_data if row.engagement_stage == 'completed')
        
        # Calculate percentages
        start_rate = (started_count / total_students * 100) if total_students > 0 else 0
        completion_rate = (completed_count / started_count * 100) if started_count > 0 else 0
        
        # Calculate engagement score
        avg_engagement = sum(row.avg_score * row.count for row in engagement_data) / total_students if total_students > 0 else 0
        
        return {
            'quest_id': quest_id,
            'title': quest.title,
            'quest_type': quest.quest_type,
            'difficulty_level': quest.difficulty_level,
            'total_students': total_students,
            'started_count': started_count,
            'completed_count': completed_count,
            'start_rate': round(start_rate, 1),
            'completion_rate': round(completion_rate, 1),
            'engagement_score': round(avg_engagement, 1),
            'stage_breakdown': {
                row.engagement_stage: {
                    'count': row.count,
                    'avg_score': round(row.avg_score or 0, 1),
                    'avg_interactions': round(row.avg_interactions or 0, 1)
                } for row in engagement_data
            }
        }

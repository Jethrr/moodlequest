from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any
from ..models.badge import Badge, UserBadge
from ..models.user import User
from ..models.quest import QuestProgress, StudentProgress
from ..models.streak import UserStreak
from ..models.daily_quest import UserDailyQuest
from datetime import datetime, date


class BadgeService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_badges(self, active_only: bool = True) -> List[Badge]:
        """Get all badges, optionally filter by active status"""
        query = self.db.query(Badge)
        if active_only:
            query = query.filter(Badge.is_active == True)
        return query.all()

    def get_badge_by_id(self, badge_id: int) -> Optional[Badge]:
        """Get a specific badge by ID"""
        return self.db.query(Badge).filter(Badge.badge_id == badge_id).first()

    def get_user_badges(self, user_id: int) -> List[UserBadge]:
        """Get all badges earned by a user"""
        return self.db.query(UserBadge).filter(UserBadge.user_id == user_id).all()

    def get_user_badges_with_progress(self, user_id: int) -> List[dict]:
        """Get all badges with user's progress and earned status"""
        # Get all badges
        all_badges = self.db.query(Badge).filter(Badge.is_active == True).all()
        
        # Convert moodle_user_id to local user_id
        user = self.db.query(User).filter(User.moodle_user_id == user_id).first()
        if not user:
            # If user not found, return empty result
            return []
        
        local_user_id = user.id  # Extract the local user ID
        
        # Get user's earned badges using the local user ID
        earned_badges = self.db.query(UserBadge).filter(UserBadge.user_id == local_user_id).all()
        earned_badge_map = {ub.badge_id: ub for ub in earned_badges}
        
        result = []
        for badge in all_badges:
            user_badge = earned_badge_map.get(badge.badge_id)
            progress_data = self._calculate_progress(local_user_id, badge)  # Use local_user_id for progress calculation
            
            badge_dict = {
                "badge_id": badge.badge_id,
                "name": badge.name,
                "description": badge.description,
                "badge_type": badge.badge_type,
                "image_url": badge.image_url,
                "criteria": badge.criteria,
                "exp_value": badge.exp_value,
                "created_at": badge.created_at.isoformat(),
                "created_by": badge.created_by,
                "is_active": badge.is_active
            }
            
            result.append({
                "badge": badge_dict,
                "earned": user_badge is not None,
                "awarded_at": user_badge.awarded_at.isoformat() if user_badge else None,
                "user_badge_id": user_badge.user_badge_id if user_badge else None,
                "course_id": user_badge.course_id if user_badge else None,
                "awarded_by": user_badge.awarded_by if user_badge else None,
                "progress": progress_data["current"],
                "progress_percentage": progress_data["percentage"],
                "progress_target": progress_data["target"]
            })
        
        return result

    def award_badge(self, user_id: int, badge_id: int, awarded_by: Optional[int] = None, course_id: Optional[int] = None) -> Optional[UserBadge]:
        """Award a badge to a user"""
        # Check if user already has this badge
        existing = self.db.query(UserBadge).filter(
            and_(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        ).first()
        
        if existing:
            return existing
        
        # Create new user badge
        user_badge = UserBadge(
            user_id=user_id,
            badge_id=badge_id,
            awarded_by=awarded_by,
            course_id=course_id
        )
        self.db.add(user_badge)
        self.db.commit()
        self.db.refresh(user_badge)
        return user_badge

    def check_and_award_badges(self, user_id: int, course_id: Optional[int] = None, awarded_by: Optional[int] = None) -> List[dict]:
        """Check all badge criteria and award eligible badges"""
        awarded_badges = []
        all_badges = self.get_all_badges(active_only=True)
        
        for badge in all_badges:
            # Skip if user already has this badge
            existing = self.db.query(UserBadge).filter(
                and_(UserBadge.user_id == user_id, UserBadge.badge_id == badge.badge_id)
            ).first()
            if existing:
                continue
            
            # Check if user meets criteria
            if self._check_badge_criteria(user_id, badge):
                awarded_badge = self.award_badge(user_id, badge.badge_id, awarded_by, course_id)
                if awarded_badge:
                    awarded_badges.append({
                        "badge": badge,
                        "exp_bonus": badge.exp_value,
                        "user_badge": awarded_badge
                    })
        
        return awarded_badges

    def manually_award_badge(self, user_id: int, badge_id: int, awarded_by: int, course_id: Optional[int] = None) -> dict:
        """Manually award a badge to a user (admin function)"""
        # Check if user already has this badge
        existing = self.db.query(UserBadge).filter(
            and_(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        ).first()
        
        if existing:
            raise ValueError("User already has this badge")
        
        # Get badge info
        badge = self.get_badge_by_id(badge_id)
        if not badge:
            raise ValueError("Badge not found")
        
        # Award the badge
        user_badge = UserBadge(
            user_id=user_id,
            badge_id=badge_id,
            awarded_by=awarded_by,
            course_id=course_id
        )
        self.db.add(user_badge)
        
        try:
            self.db.commit()
            self.db.refresh(user_badge)
            return {
                "badge": badge,
                "user_badge": user_badge,
                "exp_bonus": badge.exp_value
            }
        except Exception as e:
            self.db.rollback()
            raise e

    def _check_badge_criteria(self, user_id: int, badge: Badge) -> bool:
        """Check if user meets the criteria for a specific badge"""
        criteria = badge.criteria
        criteria_type = criteria.get("type", "")
        target = criteria.get("target", 1)
        
        try:
            if criteria_type == "quest_completion":
                return self._check_quest_completion_criteria(user_id, target, criteria)
            elif criteria_type == "streak_days":
                return self._check_streak_criteria(user_id, target, criteria)
            elif criteria_type == "xp_earned":
                return self._check_xp_criteria(user_id, target, criteria)
            elif criteria_type == "grade_average":
                return self._check_grade_criteria(user_id, target, criteria)
            elif criteria_type == "assignment_submission":
                return self._check_assignment_criteria(user_id, target, criteria)
            elif criteria_type == "participation":
                return self._check_participation_criteria(user_id, target, criteria)
            elif criteria_type == "daily_quest_streak":
                return self._check_daily_quest_streak_criteria(user_id, target, criteria)
            else:
                # Unknown criteria type
                return False
        except Exception as e:
            print(f"Error checking badge criteria for badge {badge.badge_id}: {str(e)}")
            return False

    def _check_quest_completion_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has completed the required number of quests"""
        completed_count = self.db.query(QuestProgress).filter(
            and_(
                QuestProgress.user_id == user_id,
                QuestProgress.status == "completed"
            )
        ).count()
        return completed_count >= target

    def _check_streak_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has maintained a login streak"""
        streak_type = criteria.get("streak_type", "login")
        user_streak = self.db.query(UserStreak).filter(
            and_(
                UserStreak.user_id == user_id,
                UserStreak.streak_type == streak_type
            )
        ).first()
        
        if not user_streak:
            return False
        
        return user_streak.current_streak >= target

    def _check_xp_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has earned the required amount of XP"""
        student_progress = self.db.query(StudentProgress).filter(
            StudentProgress.user_id == user_id
        ).first()
        
        if not student_progress:
            return False
        
        return student_progress.total_exp >= target

    def _check_grade_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user maintains required grade average"""
        # TODO: Implement when grade data is available
        # For now, return False as we don't have grade data model
        return False

    def _check_assignment_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has submitted required number of assignments on time"""
        # TODO: Implement when assignment data is available
        # For now, return False as we don't have assignment data model
        return False

    def _check_participation_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has participated in required activities"""
        # TODO: Implement when participation data is available
        # For now, return False as we don't have participation data model
        return False

    def _check_daily_quest_streak_criteria(self, user_id: int, target: int, criteria: Dict[str, Any]) -> bool:
        """Check if user has completed daily quests for consecutive days"""
        # Get recent daily quest completions
        recent_completions = self.db.query(UserDailyQuest).filter(
            and_(
                UserDailyQuest.user_id == user_id,
                UserDailyQuest.status == "completed"
            )
        ).order_by(UserDailyQuest.completed_at.desc()).limit(target).all()
        
        if len(recent_completions) < target:
            return False
        
        # Check if they're consecutive days
        # This is a simplified check - you might want to make it more sophisticated
        return len(recent_completions) >= target

    def _calculate_progress(self, user_id: int, badge: Badge) -> Dict[str, Any]:
        """Calculate user's progress towards a specific badge"""
        criteria = badge.criteria
        criteria_type = criteria.get("type", "")
        target = criteria.get("target", 1)
        current_progress = 0
        
        try:
            if criteria_type == "quest_completion":
                current_progress = self.db.query(QuestProgress).filter(
                    and_(
                        QuestProgress.user_id == user_id,
                        QuestProgress.status == "completed"
                    )
                ).count()
            elif criteria_type == "streak_days":
                streak_type = criteria.get("streak_type", "login")
                user_streak = self.db.query(UserStreak).filter(
                    and_(
                        UserStreak.user_id == user_id,
                        UserStreak.streak_type == streak_type
                    )
                ).first()
                current_progress = user_streak.current_streak if user_streak else 0
            elif criteria_type == "xp_earned":
                student_progress = self.db.query(StudentProgress).filter(
                    StudentProgress.user_id == user_id
                ).first()
                current_progress = student_progress.total_exp if student_progress else 0
            elif criteria_type == "daily_quest_streak":
                recent_completions = self.db.query(UserDailyQuest).filter(
                    and_(
                        UserDailyQuest.user_id == user_id,
                        UserDailyQuest.status == "completed"
                    )
                ).count()
                current_progress = recent_completions
            else:
                current_progress = 0
        except Exception as e:
            print(f"Error calculating progress for badge {badge.badge_id}: {str(e)}")
            current_progress = 0
        
        # Calculate completion percentage
        completion_percentage = min(100.0, (current_progress / target) * 100) if target > 0 else 0.0
        
        return {
            "current": current_progress,
            "target": target,
            "percentage": completion_percentage
        }

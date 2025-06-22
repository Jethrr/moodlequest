from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
from ..models.badge import Badge, UserBadge
from ..models.user import User


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
        
        # Get user's earned badges
        earned_badges = self.db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
        earned_badge_map = {ub.badge_id: ub for ub in earned_badges}
        
        result = []
        for badge in all_badges:
            user_badge = earned_badge_map.get(badge.badge_id)
            progress_data = self._calculate_progress(user_id, badge)
            
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
            
            # Check if user meets criteria (simplified for now)
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
        """Check if user meets the criteria for a specific badge (simplified)"""
        # For now, return False - we'll implement this later when we have quest data
        return False

    def _calculate_progress(self, user_id: int, badge: Badge) -> Dict[str, Any]:
        """Calculate user's progress towards a specific badge (simplified)"""
        criteria = badge.criteria
        target = criteria.get("target", 1)
        
        # For now, return dummy progress - we'll implement this later
        current_progress = 0
        completion_percentage = 0.0
        
        return {
            "current": current_progress,
            "target": target,
            "percentage": completion_percentage
        }

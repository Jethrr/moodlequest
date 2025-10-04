from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import logging

from app.models.virtual_pet import VirtualPet, PetAccessory
from app.models.quest import StudentProgress, ExperiencePoints
from app.models.user import User
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class PetService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

    def calculate_user_level(self, user_id: int) -> int:
        """Calculate user level based on total experience points."""
        # Get total experience points across all courses
        total_exp = self.db.query(func.sum(ExperiencePoints.amount)).filter(
            ExperiencePoints.user_id == user_id
        ).scalar() or 0
        
        # Use the same leveling formula as the frontend
        if total_exp < 0:
            return 1
        
        level = 1
        xp_accumulated = 0
        
        while xp_accumulated <= total_exp:
            level += 1
            xp_for_next_level = self._get_xp_for_level(level)
            if xp_accumulated + xp_for_next_level > total_exp:
                level -= 1
                break
            xp_accumulated += xp_for_next_level
        
        return max(1, level)

    def _get_xp_for_level(self, level: int) -> int:
        """Calculate XP required for a specific level using exponential curve."""
        if level <= 1:
            return 0
        
        base = 100
        exponent = 1.5
        linear_factor = 50
        
        return int(base * (level - 1) ** exponent + (level - 1) * linear_factor)

    def synchronize_pet_level(self, user_id: int) -> Dict[str, Any]:
        """Synchronize pet level with user level and handle level-based unlocks."""
        pet = self.db.query(VirtualPet).filter(VirtualPet.user_id == user_id).first()
        if not pet:
            return {"error": "No pet found for user"}
        
        user_level = self.calculate_user_level(user_id)
        sync_result = pet.synchronize_with_user_level(user_level)
        
        # Check for new accessory unlocks
        unlocked_accessories = self._check_accessory_unlocks(pet, user_level)
        
        # Send notifications for level ups and new accessories
        if sync_result["level_ups"] > 0:
            self._send_level_up_notification(user_id, sync_result["new_level"], sync_result["level_ups"])
        
        if unlocked_accessories:
            self._send_accessory_unlock_notifications(user_id, unlocked_accessories)
        
        self.db.commit()
        
        return {
            **sync_result,
            "unlocked_accessories": unlocked_accessories,
            "user_level": user_level
        }

    def _check_accessory_unlocks(self, pet: VirtualPet, user_level: int) -> List[Dict[str, Any]]:
        """Check which accessories should be unlocked at the current level."""
        # Kitten is first (level 2), then Scratch Pole (5), Cat Mattress (7), Food Bowl (8)
        available_accessories = [
            {
                "name": "Friend (Kitten)",
                "description": "A companion for your virtual pet.",
                "accessory_type": "bottom-left",
                "icon_url": "/pet-access/kitten.png",
                "level_required": 2,
                "stats_boost": json.dumps({"happiness_boost": 20})
            },
            {
                "name": "Scratch Pole",
                "description": "A scratching post for exercise.",
                "accessory_type": "left",
                "icon_url": "/pet-access/pole.png",
                "level_required": 5,
                "stats_boost": json.dumps({"happiness_boost": 15})
            },
            {
                "name": "Cat Mattress",
                "description": "A cozy bed designed for optimal rest.",
                "accessory_type": "background",
                "icon_url": "/pet-access/bed.png",
                "level_required": 7,
                "stats_boost": json.dumps({"energy_boost": 10})
            },
            {
                "name": "Food Bowl",
                "description": "A special feeding bowl.",
                "accessory_type": "bottom-right",
                "icon_url": "/pet-access/food.png",
                "level_required": 8,
                "stats_boost": json.dumps({"energy_boost": 15})
            }
        ]
        
        unlocked_accessories = []
        
        for accessory_data in available_accessories:
            if user_level >= accessory_data["level_required"]:
                # Check if accessory already exists for this pet
                existing_accessory = self.db.query(PetAccessory).filter(
                    PetAccessory.pet_id == pet.pet_id,
                    PetAccessory.name == accessory_data["name"]
                ).first()
                
                if not existing_accessory:
                    # Create new accessory
                    new_accessory = PetAccessory(
                        pet_id=pet.pet_id,
                        accessory_type=accessory_data["accessory_type"],
                        name=accessory_data["name"],
                        description=accessory_data["description"],
                        icon_url=accessory_data["icon_url"],
                        level_required=accessory_data["level_required"],
                        stats_boost=accessory_data["stats_boost"],
                        is_equipped=0
                    )
                    self.db.add(new_accessory)
                    unlocked_accessories.append(accessory_data)
        
        return unlocked_accessories

    def _send_level_up_notification(self, user_id: int, new_level: int, levels_gained: int):
        """Send notification for pet level up."""
        try:
            self.notification_service.send_notification(
                user_id=user_id,
                title="Pet Level Up! 🎉",
                message=f"Your pet has leveled up to level {new_level}! Keep learning to help your pet grow stronger!",
                notification_type="pet_level_up",
                data={
                    "new_level": new_level,
                    "levels_gained": levels_gained
                }
            )
        except Exception as e:
            logger.error(f"Failed to send level up notification: {e}")

    def _send_accessory_unlock_notifications(self, user_id: int, unlocked_accessories: List[Dict[str, Any]]):
        """Send notifications for newly unlocked accessories."""
        for accessory in unlocked_accessories:
            try:
                self.notification_service.send_notification(
                    user_id=user_id,
                    title="New Pet Accessory Unlocked! 🎁",
                    message=f"You've unlocked '{accessory['name']}' for your pet! Equip it to give your pet a boost!",
                    notification_type="accessory_unlocked",
                    data={
                        "accessory_name": accessory["name"],
                        "accessory_type": accessory["accessory_type"]
                    }
                )
            except Exception as e:
                logger.error(f"Failed to send accessory unlock notification: {e}")

    def get_pet_with_synchronized_level(self, user_id: int) -> Optional[VirtualPet]:
        """Get pet with synchronized level and return level info."""
        pet = self.db.query(VirtualPet).filter(VirtualPet.user_id == user_id).first()
        if not pet:
            return None
        
        # Synchronize level before returning
        user_level = self.calculate_user_level(user_id)
        pet.synchronize_with_user_level(user_level)
        self.db.commit()
        
        return pet

    def get_available_accessories_for_level(self, user_level: int) -> List[Dict[str, Any]]:
        """Get all accessories available at a given user level, matching unlock order and levels."""
        available_accessories = [
            {
                "accessory_id": 1,
                "name": "Friend (Kitten)",
                "description": "A companion for your virtual pet.",
                "accessory_type": "bottom-left",
                "icon_url": "/pet-access/kitten.png",
                "level_required": 2,
                "stats_boost": {"happiness_boost": 20},
                "unlocked": user_level >= 2
            },
            {
                "accessory_id": 2,
                "name": "Scratch Pole",
                "description": "A scratching post for exercise.",
                "accessory_type": "left",
                "icon_url": "/pet-access/pole.png",
                "level_required": 5,
                "stats_boost": {"happiness_boost": 15},
                "unlocked": user_level >= 5
            },
            {
                "accessory_id": 3,
                "name": "Cat Mattress",
                "description": "A cozy bed designed for optimal rest.",
                "accessory_type": "background",
                "icon_url": "/pet-access/bed.png",
                "level_required": 7,
                "stats_boost": {"energy_boost": 10},
                "unlocked": user_level >= 7
            },
            {
                "accessory_id": 4,
                "name": "Food Bowl",
                "description": "A special feeding bowl.",
                "accessory_type": "bottom-right",
                "icon_url": "/pet-access/food.png",
                "level_required": 8,
                "stats_boost": {"energy_boost": 15},
                "unlocked": user_level >= 8
            }
        ]
        return available_accessories

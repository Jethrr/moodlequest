from sqlalchemy.orm import Session
from app.models.virtual_pet import VirtualPet, PetAccessory
from app.models.user import User
from sqlalchemy import and_
from typing import Optional, List
import json

def get_virtual_pet_by_user(db: Session, user_id: int) -> Optional[VirtualPet]:
    return db.query(VirtualPet).filter(VirtualPet.user_id == user_id).first()

def update_virtual_pet_name(db: Session, user_id: int, name: str) -> Optional[VirtualPet]:
    pet = get_virtual_pet_by_user(db, user_id)
    if pet:
        pet.name = name
        db.commit()
        db.refresh(pet)
    return pet

def feed_virtual_pet(db: Session, user_id: int) -> Optional[VirtualPet]:
    pet = get_virtual_pet_by_user(db, user_id)
    if pet:
        pet.energy = min(100, pet.energy + 20)
        pet.last_fed = db.func.now()
        db.commit()
        db.refresh(pet)
    return pet

def play_with_virtual_pet(db: Session, user_id: int) -> Optional[VirtualPet]:
    pet = get_virtual_pet_by_user(db, user_id)
    if pet:
        pet.happiness = min(100, pet.happiness + 15)
        pet.energy = max(0, pet.energy - 10)
        pet.last_played = db.func.now()
        db.commit()
        db.refresh(pet)
    return pet

def get_available_accessories(db: Session, user_id: int):
    pet = get_virtual_pet_by_user(db, user_id)
    if not pet:
        return [], 1
    accessories = db.query(PetAccessory).filter(PetAccessory.level_required <= pet.level).all()
    return accessories, pet.level

def get_equipped_accessories(db: Session, user_id: int):
    pet = get_virtual_pet_by_user(db, user_id)
    if not pet:
        return []
    equipped = db.query(PetAccessory).filter(and_(PetAccessory.pet_id == pet.pet_id, PetAccessory.is_equipped == 1)).all()
    return equipped

def equip_accessory(db: Session, user_id: int, accessory_id: int, equip: bool):
    pet = get_virtual_pet_by_user(db, user_id)
    if not pet:
        return None
    accessory = db.query(PetAccessory).filter(and_(PetAccessory.accessory_id == accessory_id, PetAccessory.pet_id == pet.pet_id)).first()
    if not accessory:
        return None
    accessory.is_equipped = 1 if equip else 0
    db.commit()
    db.refresh(accessory)
    # Optionally update pet stats
    stats_boost = json.loads(accessory.stats_boost) if accessory.stats_boost else {}
    happiness = pet.happiness + stats_boost.get("happinessBoost", 0)
    energy = pet.energy + stats_boost.get("energyBoost", 0)
    pet.happiness = min(100, happiness)
    pet.energy = min(100, energy)
    db.commit()
    db.refresh(pet)
    return {"pet_stats": {"happiness": pet.happiness, "energy": pet.energy}, "message": "Accessory equipped."}

def sync_pet_level(db: Session, user_id: int):
    pet = get_virtual_pet_by_user(db, user_id)
    if not pet:
        return {"new_level": 1, "level_ups": 0, "unlocked_accessories": []}
    # Assume user level is stored elsewhere, here we just increment for demo
    old_level = pet.level
    new_level = old_level + 1
    pet.level = new_level
    db.commit()
    db.refresh(pet)
    unlocked_accessories = db.query(PetAccessory).filter(and_(PetAccessory.level_required == new_level, PetAccessory.pet_id == pet.pet_id)).all()
    return {"new_level": new_level, "level_ups": new_level - old_level, "unlocked_accessories": [a.accessory_id for a in unlocked_accessories]}

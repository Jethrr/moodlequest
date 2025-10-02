from sqlalchemy.orm import Session
from app.models.virtual_pet import VirtualPet, PetAccessory

# This seeder assigns unlocked accessories to all pets at their current level

def seed_unlocked_accessories_for_pets(db: Session):
    pets = db.query(VirtualPet).all()
    for pet in pets:
        # Get user level
        user_level = pet.level
        # Get all accessories unlocked at or below this level
        unlocked_accessories = db.query(PetAccessory).filter(
            PetAccessory.level_required <= user_level
        ).all()
        for accessory in unlocked_accessories:
            # Check if accessory already assigned to pet
            exists = db.query(PetAccessory).filter(
                PetAccessory.accessory_id == accessory.accessory_id,
                PetAccessory.pet_id == pet.pet_id
            ).first()
            if not exists:
                # Assign accessory to pet
                new_accessory = PetAccessory(
                    pet_id=pet.pet_id,
                    accessory_id=accessory.accessory_id,
                    accessory_type=accessory.accessory_type,
                    name=accessory.name,
                    description=accessory.description,
                    icon_url=accessory.icon_url,
                    level_required=accessory.level_required,
                    stats_boost=accessory.stats_boost,
                    is_equipped=0
                )
                db.add(new_accessory)
    db.commit()

# Usage example (run in a script or shell):
# from app.database.connection import get_db
# db = next(get_db())
# seed_unlocked_accessories_for_pets(db)

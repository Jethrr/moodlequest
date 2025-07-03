from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PetBase(BaseModel):
    name: str = Field(..., max_length=100)
    species: str = Field(..., max_length=50)
    happiness: float = Field(default=100.0, ge=0, le=100)
    energy: float = Field(default=100.0, ge=0, le=100)


class PetCreate(PetBase):
    user_id: int


class PetUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    happiness: Optional[float] = Field(None, ge=0, le=100)
    energy: Optional[float] = Field(None, ge=0, le=100)
    last_fed: Optional[datetime] = None
    last_played: Optional[datetime] = None


class Pet(PetBase):
    pet_id: int
    user_id: int
    last_fed: datetime
    last_played: datetime
    created_at: datetime
    last_updated: datetime

    class Config:
        from_attributes = True


class PetAccessoryBase(BaseModel):
    accessory_type: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    icon_url: Optional[str] = Field(None, max_length=255)
    level_required: int = Field(default=1, ge=1)
    stats_boost: Optional[str] = None  # JSON string for stats
    is_equipped: int = Field(default=0, ge=0, le=1)  # 0 = not equipped, 1 = equipped


class PetAccessoryCreate(PetAccessoryBase):
    pet_id: int


class PetAccessoryUpdate(BaseModel):
    accessory_type: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon_url: Optional[str] = Field(None, max_length=255)
    level_required: Optional[int] = Field(None, ge=1)
    stats_boost: Optional[str] = None
    is_equipped: Optional[int] = Field(None, ge=0, le=1)


class PetAccessory(PetAccessoryBase):
    accessory_id: int
    pet_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PetWithAccessories(Pet):
    accessories: List[PetAccessory] = []


class PetStats(BaseModel):
    """Pet statistics and calculated values"""
    level: int
    experience_points: int
    evolution_stage: str
    days_owned: int
    happiness_status: str
    energy_status: str
    needs_attention: bool


class PetInteractionResponse(BaseModel):
    success: bool
    message: str
    pet: Pet
    stats: PetStats
    rewards: Optional[List[Dict[str, Any]]] = None


# Pet Species Configuration
PET_SPECIES_CONFIG = {
    "dragon": {
        "name": "Dragon",
        "description": "A wise and powerful companion that grows stronger with knowledge",
        "evolution_stages": ["egg", "hatchling", "young_dragon", "adult_dragon", "ancient_dragon"],
        "happiness_boost_learning": 15,
        "energy_boost_completion": 20,
        "special_abilities": ["wisdom_boost", "xp_multiplier"]
    },
    "phoenix": {
        "name": "Phoenix",
        "description": "A resilient bird that rises from challenges and motivates continuous learning",
        "evolution_stages": ["spark", "flame", "firebird", "phoenix", "eternal_phoenix"],
        "happiness_boost_learning": 12,
        "energy_boost_completion": 25,
        "special_abilities": ["resilience_boost", "streak_protection"]
    },
    "owl": {
        "name": "Owl",
        "description": "A scholarly companion that thrives on consistent study habits",
        "evolution_stages": ["owlet", "young_owl", "wise_owl", "great_owl", "ancient_sage"],
        "happiness_boost_learning": 20,
        "energy_boost_completion": 15,
        "special_abilities": ["study_bonus", "hint_provider"]
    },
    "fox": {
        "name": "Fox",
        "description": "A clever and adaptable partner that excels in problem-solving",
        "evolution_stages": ["kit", "young_fox", "clever_fox", "wise_fox", "mystical_fox"],
        "happiness_boost_learning": 18,
        "energy_boost_completion": 18,
        "special_abilities": ["problem_solving_boost", "adaptive_learning"]
    },
    "wolf": {
        "name": "Wolf",
        "description": "A loyal companion that encourages teamwork and collaboration",
        "evolution_stages": ["pup", "young_wolf", "pack_wolf", "alpha_wolf", "legendary_wolf"],
        "happiness_boost_learning": 10,
        "energy_boost_completion": 22,
        "special_abilities": ["collaboration_boost", "group_bonus"]
    }
}

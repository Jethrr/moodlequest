from sqlalchemy.orm import Session
from app.models.badge import Badge


def seed_badges(db: Session):
    """Create sample badges for the gamification system"""
    
    # Check if badges already exist
    existing_badges = db.query(Badge).first()
    if existing_badges:
        print("Badges already exist, skipping seeding")
        return
    
    sample_badges = [
        {
            "name": "First Quest",
            "description": "Complete your first quest",
            "badge_type": "quest_completion",
            "image_url": "/badges/first-quest.png",
            "criteria": {"quest_count": 1},
            "exp_value": 50
        },
        {
            "name": "Streak Master",
            "description": "Maintain a 7-day login streak",
            "badge_type": "streak",
            "image_url": "/badges/streak-master.png",
            "criteria": {"streak_days": 7},
            "exp_value": 100
        },
        {
            "name": "Knowledge Seeker",
            "description": "Complete 10 quests",
            "badge_type": "quest_completion",
            "image_url": "/badges/knowledge-seeker.png",
            "criteria": {"quest_count": 10},
            "exp_value": 200
        },
        {
            "name": "XP Master",
            "description": "Earn 1000 total XP",
            "badge_type": "xp",
            "image_url": "/badges/xp-master.png",
            "criteria": {"total_xp": 1000},
            "exp_value": 150
        },
        {
            "name": "Social Butterfly",
            "description": "Join a study group",
            "badge_type": "social",
            "image_url": "/badges/social-butterfly.png",
            "criteria": {"study_groups": 1},
            "exp_value": 75
        },
        {
            "name": "Legendary",
            "description": "Reach level 50",
            "badge_type": "level",
            "image_url": "/badges/legendary.png",
            "criteria": {"level": 50},
            "exp_value": 500
        },
        {
            "name": "Perfect Week",
            "description": "Complete all daily quests for 7 days",
            "badge_type": "daily_quest",
            "image_url": "/badges/perfect-week.png",
            "criteria": {"perfect_days": 7},
            "exp_value": 300
        },
        {
            "name": "Quiz Master",
            "description": "Score 100% on 10 quizzes",
            "badge_type": "quiz",
            "image_url": "/badges/quiz-master.png",
            "criteria": {"perfect_scores": 10},
            "exp_value": 250
        },
        {
            "name": "Speed Runner",
            "description": "Complete a quest in under 5 minutes",
            "badge_type": "speed",
            "image_url": "/badges/speed-runner.png",
            "criteria": {"completion_time": 300},  # 5 minutes in seconds
            "exp_value": 100
        },
        {
        "name": "Consistent Challenger",
        "description": "Complete daily quests for 5 days",
        "badge_type": "daily_quest",
        "image_url": "/badges/consistent-challenger.png",
        "criteria": {"perfect_days": 5},
        "exp_value": 200
    },
        {
            "name": "Champion",
            "description": "Reach #1 on the leaderboard",
            "badge_type": "leaderboard",
            "image_url": "/badges/champion.png",
            "criteria": {"leaderboard_rank": 1},
            "exp_value": 1000
        },
        {
            "name": "Early Bird",
            "description": "Complete 5 quests before 9 AM",
            "badge_type": "time",
            "image_url": "/badges/early-bird.png",
            "criteria": {"early_completions": 5},
            "exp_value": 150
        }
    ]
    
    for badge_data in sample_badges:
        badge = Badge(**badge_data)
        db.add(badge)
    
    db.commit()
    print(f"Created {len(sample_badges)} sample badges")


if __name__ == "__main__":
    from app.database.connection import SessionLocal
    
    with SessionLocal() as db:
        seed_badges(db)

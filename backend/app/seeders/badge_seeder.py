from sqlalchemy.orm import Session
from app.models.badge import Badge

def seed_badges(db: Session):
    """Seed predefined badges into the database"""
    
    badges_data = [
        {
            "name": "First Quest",
            "description": "Complete your very first quest",
            "badge_type": "achievement",
            "image_url": "/badges/first-quest.png",
            "criteria": {
                "type": "quest_completion",
                "target": 1,
                "description": "Complete 1 quest"
            },
            "exp_value": 50,
            "created_by": None,  # System badge
            "is_active": True
        },
        {
            "name": "Streak Master",
            "description": "Login for 7 consecutive days",
            "badge_type": "streak",
            "image_url": "/badges/streak-master.png",
            "criteria": {
                "type": "streak_days",
                "target": 7,
                "description": "Login for 7 consecutive days"
            },
            "exp_value": 100,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Knowledge Seeker",
            "description": "Complete 10 quests",
            "badge_type": "achievement",
            "image_url": "/badges/knowledge-seeker.png",
            "criteria": {
                "type": "quest_completion",
                "target": 10,
                "description": "Complete 10 quests"
            },
            "exp_value": 200,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "XP Master",
            "description": "Earn 1000 experience points",
            "badge_type": "experience",
            "image_url": "/badges/xp-master.png",
            "criteria": {
                "type": "total_exp",
                "target": 1000,
                "description": "Earn 1000 total XP"
            },
            "exp_value": 150,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Quiz Ace",
            "description": "Score 100% on 5 quizzes",
            "badge_type": "performance",
            "image_url": "/badges/quiz-ace.png",
            "criteria": {
                "type": "perfect_scores",
                "target": 5,
                "description": "Get 100% score on 5 quizzes"
            },
            "exp_value": 250,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Social Butterfly",
            "description": "Join a study group",
            "badge_type": "social",
            "image_url": "/badges/social-butterfly.png",
            "criteria": {
                "type": "study_group_join",
                "target": 1,
                "description": "Join at least 1 study group"
            },
            "exp_value": 75,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Speed Runner",
            "description": "Complete a quest in under 5 minutes",
            "badge_type": "performance",
            "image_url": "/badges/speed-runner.png",
            "criteria": {
                "type": "quest_completion_time",
                "target": 300,  # 5 minutes in seconds
                "comparison": "less_than",
                "description": "Complete a quest in under 5 minutes"
            },
            "exp_value": 100,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Perfect Week",
            "description": "Complete all daily quests for a week",
            "badge_type": "streak",
            "image_url": "/badges/perfect-week.png",
            "criteria": {
                "type": "daily_quest_streak",
                "target": 7,
                "description": "Complete daily quests for 7 consecutive days"
            },
            "exp_value": 300,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Veteran",
            "description": "Reach level 25",
            "badge_type": "level",
            "image_url": "/badges/legendary.png",
            "criteria": {
                "type": "level_reached",
                "target": 50,
                "description": "Reach level 50"
            },
            "exp_value": 1000,
            "created_by": None,
            "is_active": True
        },
        {
            "name": "Champion",
            "description": "Finish in top 3 of monthly leaderboard",
            "badge_type": "ranking",
            "image_url": "/badges/champion.png",
            "criteria": {
                "type": "monthly_ranking",
                "target": 3,
                "comparison": "less_than_or_equal",
                "description": "Finish in top 3 of monthly leaderboard"
            },
            "exp_value": 500,
            "created_by": None,
            "is_active": True
        }
    ]
    
    # Check if badges already exist
    existing_badges = db.query(Badge).count()
    if existing_badges > 0:
        print(f"Found {existing_badges} existing badges. Skipping seeding.")
        return
    
    # Create badges
    created_count = 0
    for badge_data in badges_data:
        # Check if badge with this name already exists
        existing = db.query(Badge).filter(Badge.name == badge_data["name"]).first()
        if not existing:
            badge = Badge(**badge_data)
            db.add(badge)
            created_count += 1
    
    try:
        db.commit()
        print(f"Successfully seeded {created_count} badges!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding badges: {e}")
        raise

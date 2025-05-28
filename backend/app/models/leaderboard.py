from sqlalchemy import Column, Integer, String, Text, Boolean, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Leaderboard(Base):
    __tablename__ = "leaderboards"
    __table_args__ = {'extend_existing': True}
    
    leaderboard_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    course_id = Column(Integer, ForeignKey("courses.id"))
    metric_type = Column(String(50), nullable=False)  # e.g., 'exp', 'quests_completed', 'badges_earned'
    timeframe = Column(String(20), nullable=False)  # e.g., 'weekly', 'monthly', 'all_time'
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    entries = relationship("LeaderboardEntry", back_populates="leaderboard", cascade="all, delete-orphan")
    course = relationship("Course", foreign_keys=[course_id])

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    __table_args__ = {'extend_existing': True}
    
    entry_id = Column(Integer, primary_key=True, autoincrement=True)
    leaderboard_id = Column(Integer, ForeignKey("leaderboards.leaderboard_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(DECIMAL(10, 2), nullable=False)
    rank = Column(Integer)
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    leaderboard = relationship("Leaderboard", back_populates="entries")
    user = relationship("User", foreign_keys=[user_id])

class StudentProgress(Base):
    __tablename__ = "student_progress"
    __table_args__ = {'extend_existing': True}
    
    progress_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    total_exp = Column(Integer, nullable=False, default=0)
    quests_completed = Column(Integer, nullable=False, default=0)
    badges_earned = Column(Integer, nullable=False, default=0)
    engagement_score = Column(DECIMAL(5, 2))
    study_hours = Column(DECIMAL(8, 2), nullable=False, default=0)
    last_activity = Column(TIMESTAMP(timezone=True))
    streak_days = Column(Integer, nullable=False, default=0)
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    course = relationship("Course", foreign_keys=[course_id])

class ExperiencePoint(Base):
    __tablename__ = "experience_points"
    __table_args__ = {'extend_existing': True}
    
    exp_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    amount = Column(Integer, nullable=False)
    source_type = Column(String(50), nullable=False)  # e.g., 'quest_completion', 'badge_earned', 'bonus'
    source_id = Column(Integer)  # ID of the quest, badge, etc.
    awarded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    awarded_by = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    course = relationship("Course", foreign_keys=[course_id])
    awarded_by_user = relationship("User", foreign_keys=[awarded_by]) 
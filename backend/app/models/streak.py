from sqlalchemy import Column, Integer, String, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import date

from app.database.connection import Base

class UserStreak(Base):
    """User streak tracking table"""
    __tablename__ = "streak"

    streak_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    streak_type = Column(String(50), nullable=False)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_activity_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'streak_type', name='uq_user_streak'),
    )

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    profile_image_url = Column(Text, nullable=True)
    moodle_user_id = Column(Integer, nullable=True)
    settings = Column(JSONB, server_default='{}')
    user_token = Column(Text, unique=True, nullable=True)
    
    # Add check constraint on role
    __table_args__ = (
        CheckConstraint(
            "role IN ('student', 'teacher', 'admin')",
            name='users_role_check'
        ),
    )
    
    # Add relationship
    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan") 
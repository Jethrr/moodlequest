from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=True)  # Make nullable for Moodle auth
    hashed_password = Column(String(255), nullable=True)  # Alternative name for password
    first_name = Column(String(100), nullable=True)  # Make nullable
    last_name = Column(String(100), nullable=True)  # Make nullable
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    profile_image_url = Column(Text, nullable=True)
    moodle_user_id = Column(String, nullable=True)  # Changed to String to match auth.py
    moodle_token = Column(String, nullable=True)  # Add the moodle_token field
    settings = Column(JSONB, default={})
    
    # Add relationship
    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan") 
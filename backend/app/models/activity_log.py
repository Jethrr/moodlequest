from sqlalchemy import Column, Integer, String, JSON, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.sql import func
from app.database.connection import Base

class ActivityLog(Base):
    __tablename__ = 'activity_logs'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action_type = Column(String(50), nullable=False)
    action_details = Column(JSONB)
    related_entity_type = Column(String(50))
    related_entity_id = Column(Integer)
    ip_address = Column(INET)
    user_agent = Column(Text)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
    exp_change = Column(Integer, default=0)

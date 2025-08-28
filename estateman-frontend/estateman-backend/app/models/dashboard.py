from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from ..core.database import Base

class DashboardMetrics(Base):
    __tablename__ = "dashboard_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), unique=True, index=True)
    metric_value = Column(Float)
    metric_change = Column(Float, nullable=True)
    change_type = Column(String(20), default="increase")  # increase, decrease, neutral
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class RecentActivity(Base):
    __tablename__ = "recent_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100))
    action = Column(String(255))
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    activity_type = Column(String(50))  # sale, listing, lead, etc.
    amount = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
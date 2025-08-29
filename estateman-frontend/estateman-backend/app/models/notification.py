from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class NotificationType(str, enum.Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"

class NotificationCategory(str, enum.Enum):
    SALES = "Sales"
    LEADS = "Leads"
    FINANCE = "Finance"
    EVENTS = "Events"
    TEAM = "Team"
    SYSTEM = "System"

class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.INFO)
    category = Column(Enum(NotificationCategory), nullable=False)
    
    # Recipients
    user_id = Column(Integer, ForeignKey("users.id"))  # Specific user or null for broadcast
    role_target = Column(String(50))  # Target specific role
    
    # Status
    is_read = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    
    # Metadata
    data = Column(JSON)  # Additional data for the notification
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(NotificationCategory), nullable=False)
    channel = Column(Enum(NotificationChannel), nullable=False)
    is_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
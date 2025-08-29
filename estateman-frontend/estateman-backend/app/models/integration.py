from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class IntegrationType(str, enum.Enum):
    MLS = "mls"
    PAYMENT_GATEWAY = "payment_gateway"
    EMAIL_SERVICE = "email_service"
    SMS_SERVICE = "sms_service"
    CALENDAR = "calendar"
    ACCOUNTING = "accounting"
    DOCUMENT_SIGNING = "document_signing"
    SOCIAL_MEDIA = "social_media"
    CRM = "crm"

class IntegrationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    integration_type = Column(String(50), nullable=False)
    provider = Column(String(50), nullable=False)  # stripe, paypal, sendgrid, etc.
    status = Column(String(20), default=IntegrationStatus.INACTIVE)
    
    # Configuration
    api_key = Column(String(500))
    api_secret = Column(String(500))
    webhook_url = Column(String(500))
    callback_url = Column(String(500))
    settings = Column(JSON)  # Provider-specific settings
    
    # Metadata
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime(timezone=True))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    logs = relationship("IntegrationLog", back_populates="integration", cascade="all, delete-orphan")
    webhooks = relationship("WebhookEvent", back_populates="integration", cascade="all, delete-orphan")

class IntegrationLog(Base):
    __tablename__ = "integration_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    action = Column(String(100), nullable=False)  # sync, send, receive, etc.
    status = Column(String(20), nullable=False)  # success, error, pending
    
    # Request/Response data
    request_data = Column(JSON)
    response_data = Column(JSON)
    error_message = Column(Text)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    duration_ms = Column(Integer)
    
    # Relationships
    integration = relationship("Integration", back_populates="logs")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_id = Column(String(255))  # External event ID
    
    # Event data
    payload = Column(JSON, nullable=False)
    headers = Column(JSON)
    
    # Processing
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Metadata
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    integration = relationship("Integration", back_populates="webhooks")

class APIRateLimit(Base):
    __tablename__ = "api_rate_limits"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)
    
    # Rate limiting
    requests_per_minute = Column(Integer, default=60)
    requests_per_hour = Column(Integer, default=1000)
    requests_per_day = Column(Integer, default=10000)
    
    # Current usage
    current_minute_count = Column(Integer, default=0)
    current_hour_count = Column(Integer, default=0)
    current_day_count = Column(Integer, default=0)
    
    # Reset times
    minute_reset_at = Column(DateTime(timezone=True))
    hour_reset_at = Column(DateTime(timezone=True))
    day_reset_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DataSync(Base):
    __tablename__ = "data_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    sync_type = Column(String(50), nullable=False)  # properties, contacts, transactions
    
    # Sync configuration
    sync_direction = Column(String(20), default="bidirectional")  # import, export, bidirectional
    auto_sync = Column(Boolean, default=False)
    sync_frequency = Column(String(20))  # hourly, daily, weekly
    
    # Sync status
    last_sync_at = Column(DateTime(timezone=True))
    next_sync_at = Column(DateTime(timezone=True))
    sync_status = Column(String(20), default="pending")
    
    # Sync results
    records_processed = Column(Integer, default=0)
    records_success = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    sync_errors = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
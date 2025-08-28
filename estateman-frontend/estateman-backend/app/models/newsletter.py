from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class NewsletterStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENT = "sent"
    CANCELLED = "cancelled"

class SubscriberStatus(str, enum.Enum):
    ACTIVE = "active"
    UNSUBSCRIBED = "unsubscribed"
    BOUNCED = "bounced"

class Newsletter(Base):
    __tablename__ = "newsletters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    content = Column(Text)
    html_content = Column(Text)
    status = Column(String(20), default=NewsletterStatus.DRAFT)
    type = Column(String(50), default="Newsletter")
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    
    # Analytics
    total_recipients = Column(Integer, default=0)
    total_opens = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_bounces = Column(Integer, default=0)
    total_unsubscribes = Column(Integer, default=0)
    
    # Relationships
    template_id = Column(Integer, ForeignKey("email_templates.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    template = relationship("EmailTemplate", back_populates="newsletters")
    analytics = relationship("NewsletterAnalytics", back_populates="newsletter")

class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), default="Newsletter")
    html_content = Column(Text, nullable=False)
    variables = Column(JSON)  # Template variables
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    newsletters = relationship("Newsletter", back_populates="template")

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    status = Column(String(20), default=SubscriberStatus.ACTIVE)
    segments = Column(JSON)  # List of segments
    preferences = Column(JSON)  # Email preferences
    
    # Analytics
    total_opens = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    last_activity = Column(DateTime(timezone=True))
    
    # Timestamps
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    unsubscribed_at = Column(DateTime(timezone=True))
    
    # Relationships
    analytics = relationship("NewsletterAnalytics", back_populates="subscriber")

class NewsletterAnalytics(Base):
    __tablename__ = "newsletter_analytics"

    id = Column(Integer, primary_key=True, index=True)
    newsletter_id = Column(Integer, ForeignKey("newsletters.id"))
    subscriber_id = Column(Integer, ForeignKey("subscribers.id"))
    
    # Events
    sent_at = Column(DateTime(timezone=True))
    opened_at = Column(DateTime(timezone=True))
    clicked_at = Column(DateTime(timezone=True))
    bounced_at = Column(DateTime(timezone=True))
    unsubscribed_at = Column(DateTime(timezone=True))
    
    # Metadata
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    
    # Relationships
    newsletter = relationship("Newsletter", back_populates="analytics")
    subscriber = relationship("Subscriber", back_populates="analytics")

class EmailSequence(Base):
    __tablename__ = "email_sequences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger_event = Column(String(100))  # signup, purchase, etc.
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    emails = relationship("SequenceEmail", back_populates="sequence")

class SequenceEmail(Base):
    __tablename__ = "sequence_emails"

    id = Column(Integer, primary_key=True, index=True)
    sequence_id = Column(Integer, ForeignKey("email_sequences.id"))
    template_id = Column(Integer, ForeignKey("email_templates.id"))
    
    order = Column(Integer, nullable=False)
    delay_days = Column(Integer, default=0)
    delay_hours = Column(Integer, default=0)
    
    subject = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    sequence = relationship("EmailSequence", back_populates="emails")
    template = relationship("EmailTemplate")
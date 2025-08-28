from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class CampaignType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    SOCIAL_MEDIA = "social_media"
    PAID_ADS = "paid_ads"
    NEWSLETTER = "newsletter"

class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AudienceSegment(str, enum.Enum):
    LUXURY_BUYERS = "luxury_buyers"
    FIRST_TIME_BUYERS = "first_time_buyers"
    COMMERCIAL_CLIENTS = "commercial_clients"
    INVESTORS = "investors"
    ALL_CLIENTS = "all_clients"

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    target_audience = Column(SQLEnum(AudienceSegment), nullable=False)
    
    # Campaign content
    content = Column(JSON)  # Flexible content storage
    template_id = Column(Integer, ForeignKey("campaign_templates.id"))
    
    # Scheduling
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    scheduled_at = Column(DateTime(timezone=True))
    
    # Analytics
    total_reach = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_opens = Column(Integer, default=0)
    total_conversions = Column(Integer, default=0)
    budget = Column(Float, default=0.0)
    spent = Column(Float, default=0.0)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    template = relationship("CampaignTemplate", back_populates="campaigns")
    analytics = relationship("CampaignAnalytics", back_populates="campaign", cascade="all, delete-orphan")
    ab_tests = relationship("ABTest", back_populates="campaign", cascade="all, delete-orphan")

class CampaignTemplate(Base):
    __tablename__ = "campaign_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False)
    content = Column(JSON)  # Template content structure
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    campaigns = relationship("Campaign", back_populates="template")

class CampaignAnalytics(Base):
    __tablename__ = "campaign_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    
    # Daily metrics
    date = Column(DateTime(timezone=True), nullable=False)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    opens = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="analytics")

class MarketingMaterial(Base):
    __tablename__ = "marketing_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer)
    
    # Usage tracking
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Metadata
    tags = Column(JSON)  # Array of tags
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    name = Column(String(255), nullable=False)
    test_type = Column(String(50), default="subject_line")
    variant_a_content = Column(JSON)
    variant_b_content = Column(JSON)
    traffic_split = Column(Float, default=50.0)
    
    # Results
    variant_a_opens = Column(Integer, default=0)
    variant_b_opens = Column(Integer, default=0)
    variant_a_clicks = Column(Integer, default=0)
    variant_b_clicks = Column(Integer, default=0)
    variant_a_conversions = Column(Integer, default=0)
    variant_b_conversions = Column(Integer, default=0)
    
    status = Column(String(20), default="draft")
    winner = Column(String(10))
    
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("Campaign", back_populates="ab_tests")

class CampaignAutomation(Base):
    __tablename__ = "campaign_automations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger_type = Column(String(50), nullable=False)
    trigger_conditions = Column(JSON)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    steps = relationship("AutomationStep", back_populates="automation")

class AutomationStep(Base):
    __tablename__ = "automation_steps"

    id = Column(Integer, primary_key=True, index=True)
    automation_id = Column(Integer, ForeignKey("campaign_automations.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    
    step_order = Column(Integer, nullable=False)
    delay_days = Column(Integer, default=0)
    delay_hours = Column(Integer, default=0)
    conditions = Column(JSON)
    
    automation = relationship("CampaignAutomation", back_populates="steps")
    campaign = relationship("Campaign")
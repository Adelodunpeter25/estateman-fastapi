from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ClientStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    LEAD = "lead"
    CONVERTED = "converted"

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class LeadTemperature(str, enum.Enum):
    HOT = "hot"
    WARM = "warm"
    COLD = "cold"

class CommunicationType(str, enum.Enum):
    EMAIL = "email"
    PHONE = "phone"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    MEETING = "meeting"
    NOTE = "note"

class LoyaltyTier(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String(20), unique=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    status = Column(Enum(ClientStatus), default=ClientStatus.LEAD)
    
    # Lead scoring and engagement
    lead_score = Column(Integer, default=0)
    engagement_level = Column(String(20), default="low")
    
    # Loyalty system
    loyalty_points = Column(Integer, default=0)
    loyalty_tier = Column(Enum(LoyaltyTier), default=LoyaltyTier.BRONZE)
    total_spent = Column(Float, default=0.0)
    
    # Preferences and interests
    budget_min = Column(Float)
    budget_max = Column(Float)
    preferred_location = Column(String(255))
    property_interests = Column(JSON)  # Array of property types
    
    # Assignment and tracking
    assigned_agent_id = Column(Integer, ForeignKey("users.id"))
    lead_source = Column(String(100))
    referral_code = Column(String(50))
    
    # Metadata
    tags = Column(JSON)  # Array of tags for segmentation
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_contact_date = Column(DateTime(timezone=True))
    
    # Relationships
    assigned_agent = relationship("User", back_populates="assigned_clients")
    interactions = relationship("ClientInteraction", back_populates="client", cascade="all, delete-orphan")
    loyalty_transactions = relationship("LoyaltyTransaction", back_populates="client", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="client", cascade="all, delete-orphan")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(String(20), unique=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Lead details
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    temperature = Column(Enum(LeadTemperature), default=LeadTemperature.COLD)
    score = Column(Integer, default=0)
    
    # Source and tracking
    source = Column(String(100))
    source_details = Column(JSON)
    campaign_id = Column(String(100))
    
    # Property interest
    interested_property_id = Column(Integer, ForeignKey("properties.id"))
    property_requirements = Column(JSON)
    
    # Timeline and conversion
    qualification_date = Column(DateTime(timezone=True))
    conversion_date = Column(DateTime(timezone=True))
    expected_close_date = Column(DateTime(timezone=True))
    actual_close_date = Column(DateTime(timezone=True))
    
    # Value estimation
    estimated_value = Column(Float)
    actual_value = Column(Float)
    
    # Assignment
    assigned_agent_id = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="leads")
    assigned_agent = relationship("User")
    interested_property = relationship("Property")

class ClientInteraction(Base):
    __tablename__ = "client_interactions"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Interaction details
    type = Column(Enum(CommunicationType), nullable=False)
    subject = Column(String(255))
    content = Column(Text)
    
    # Scheduling and status
    scheduled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    
    # Outcome and follow-up
    outcome = Column(String(100))
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(DateTime(timezone=True))
    
    # Metadata
    interaction_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="interactions")
    agent = relationship("User")

class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Transaction details
    type = Column(String(20))  # earned, redeemed, expired, transferred
    points = Column(Integer, nullable=False)
    description = Column(String(255))
    
    # Reference information
    reference_type = Column(String(50))  # transaction, referral, bonus, etc.
    reference_id = Column(String(100))
    
    # Expiration
    expires_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="loyalty_transactions")

class LeadSource(Base):
    __tablename__ = "lead_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50))  # online, offline, referral, etc.
    cost_per_lead = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ClientSegment(Base):
    __tablename__ = "client_segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    criteria = Column(JSON)  # Segmentation criteria
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RewardCatalog(Base):
    __tablename__ = "reward_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    points_required = Column(Integer, nullable=False)
    category = Column(String(100))
    image_url = Column(String(500))
    terms_conditions = Column(Text)
    is_active = Column(Boolean, default=True)
    stock_quantity = Column(Integer)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CommunicationTemplate(Base):
    __tablename__ = "communication_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(CommunicationType), nullable=False)
    subject = Column(String(255))
    content = Column(Text, nullable=False)
    variables = Column(JSON)  # Available template variables
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CommunicationCampaign(Base):
    __tablename__ = "communication_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(CommunicationType), nullable=False)
    template_id = Column(Integer, ForeignKey("communication_templates.id"))
    target_segment = Column(JSON)  # Client filtering criteria
    scheduled_at = Column(DateTime(timezone=True))
    status = Column(String(50), default="draft")  # draft, scheduled, sent, completed
    
    # Statistics
    total_recipients = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    template = relationship("CommunicationTemplate")

class ClientDuplicate(Base):
    __tablename__ = "client_duplicates"

    id = Column(Integer, primary_key=True, index=True)
    primary_client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    duplicate_client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    match_criteria = Column(JSON)  # What fields matched
    status = Column(String(50), default="pending")  # pending, merged, ignored
    merged_by = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    primary_client = relationship("Client", foreign_keys=[primary_client_id])
    duplicate_client = relationship("Client", foreign_keys=[duplicate_client_id])
    merged_by_user = relationship("User")
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    custom_domain = Column(String(255), unique=True, nullable=True)
    
    # Contact information
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20))
    
    # Status and configuration
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(String(50), default="basic")
    max_users = Column(Integer, default=10)
    max_properties = Column(Integer, default=100)
    
    # Configuration settings
    settings = Column(JSON, default=dict)
    branding = Column(JSON, default=dict)  # Logo, colors, etc.
    
    # Billing information
    billing_email = Column(String(255))
    billing_address = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Trial and subscription info
    trial_ends_at = Column(DateTime(timezone=True))
    subscription_ends_at = Column(DateTime(timezone=True))
    
    # Relationships
    documents = relationship("Document", back_populates="tenant")

class TenantUser(Base):
    __tablename__ = "tenant_users"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    role = Column(String(50), default="user")
    is_admin = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
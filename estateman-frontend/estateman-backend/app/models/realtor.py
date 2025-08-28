from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class RealtorLevel(str, enum.Enum):
    JUNIOR = "junior"
    SENIOR = "senior"
    TEAM_LEAD = "team_lead"

class RealtorStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Realtor(Base):
    __tablename__ = "realtors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    realtor_id = Column(String(20), unique=True, index=True)
    level = Column(Enum(RealtorLevel), default=RealtorLevel.JUNIOR)
    status = Column(Enum(RealtorStatus), default=RealtorStatus.ACTIVE)
    
    # Performance metrics
    total_clients = Column(Integer, default=0)
    active_deals = Column(Integer, default=0)
    total_commissions = Column(Float, default=0.0)
    monthly_target = Column(Float, default=0.0)
    monthly_earned = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    
    # Professional details
    specialties = Column(JSON)  # Array of specialties
    location = Column(String(255))
    license_number = Column(String(100))
    license_expiry = Column(DateTime(timezone=True))
    
    # Commission structure
    commission_rate = Column(Float, default=0.03)  # 3% default
    split_percentage = Column(Float, default=0.70)  # 70% to agent, 30% to brokerage
    
    # Metadata
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="realtor_profile")
    commissions = relationship("Commission", back_populates="realtor", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="realtor", cascade="all, delete-orphan")

class Commission(Base):
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True, index=True)
    realtor_id = Column(Integer, ForeignKey("realtors.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    
    # Commission details
    sale_price = Column(Float, nullable=False)
    commission_rate = Column(Float, nullable=False)
    gross_commission = Column(Float, nullable=False)
    split_percentage = Column(Float, nullable=False)
    net_commission = Column(Float, nullable=False)
    
    # Status and payment
    status = Column(String(20), default="calculating")  # calculating, pending, paid
    paid_date = Column(DateTime(timezone=True))
    payment_method = Column(String(50))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    realtor = relationship("Realtor", back_populates="commissions")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(20), unique=True, index=True)
    realtor_id = Column(Integer, ForeignKey("realtors.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Transaction details
    type = Column(String(20))  # sale, purchase, lease
    status = Column(String(20), default="pending")  # pending, in_progress, completed, cancelled
    sale_price = Column(Float)
    closing_date = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    realtor = relationship("Realtor", back_populates="transactions")
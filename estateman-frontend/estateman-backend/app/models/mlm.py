from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class PartnerLevel(enum.Enum):
    ASSOCIATE = "Associate"
    BRONZE_PARTNER = "Bronze Partner"
    SILVER_PARTNER = "Silver Partner"
    GOLD_PARTNER = "Gold Partner"
    DIAMOND_PARTNER = "Diamond Partner"

class CommissionType(enum.Enum):
    DIRECT_REFERRAL = "Direct Referral"
    LEVEL_BONUS = "Level Bonus"
    TEAM_BONUS = "Team Bonus"
    PERFORMANCE_BONUS = "Performance Bonus"

class MLMPartner(Base):
    __tablename__ = "mlm_partners"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    referral_code = Column(String(20), unique=True, nullable=False)
    sponsor_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=True)
    level = Column(SQLEnum(PartnerLevel), default=PartnerLevel.ASSOCIATE)
    join_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    total_earnings = Column(Float, default=0.0)
    monthly_commission = Column(Float, default=0.0)
    direct_referrals_count = Column(Integer, default=0)
    total_network_size = Column(Integer, default=0)
    network_depth = Column(Integer, default=0)
    
    # Relationships
    sponsor = relationship("MLMPartner", remote_side=[id], backref="downline")
    user = relationship("User", backref="mlm_partner")
    commissions = relationship("MLMCommission", foreign_keys="[MLMCommission.partner_id]", back_populates="partner")

class MLMCommission(Base):
    __tablename__ = "mlm_commissions"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    source_partner_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    commission_type = Column(SQLEnum(CommissionType), nullable=False)
    level = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    reference_transaction_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    is_paid = Column(Boolean, default=False)
    
    # Relationships
    partner = relationship("MLMPartner", foreign_keys=[partner_id], back_populates="commissions")
    source_partner = relationship("MLMPartner", foreign_keys=[source_partner_id])

class ReferralActivity(Base):
    __tablename__ = "referral_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    referred_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    activity_type = Column(String(50), nullable=False)  # "referral", "bonus", "promotion"
    amount = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    referrer = relationship("MLMPartner", foreign_keys=[referrer_id])
    referred = relationship("MLMPartner", foreign_keys=[referred_id])
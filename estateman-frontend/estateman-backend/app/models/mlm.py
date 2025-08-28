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
    LEADERSHIP_OVERRIDE = "Leadership Override"
    RANK_ADVANCEMENT = "Rank Advancement"
    VOLUME_BONUS = "Volume Bonus"

class QualificationStatus(enum.Enum):
    QUALIFIED = "Qualified"
    NOT_QUALIFIED = "Not Qualified"
    PENDING = "Pending"

class PayoutStatus(enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PAID = "Paid"
    CANCELLED = "Cancelled"

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
    adjustments = relationship("CommissionAdjustment", back_populates="commission")

class CommissionRule(Base):
    __tablename__ = "commission_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    commission_type = Column(SQLEnum(CommissionType), nullable=False)
    level = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    min_volume = Column(Float, default=0.0)
    min_rank = Column(SQLEnum(PartnerLevel), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CommissionQualification(Base):
    __tablename__ = "commission_qualifications"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    rule_id = Column(Integer, ForeignKey("commission_rules.id"), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    volume_achieved = Column(Float, default=0.0)
    status = Column(SQLEnum(QualificationStatus), default=QualificationStatus.PENDING)
    qualified_at = Column(DateTime, nullable=True)
    
    # Relationships
    partner = relationship("MLMPartner")
    rule = relationship("CommissionRule")

class CommissionPayout(Base):
    __tablename__ = "commission_payouts"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("mlm_partners.id"), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(PayoutStatus), default=PayoutStatus.PENDING)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    partner = relationship("MLMPartner")
    approver = relationship("User")

class CommissionAdjustment(Base):
    __tablename__ = "commission_adjustments"
    
    id = Column(Integer, primary_key=True, index=True)
    commission_id = Column(Integer, ForeignKey("mlm_commissions.id"), nullable=False)
    adjustment_type = Column(String(50), nullable=False)  # "correction", "chargeback", "bonus"
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    commission = relationship("MLMCommission")
    creator = relationship("User")

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
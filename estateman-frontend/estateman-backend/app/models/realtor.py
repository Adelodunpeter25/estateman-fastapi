from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum, Text
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

class TransactionStatus(str, enum.Enum):
    INITIATED = "initiated"
    UNDER_CONTRACT = "under_contract"
    INSPECTION = "inspection"
    FINANCING = "financing"
    APPRAISAL = "appraisal"
    CLOSING_PREP = "closing_prep"
    CLOSING = "closing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentFrequency(str, enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

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
    disputes = relationship("CommissionDispute", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(20), unique=True, index=True)
    realtor_id = Column(Integer, ForeignKey("realtors.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Transaction details
    type = Column(String(20))  # sale, purchase, lease
    status = Column(Enum(TransactionStatus), default=TransactionStatus.INITIATED)
    sale_price = Column(Float)
    closing_date = Column(DateTime(timezone=True))
    contract_date = Column(DateTime(timezone=True))
    expected_closing_date = Column(DateTime(timezone=True))
    
    # Additional transaction fields
    earnest_money = Column(Float, default=0.0)
    financing_contingency = Column(Boolean, default=True)
    inspection_contingency = Column(Boolean, default=True)
    appraisal_contingency = Column(Boolean, default=True)
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    realtor = relationship("Realtor", back_populates="transactions")
    milestones = relationship("TransactionMilestone", back_populates="transaction", cascade="all, delete-orphan")
    documents = relationship("TransactionDocument", back_populates="transaction", cascade="all, delete-orphan")
    installment_plans = relationship("InstallmentPlan", back_populates="transaction", cascade="all, delete-orphan")

class TransactionMilestone(Base):
    __tablename__ = "transaction_milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    milestone_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(DateTime(timezone=True))
    completed_date = Column(DateTime(timezone=True))
    status = Column(String(20), default="pending")
    assigned_to = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="milestones")

class TransactionDocument(Base):
    __tablename__ = "transaction_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    document_type = Column(String(50), nullable=False)
    document_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    requires_signature = Column(Boolean, default=False)
    signed_date = Column(DateTime(timezone=True))
    signed_by = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="documents")

class InstallmentPlan(Base):
    __tablename__ = "installment_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    plan_name = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    down_payment = Column(Float, default=0.0)
    installment_amount = Column(Float, nullable=False)
    frequency = Column(Enum(PaymentFrequency), default=PaymentFrequency.MONTHLY)
    total_installments = Column(Integer, nullable=False)
    interest_rate = Column(Float, default=0.0)
    late_fee_percentage = Column(Float, default=0.05)
    grace_period_days = Column(Integer, default=5)
    status = Column(String(20), default="active")
    start_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="installment_plans")
    payments = relationship("InstallmentPayment", back_populates="plan", cascade="all, delete-orphan")

class InstallmentPayment(Base):
    __tablename__ = "installment_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("installment_plans.id"), nullable=False)
    installment_number = Column(Integer, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    amount_due = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    late_fee = Column(Float, default=0.0)
    payment_date = Column(DateTime(timezone=True))
    payment_method = Column(String(50))
    payment_reference = Column(String(100))
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    plan = relationship("InstallmentPlan", back_populates="payments")

class CommissionDispute(Base):
    __tablename__ = "commission_disputes"
    
    id = Column(Integer, primary_key=True, index=True)
    commission_id = Column(Integer, ForeignKey("commissions.id"), nullable=False)
    raised_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    dispute_reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    disputed_amount = Column(Float)
    status = Column(String(20), default="open")
    resolution = Column(Text)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
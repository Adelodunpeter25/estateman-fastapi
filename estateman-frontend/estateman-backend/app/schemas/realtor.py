from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.realtor import RealtorLevel, RealtorStatus, TransactionStatus, PaymentStatus, PaymentFrequency

# Realtor Schemas
class RealtorBase(BaseModel):
    level: RealtorLevel = RealtorLevel.JUNIOR
    specialties: Optional[List[str]] = []
    location: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    monthly_target: Optional[float] = 0.0
    commission_rate: Optional[float] = 0.03
    split_percentage: Optional[float] = 0.70

class RealtorCreate(RealtorBase):
    name: str
    email: str
    phone: Optional[str] = None

class RealtorUpdate(BaseModel):
    level: Optional[RealtorLevel] = None
    status: Optional[RealtorStatus] = None
    specialties: Optional[List[str]] = None
    location: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    monthly_target: Optional[float] = None
    commission_rate: Optional[float] = None
    split_percentage: Optional[float] = None

class RealtorResponse(RealtorBase):
    id: int
    realtor_id: str
    user_id: int
    status: RealtorStatus
    total_clients: int
    active_deals: int
    total_commissions: float
    monthly_earned: float
    rating: float
    join_date: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Commission Schemas
class CommissionBase(BaseModel):
    sale_price: float
    commission_rate: float
    split_percentage: float

class CommissionCreate(CommissionBase):
    realtor_id: int
    transaction_id: Optional[int] = None
    property_id: Optional[int] = None
    client_id: Optional[int] = None

class CommissionUpdate(BaseModel):
    status: Optional[str] = None
    paid_date: Optional[datetime] = None
    payment_method: Optional[str] = None

class CommissionResponse(CommissionBase):
    id: int
    realtor_id: int
    gross_commission: float
    net_commission: float
    status: str
    paid_date: Optional[datetime]
    payment_method: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    type: str
    sale_price: Optional[float] = None
    closing_date: Optional[datetime] = None
    contract_date: Optional[datetime] = None
    expected_closing_date: Optional[datetime] = None
    earnest_money: Optional[float] = 0.0
    financing_contingency: Optional[bool] = True
    inspection_contingency: Optional[bool] = True
    appraisal_contingency: Optional[bool] = True
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    realtor_id: int
    property_id: int
    client_id: int

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    sale_price: Optional[float] = None
    closing_date: Optional[datetime] = None
    contract_date: Optional[datetime] = None
    expected_closing_date: Optional[datetime] = None
    earnest_money: Optional[float] = None
    financing_contingency: Optional[bool] = None
    inspection_contingency: Optional[bool] = None
    appraisal_contingency: Optional[bool] = None
    notes: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    transaction_id: str
    realtor_id: int
    property_id: int
    client_id: int
    status: TransactionStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Transaction Milestone Schemas
class TransactionMilestoneBase(BaseModel):
    milestone_type: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    notes: Optional[str] = None

class TransactionMilestoneCreate(TransactionMilestoneBase):
    transaction_id: int

class TransactionMilestoneUpdate(BaseModel):
    status: Optional[str] = None
    completed_date: Optional[datetime] = None
    notes: Optional[str] = None

class TransactionMilestoneResponse(TransactionMilestoneBase):
    id: int
    transaction_id: int
    status: str
    completed_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Transaction Document Schemas
class TransactionDocumentBase(BaseModel):
    document_type: str
    document_name: str
    file_url: str
    file_size: Optional[int] = None
    requires_signature: Optional[bool] = False

class TransactionDocumentCreate(TransactionDocumentBase):
    transaction_id: int
    uploaded_by: int

class TransactionDocumentResponse(TransactionDocumentBase):
    id: int
    transaction_id: int
    uploaded_by: int
    signed_date: Optional[datetime]
    signed_by: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Installment Plan Schemas
class InstallmentPlanBase(BaseModel):
    plan_name: str
    total_amount: float
    down_payment: Optional[float] = 0.0
    installment_amount: float
    frequency: PaymentFrequency
    total_installments: int
    interest_rate: Optional[float] = 0.0
    late_fee_percentage: Optional[float] = 0.05
    grace_period_days: Optional[int] = 5
    start_date: datetime

class InstallmentPlanCreate(InstallmentPlanBase):
    transaction_id: int

class InstallmentPlanResponse(InstallmentPlanBase):
    id: int
    transaction_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Installment Payment Schemas
class InstallmentPaymentBase(BaseModel):
    installment_number: int
    due_date: datetime
    amount_due: float
    notes: Optional[str] = None

class InstallmentPaymentCreate(InstallmentPaymentBase):
    plan_id: int

class InstallmentPaymentUpdate(BaseModel):
    amount_paid: Optional[float] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None

class InstallmentPaymentResponse(InstallmentPaymentBase):
    id: int
    plan_id: int
    amount_paid: float
    late_fee: float
    payment_date: Optional[datetime]
    payment_method: Optional[str]
    payment_reference: Optional[str]
    status: PaymentStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Commission Dispute Schemas
class CommissionDisputeBase(BaseModel):
    dispute_reason: str
    description: str
    disputed_amount: Optional[float] = None

class CommissionDisputeCreate(CommissionDisputeBase):
    commission_id: int
    raised_by: int

class CommissionDisputeResponse(CommissionDisputeBase):
    id: int
    commission_id: int
    raised_by: int
    status: str
    resolution: Optional[str]
    resolved_by: Optional[int]
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Analytics Schemas
class RealtorAnalytics(BaseModel):
    total_realtors: int
    active_realtors: int
    total_commissions: float
    average_rating: float
    top_performers: List[Dict[str, Any]]

class CommissionAnalytics(BaseModel):
    total_commission: float
    pending_payouts: float
    this_month: float
    commission_rate: float
    recent_commissions: List[Dict[str, Any]]

# Team Management Schemas
class TeamMemberResponse(BaseModel):
    id: int
    realtor_id: str
    user_name: str
    level: RealtorLevel
    status: RealtorStatus
    total_commissions: float
    active_deals: int
    rating: float

class RealtorPerformance(BaseModel):
    monthly_commissions: float
    monthly_transactions: int
    ytd_commissions: float
    ytd_transactions: int
    target_achievement: float
    average_commission: float

# User Management Schemas
class BulkUserImport(BaseModel):
    users: List[Dict[str, Any]]
    send_invitations: bool = True

class UserActivityLog(BaseModel):
    user_id: int
    action: str
    resource: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    ip_address: Optional[str] = None

class RoleAssignmentRequest(BaseModel):
    user_id: int
    role_id: int
    assigned_by: int
    reason: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource: str
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    timestamp: datetime
    ip_address: Optional[str]

    class Config:
        from_attributes = True

# Lead Management Schemas
class LeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    source: str
    status: str = "cold"
    score: int = 0

class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    source: str
    status: str
    score: int
    realtor_id: int
    created_at: datetime

# Network/MLM Schemas
class NetworkStats(BaseModel):
    total_network: int
    direct_referrals: int
    network_depth: int
    monthly_team_commission: float

class NetworkMember(BaseModel):
    id: int
    name: str
    realtor_id: str
    level: str
    direct_referrals: int
    monthly_commission: float
    join_date: str

# Marketing Schemas
class MarketingMaterial(BaseModel):
    id: int
    name: str
    type: str
    size: str
    downloads: int
    url: str

class CampaignCreate(BaseModel):
    name: str
    type: str
    target_audience: str
    content: str

class CampaignResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    responses: int
    sent: int
    created_at: datetime

# Event Schemas
class EventResponse(BaseModel):
    id: int
    title: str
    date: str
    time: str
    location: str
    type: str
    description: Optional[str]

# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    realtor_id: str
    commission: float
    clients: int
    level: str

# Enhanced Profile Schemas
class RealtorProfile(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    level: str
    status: str
    rating: float
    bio: Optional[str]
    specialties: List[str]
    achievements: List[str]
    total_clients: int
    active_deals: int
    total_commissions: float
    monthly_target: float
    monthly_earned: float

class ClientPortfolio(BaseModel):
    id: int
    name: str
    email: str
    status: str
    stage: str
    value: float
    last_contact: str

class ActivityLog(BaseModel):
    date: str
    activity: str
    type: str
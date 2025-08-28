from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.realtor import RealtorLevel, RealtorStatus

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

class TransactionCreate(TransactionBase):
    realtor_id: int
    property_id: int
    client_id: int

class TransactionUpdate(BaseModel):
    status: Optional[str] = None
    sale_price: Optional[float] = None
    closing_date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    transaction_id: str
    realtor_id: int
    property_id: int
    client_id: int
    status: str
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
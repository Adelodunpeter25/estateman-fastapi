from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.mlm import PartnerLevel, CommissionType

class MLMPartnerBase(BaseModel):
    referral_code: Optional[str] = None
    sponsor_id: Optional[int] = None
    level: PartnerLevel = PartnerLevel.ASSOCIATE

class MLMPartnerCreate(MLMPartnerBase):
    user_id: int

class MLMPartnerUpdate(BaseModel):
    level: Optional[PartnerLevel] = None
    is_active: Optional[bool] = None

class MLMPartnerResponse(MLMPartnerBase):
    id: int
    user_id: int
    join_date: datetime
    is_active: bool
    total_earnings: float
    monthly_commission: float
    direct_referrals_count: int
    total_network_size: int
    network_depth: int
    name: Optional[str] = None
    
    class Config:
        from_attributes = True

class MLMCommissionCreate(BaseModel):
    partner_id: int
    source_partner_id: int
    commission_type: CommissionType
    level: int
    amount: float
    percentage: float
    reference_transaction_id: Optional[int] = None
    description: Optional[str] = None

class MLMCommissionResponse(BaseModel):
    id: int
    partner_id: int
    source_partner_id: int
    commission_type: CommissionType
    level: int
    amount: float
    percentage: float
    description: Optional[str] = None
    created_at: datetime
    is_paid: bool
    
    class Config:
        from_attributes = True

class ReferralActivityResponse(BaseModel):
    id: int
    referrer_name: str
    referred_name: str
    activity_type: str
    amount: float
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class MLMTreeNode(BaseModel):
    id: str
    name: str
    level: str
    referral_id: str
    direct_referrals: int
    monthly_commission: float
    children: List['MLMTreeNode'] = []
    avatar: Optional[str] = None

class MLMAnalytics(BaseModel):
    total_partners: int
    total_network_size: int
    monthly_referral_bonus: float
    conversion_rate: float
    active_partners: int
    network_depth: int

class TeamPerformance(BaseModel):
    partner_id: int
    partner_name: str
    level: str
    direct_referrals: int
    total_network: int
    monthly_commission: float
    total_earnings: float
    join_date: str
    downline_level: int

MLMTreeNode.model_rebuild()
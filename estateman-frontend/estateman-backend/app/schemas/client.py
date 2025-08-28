from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.client import ClientStatus, LeadStatus, LeadTemperature, CommunicationType, LoyaltyTier

# Client Schemas
class ClientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_location: Optional[str] = None
    property_interests: Optional[List[str]] = []
    lead_source: Optional[str] = None
    referral_code: Optional[str] = None
    tags: Optional[List[str]] = []
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    assigned_agent_id: Optional[int] = None

class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[ClientStatus] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_location: Optional[str] = None
    property_interests: Optional[List[str]] = None
    assigned_agent_id: Optional[int] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class ClientResponse(ClientBase):
    id: int
    client_id: str
    status: ClientStatus
    lead_score: int
    engagement_level: str
    loyalty_points: int
    loyalty_tier: LoyaltyTier
    total_spent: float
    assigned_agent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    last_contact_date: Optional[datetime]

    class Config:
        from_attributes = True

# Lead Schemas
class LeadBase(BaseModel):
    source: Optional[str] = None
    source_details: Optional[Dict[str, Any]] = {}
    campaign_id: Optional[str] = None
    interested_property_id: Optional[int] = None
    property_requirements: Optional[Dict[str, Any]] = {}
    expected_close_date: Optional[datetime] = None
    estimated_value: Optional[float] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    client_id: int
    assigned_agent_id: Optional[int] = None

class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    temperature: Optional[LeadTemperature] = None
    score: Optional[int] = None
    source: Optional[str] = None
    interested_property_id: Optional[int] = None
    property_requirements: Optional[Dict[str, Any]] = None
    expected_close_date: Optional[datetime] = None
    estimated_value: Optional[float] = None
    actual_value: Optional[float] = None
    assigned_agent_id: Optional[int] = None
    notes: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    lead_id: str
    client_id: int
    status: LeadStatus
    temperature: LeadTemperature
    score: int
    qualification_date: Optional[datetime]
    conversion_date: Optional[datetime]
    actual_close_date: Optional[datetime]
    actual_value: Optional[float]
    assigned_agent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Interaction Schemas
class InteractionBase(BaseModel):
    type: CommunicationType
    subject: Optional[str] = None
    content: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    interaction_metadata: Optional[Dict[str, Any]] = {}

class InteractionCreate(InteractionBase):
    client_id: int
    agent_id: int

class InteractionUpdate(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None

class InteractionResponse(InteractionBase):
    id: int
    client_id: int
    agent_id: int
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Loyalty Schemas
class LoyaltyTransactionCreate(BaseModel):
    client_id: int
    type: str
    points: int
    description: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    expires_at: Optional[datetime] = None

class LoyaltyTransactionResponse(BaseModel):
    id: int
    client_id: int
    type: str
    points: int
    description: str
    reference_type: Optional[str]
    reference_id: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Schemas
class ClientAnalytics(BaseModel):
    total_clients: int
    active_clients: int
    leads_count: int
    conversion_rate: float
    average_lead_score: float
    total_loyalty_points: int
    top_lead_sources: List[Dict[str, Any]]

class LeadPipeline(BaseModel):
    stage: str
    count: int
    value: float

class ClientSegmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    criteria: Dict[str, Any]
    client_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
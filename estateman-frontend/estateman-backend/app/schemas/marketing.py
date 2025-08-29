from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.marketing import CampaignType, CampaignStatus, AudienceSegment

class CampaignBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    campaign_type: CampaignType
    target_audience: AudienceSegment
    content: Optional[Dict[str, Any]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = Field(default=0.0, ge=0)

class CampaignCreate(CampaignBase):
    template_id: Optional[int] = None

class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[CampaignStatus] = None
    content: Optional[Dict[str, Any]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = Field(None, ge=0)

class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    total_reach: int
    total_clicks: int
    total_opens: int
    total_conversions: int
    spent: float
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CampaignTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    campaign_type: CampaignType
    content: Dict[str, Any]

class CampaignTemplateCreate(CampaignTemplateBase):
    pass

class CampaignTemplateResponse(CampaignTemplateBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CampaignAnalyticsResponse(BaseModel):
    date: datetime
    impressions: int
    clicks: int
    opens: int
    conversions: int
    cost: float

    class Config:
        from_attributes = True

class MarketingMaterialBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str
    tags: Optional[List[str]] = None

class MarketingMaterialCreate(MarketingMaterialBase):
    file_type: str
    file_url: str
    file_size: Optional[int] = None

class MarketingMaterialResponse(MarketingMaterialBase):
    id: int
    file_type: str
    file_url: str
    file_size: Optional[int]
    download_count: int
    view_count: int
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CampaignStatsResponse(BaseModel):
    active_campaigns: int
    total_reach: int
    avg_engagement: float
    leads_generated: int
    total_budget: float
    total_spent: float

# A/B Testing Schemas
class ABTestBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    test_type: str = Field(default="subject_line", max_length=50)
    variant_a_content: Dict[str, Any]
    variant_b_content: Dict[str, Any]
    traffic_split: float = Field(default=50.0, ge=0, le=100)

class ABTestCreate(ABTestBase):
    campaign_id: int

class ABTestResponse(ABTestBase):
    id: int
    campaign_id: int
    variant_a_opens: int
    variant_b_opens: int
    variant_a_clicks: int
    variant_b_clicks: int
    variant_a_conversions: int
    variant_b_conversions: int
    status: str
    winner: Optional[str]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Campaign Automation Schemas
class CampaignAutomationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    trigger_type: str = Field(..., max_length=50)
    trigger_conditions: Dict[str, Any]

class CampaignAutomationCreate(CampaignAutomationBase):
    pass

class CampaignAutomationResponse(CampaignAutomationBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class AutomationStepBase(BaseModel):
    step_order: int = Field(..., ge=1)
    delay_days: int = Field(default=0, ge=0)
    delay_hours: int = Field(default=0, ge=0, le=23)
    conditions: Optional[Dict[str, Any]] = None

class AutomationStepCreate(AutomationStepBase):
    automation_id: int
    campaign_id: int

class AutomationStepResponse(AutomationStepBase):
    id: int
    automation_id: int
    campaign_id: int

    class Config:
        from_attributes = True

# Dynamic Audience Schemas
class DynamicAudienceRuleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    rule_type: str = Field(..., max_length=50)
    conditions: Dict[str, Any]

class DynamicAudienceRuleCreate(DynamicAudienceRuleBase):
    pass

class DynamicAudienceRuleResponse(DynamicAudienceRuleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Campaign Optimization Schemas
class CampaignOptimizationResponse(BaseModel):
    id: int
    campaign_id: int
    optimization_type: str
    recommendation: str
    impact_score: float
    status: str
    created_at: datetime
    applied_at: Optional[datetime]

    class Config:
        from_attributes = True

# Real-time Metrics Schemas
class CampaignMetricsResponse(BaseModel):
    id: int
    campaign_id: int
    timestamp: datetime
    active_users: int
    bounce_rate: float
    engagement_rate: float
    conversion_rate: float

    class Config:
        from_attributes = True

# Drip Campaign Schemas
class DripCampaignTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    trigger_event: str = Field(..., max_length=100)
    total_steps: int = Field(default=1, ge=1)

class DripCampaignTemplateCreate(DripCampaignTemplateBase):
    pass

class DripCampaignTemplateResponse(DripCampaignTemplateBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class DripCampaignStepBase(BaseModel):
    step_number: int = Field(..., ge=1)
    delay_days: int = Field(default=0, ge=0)
    delay_hours: int = Field(default=0, ge=0, le=23)
    subject: Optional[str] = Field(None, max_length=255)
    content: Dict[str, Any]
    campaign_type: CampaignType = CampaignType.EMAIL

class DripCampaignStepCreate(DripCampaignStepBase):
    template_id: int

class DripCampaignStepResponse(DripCampaignStepBase):
    id: int
    template_id: int

    class Config:
        from_attributes = True
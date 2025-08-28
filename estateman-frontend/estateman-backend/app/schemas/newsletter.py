from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.newsletter import NewsletterStatus, SubscriberStatus

# Newsletter Schemas
class NewsletterBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    html_content: Optional[str] = None
    type: str = Field(default="Newsletter", max_length=50)
    scheduled_at: Optional[datetime] = None

class NewsletterCreate(NewsletterBase):
    template_id: Optional[int] = None

class NewsletterUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    html_content: Optional[str] = None
    status: Optional[NewsletterStatus] = None
    scheduled_at: Optional[datetime] = None

class NewsletterResponse(NewsletterBase):
    id: int
    status: NewsletterStatus
    total_recipients: int
    total_opens: int
    total_clicks: int
    total_bounces: int
    total_unsubscribes: int
    sent_at: Optional[datetime]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Email Template Schemas
class EmailTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(default="Newsletter", max_length=100)
    html_content: str = Field(..., min_length=1)
    variables: Optional[Dict[str, Any]] = None

class EmailTemplateCreate(EmailTemplateBase):
    pass

class EmailTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    html_content: Optional[str] = Field(None, min_length=1)
    variables: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class EmailTemplateResponse(EmailTemplateBase):
    id: int
    usage_count: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Subscriber Schemas
class SubscriberBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    segments: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None

class SubscriberCreate(SubscriberBase):
    pass

class SubscriberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    status: Optional[SubscriberStatus] = None
    segments: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None

class SubscriberResponse(SubscriberBase):
    id: int
    status: SubscriberStatus
    total_opens: int
    total_clicks: int
    last_activity: Optional[datetime]
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime]

    class Config:
        from_attributes = True

# Analytics Schemas
class NewsletterStatsResponse(BaseModel):
    total_subscribers: int
    campaigns_sent: int
    avg_open_rate: float
    avg_click_rate: float
    total_bounces: int
    total_unsubscribes: int

class SubscriberSegmentResponse(BaseModel):
    segment: str
    count: int
    growth: int
    active: bool

# Email Sequence Schemas
class EmailSequenceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    trigger_event: str = Field(..., max_length=100)

class EmailSequenceCreate(EmailSequenceBase):
    pass

class EmailSequenceResponse(EmailSequenceBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class SequenceEmailBase(BaseModel):
    order: int = Field(..., ge=1)
    delay_days: int = Field(default=0, ge=0)
    delay_hours: int = Field(default=0, ge=0, le=23)
    subject: str = Field(..., min_length=1, max_length=255)

class SequenceEmailCreate(SequenceEmailBase):
    template_id: int

class SequenceEmailResponse(SequenceEmailBase):
    id: int
    sequence_id: int
    template_id: int
    is_active: bool

    class Config:
        from_attributes = True
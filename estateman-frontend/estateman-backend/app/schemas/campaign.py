from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CampaignBase(BaseModel):
    name: str
    type: str
    target_audience: str
    message: str
    schedule_date: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    target_audience: Optional[str] = None
    message: Optional[str] = None
    schedule_date: Optional[datetime] = None
    status: Optional[str] = None

class CampaignResponse(CampaignBase):
    id: int
    realtor_id: int
    status: str
    sent: Optional[int] = 0
    responses: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class TenantCreate(BaseModel):
    name: str
    subdomain: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    subscription_plan: str = "basic"
    max_users: int = 10
    max_properties: int = 100

class TenantResponse(BaseModel):
    id: int
    name: str
    subdomain: str
    custom_domain: Optional[str]
    contact_email: str
    contact_phone: Optional[str]
    is_active: bool
    subscription_plan: str
    max_users: int
    max_properties: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TenantUserCreate(BaseModel):
    tenant_id: int
    user_id: int
    role: str = "user"
    is_admin: bool = False

class TenantLimitsResponse(BaseModel):
    users: Dict[str, int]
    properties: Dict[str, int]
    within_limits: bool
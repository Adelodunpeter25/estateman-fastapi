from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.notification import NotificationType, NotificationCategory, NotificationChannel

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType = NotificationType.INFO
    category: NotificationCategory
    user_id: Optional[int] = None
    role_target: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    is_sent: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationPreferenceBase(BaseModel):
    category: NotificationCategory
    channel: NotificationChannel
    is_enabled: bool = True

class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass

class NotificationPreferenceUpdate(BaseModel):
    is_enabled: bool

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
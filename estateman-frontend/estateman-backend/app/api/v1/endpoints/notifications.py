from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.notification import NotificationCategory, NotificationChannel
from ....schemas.notification import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationPreferenceCreate, NotificationPreferenceUpdate, NotificationPreferenceResponse
)
from ....services.notification import NotificationService, NotificationPreferenceService

router = APIRouter()

# Notification endpoints
@router.post("/notifications", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    return service.create_notification(notification_data)

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    return service.get_user_notifications(current_user.id, skip, limit, unread_only)

@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    notification = service.mark_as_read(notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/notifications/read-all")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    count = service.mark_all_as_read(current_user.id)
    return {"message": f"Marked {count} notifications as read"}

@router.get("/notifications/stats")
async def get_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    return service.get_notification_stats(current_user.id)

# Notification preference endpoints
@router.get("/notifications/preferences", response_model=List[NotificationPreferenceResponse])
async def get_notification_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationPreferenceService(db)
    return service.get_user_preferences(current_user.id)

@router.put("/notifications/preferences/{category}/{channel}", response_model=NotificationPreferenceResponse)
async def update_notification_preference(
    category: NotificationCategory,
    channel: NotificationChannel,
    preference_data: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationPreferenceService(db)
    return service.update_preference(current_user.id, category, channel, preference_data)

@router.post("/notifications/preferences/defaults")
async def create_default_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationPreferenceService(db)
    service.create_default_preferences(current_user.id)
    return {"message": "Default preferences created"}
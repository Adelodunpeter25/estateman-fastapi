from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.newsletter import NewsletterStatus, SubscriberStatus
from ....schemas.newsletter import (
    NewsletterCreate, NewsletterUpdate, NewsletterResponse,
    EmailTemplateCreate, EmailTemplateUpdate, EmailTemplateResponse,
    SubscriberCreate, SubscriberUpdate, SubscriberResponse,
    NewsletterStatsResponse, SubscriberSegmentResponse
)
from ....services.newsletter import NewsletterService, EmailTemplateService, SubscriberService

router = APIRouter()

# Newsletter endpoints
@router.post("/newsletters", response_model=NewsletterResponse)
async def create_newsletter(
    newsletter_data: NewsletterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    newsletter = service.create_newsletter(newsletter_data, current_user.id)
    if not newsletter:
        raise HTTPException(status_code=400, detail="Failed to create newsletter")
    return newsletter

@router.get("/newsletters", response_model=List[NewsletterResponse])
async def get_newsletters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[NewsletterStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    return service.get_newsletters(skip, limit, status)

@router.get("/newsletters/stats", response_model=NewsletterStatsResponse)
async def get_newsletter_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    return service.get_newsletter_stats()

@router.get("/analytics")
async def get_newsletter_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    return service.get_analytics()

@router.get("/newsletters/{newsletter_id}", response_model=NewsletterResponse)
async def get_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    newsletter = service.get_newsletter(newsletter_id)
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return newsletter

@router.put("/newsletters/{newsletter_id}", response_model=NewsletterResponse)
async def update_newsletter(
    newsletter_id: int,
    newsletter_data: NewsletterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    updated_newsletter = service.update_newsletter(newsletter_id, newsletter_data)
    if not updated_newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return updated_newsletter

@router.delete("/newsletters/{newsletter_id}")
async def delete_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    if not service.delete_newsletter(newsletter_id):
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return {"message": "Newsletter deleted successfully"}

@router.post("/newsletters/{newsletter_id}/send", response_model=NewsletterResponse)
async def send_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NewsletterService(db)
    try:
        newsletter = service.send_newsletter(newsletter_id)
        return newsletter
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Email Template endpoints
@router.post("/templates", response_model=EmailTemplateResponse)
async def create_template(
    template_data: EmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmailTemplateService(db)
    return service.create_template(template_data)

@router.get("/templates", response_model=List[EmailTemplateResponse])
async def get_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmailTemplateService(db)
    return service.get_templates(category)

@router.get("/templates/{template_id}", response_model=EmailTemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmailTemplateService(db)
    template = service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/templates/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: int,
    template_data: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmailTemplateService(db)
    updated_template = service.update_template(template_id, template_data)
    if not updated_template:
        raise HTTPException(status_code=404, detail="Template not found")
    return updated_template

# Subscriber endpoints
@router.get("/subscribers/segments", response_model=List[SubscriberSegmentResponse])
async def get_subscriber_segments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriberService(db)
    return service.get_segments()

@router.post("/subscribers", response_model=SubscriberResponse)
async def create_subscriber(
    subscriber_data: SubscriberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriberService(db)
    try:
        return service.create_subscriber(subscriber_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscribers", response_model=List[SubscriberResponse])
async def get_subscribers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[SubscriberStatus] = None,
    segment: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriberService(db)
    return service.get_subscribers(skip, limit, status, segment)

@router.get("/subscribers/{subscriber_id}", response_model=SubscriberResponse)
async def get_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriberService(db)
    subscriber = service.get_subscriber(subscriber_id)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return subscriber

@router.put("/subscribers/{subscriber_id}", response_model=SubscriberResponse)
async def update_subscriber(
    subscriber_id: int,
    subscriber_data: SubscriberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SubscriberService(db)
    updated_subscriber = service.update_subscriber(subscriber_id, subscriber_data)
    if not updated_subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return updated_subscriber

@router.post("/subscribers/unsubscribe")
async def unsubscribe_subscriber(
    email: str,
    db: Session = Depends(get_db)
):
    service = SubscriberService(db)
    if not service.unsubscribe(email):
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return {"message": "Successfully unsubscribed"}


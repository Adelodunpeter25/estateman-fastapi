from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ....core.database import get_db
from ....api.deps import get_current_user, get_admin_user
from ....models.user import User
from ....services.integration import IntegrationService, PaymentGatewayService, EmailServiceIntegration, SMSServiceIntegration
from pydantic import BaseModel

router = APIRouter()

class IntegrationCreate(BaseModel):
    name: str
    integration_type: str
    provider: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    webhook_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    webhook_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class PaymentRequest(BaseModel):
    amount: float
    currency: str = "USD"
    payment_method: str = "card"
    metadata: Optional[Dict[str, Any]] = None

class EmailRequest(BaseModel):
    to_email: str
    subject: str
    content: str
    template_id: Optional[str] = None

class SMSRequest(BaseModel):
    to_phone: str
    message: str
    from_phone: Optional[str] = None

# Integration Management
@router.post("/integrations")
async def create_integration(
    integration_data: IntegrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    service = IntegrationService(db)
    integration = service.create_integration(integration_data.dict(), current_user.id)
    return integration

@router.get("/integrations")
async def get_integrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = IntegrationService(db)
    integrations = service.get_integrations(skip, limit)
    return {"integrations": integrations}

@router.get("/integrations/{integration_id}")
async def get_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ....models.integration import Integration
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.put("/integrations/{integration_id}")
async def update_integration(
    integration_id: int,
    integration_data: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    from ....models.integration import Integration
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    for field, value in integration_data.dict(exclude_unset=True).items():
        setattr(integration, field, value)
    
    db.commit()
    db.refresh(integration)
    return integration

@router.post("/integrations/{integration_id}/test")
async def test_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    service = IntegrationService(db)
    result = service.test_integration(integration_id)
    return result

@router.post("/integrations/{integration_id}/activate")
async def activate_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    service = IntegrationService(db)
    success = service.activate_integration(integration_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to activate integration")
    return {"message": "Integration activated successfully"}

@router.post("/integrations/{integration_id}/deactivate")
async def deactivate_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    service = IntegrationService(db)
    success = service.deactivate_integration(integration_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to deactivate integration")
    return {"message": "Integration deactivated successfully"}

@router.get("/integrations/{integration_id}/logs")
async def get_integration_logs(
    integration_id: int,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = IntegrationService(db)
    logs = service.get_integration_logs(integration_id, limit)
    return {"logs": logs}

@router.get("/integrations/health")
async def get_integration_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = IntegrationService(db)
    health = service.get_integration_health()
    return health

# Payment Gateway Endpoints
@router.post("/payments/process")
async def process_payment(
    payment_data: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentGatewayService(db)
    result = service.process_payment(
        payment_data.amount,
        payment_data.currency,
        payment_data.payment_method,
        payment_data.metadata
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Payment failed"))
    
    return result

# Email Service Endpoints
@router.post("/email/send")
async def send_email(
    email_data: EmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmailServiceIntegration(db)
    result = service.send_email(
        email_data.to_email,
        email_data.subject,
        email_data.content,
        email_data.template_id
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Email send failed"))
    
    return result

# SMS Service Endpoints
@router.post("/sms/send")
async def send_sms(
    sms_data: SMSRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SMSServiceIntegration(db)
    result = service.send_sms(
        sms_data.to_phone,
        sms_data.message,
        sms_data.from_phone
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "SMS send failed"))
    
    return result

# Webhook Endpoints
@router.post("/webhooks/{integration_type}")
async def handle_webhook(
    integration_type: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Handle incoming webhooks from integrated services"""
    service = IntegrationService(db)
    integration = service.get_integration_by_type(integration_type)
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Log webhook receipt
    from ....models.integration import WebhookEvent
    webhook_event = WebhookEvent(
        integration_id=integration.id,
        event_type=payload.get("type", "unknown"),
        event_id=payload.get("id"),
        payload=payload
    )
    service.db.add(webhook_event)
    service.db.commit()
    
    # Process webhook based on type
    if integration_type == "payment_gateway":
        return await _process_payment_webhook(payload, integration, service)
    elif integration_type == "email_service":
        return await _process_email_webhook(payload, integration, service)
    
    return {"message": "Webhook received"}

async def _process_payment_webhook(payload: Dict[str, Any], integration, service: IntegrationService):
    """Process payment gateway webhook"""
    event_type = payload.get("type")
    
    if event_type == "payment_intent.succeeded":
        # Handle successful payment
        service.log_integration_action(
            integration.id, "webhook_payment_success", "success",
            request_data=payload
        )
    elif event_type == "payment_intent.payment_failed":
        # Handle failed payment
        service.log_integration_action(
            integration.id, "webhook_payment_failed", "error",
            request_data=payload
        )
    
    return {"message": "Payment webhook processed"}

async def _process_email_webhook(payload: Dict[str, Any], integration, service: IntegrationService):
    """Process email service webhook"""
    event_type = payload.get("event")
    
    if event_type == "delivered":
        # Handle email delivered
        service.log_integration_action(
            integration.id, "webhook_email_delivered", "success",
            request_data=payload
        )
    elif event_type == "bounced":
        # Handle email bounced
        service.log_integration_action(
            integration.id, "webhook_email_bounced", "error",
            request_data=payload
        )
    
    return {"message": "Email webhook processed"}
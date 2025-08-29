from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import requests
from ..models.integration import Integration, IntegrationLog, WebhookEvent, APIRateLimit, DataSync, IntegrationStatus
from ..core.datetime_utils import utc_now

class IntegrationService:
    def __init__(self, db: Session):
        self.db = db

    def create_integration(self, integration_data: Dict[str, Any], user_id: int) -> Integration:
        """Create a new integration"""
        integration = Integration(
            **integration_data,
            created_by=user_id,
            status=IntegrationStatus.PENDING
        )
        self.db.add(integration)
        self.db.commit()
        self.db.refresh(integration)
        return integration

    def get_integrations(self, skip: int = 0, limit: int = 100) -> List[Integration]:
        """Get all integrations"""
        return self.db.query(Integration).filter(
            Integration.is_active == True
        ).offset(skip).limit(limit).all()

    def get_integration_by_type(self, integration_type: str) -> Optional[Integration]:
        """Get integration by type"""
        return self.db.query(Integration).filter(
            and_(
                Integration.integration_type == integration_type,
                Integration.is_active == True,
                Integration.status == IntegrationStatus.ACTIVE
            )
        ).first()

    def test_integration(self, integration_id: int) -> Dict[str, Any]:
        """Test integration connection"""
        integration = self.db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            return {"success": False, "message": "Integration not found"}

        try:
            # Mock test based on integration type
            if integration.integration_type == "payment_gateway":
                return self._test_payment_gateway(integration)
            elif integration.integration_type == "email_service":
                return self._test_email_service(integration)
            elif integration.integration_type == "sms_service":
                return self._test_sms_service(integration)
            else:
                return {"success": True, "message": "Integration test not implemented"}
        except Exception as e:
            self.log_integration_action(
                integration_id, "test", "error", 
                error_message=str(e)
            )
            return {"success": False, "message": f"Test failed: {str(e)}"}

    def _test_payment_gateway(self, integration: Integration) -> Dict[str, Any]:
        """Test payment gateway connection"""
        if integration.provider == "stripe":
            # Mock Stripe test
            return {"success": True, "message": "Stripe connection successful"}
        elif integration.provider == "paypal":
            # Mock PayPal test
            return {"success": True, "message": "PayPal connection successful"}
        return {"success": False, "message": "Unknown payment provider"}

    def _test_email_service(self, integration: Integration) -> Dict[str, Any]:
        """Test email service connection"""
        if integration.provider == "sendgrid":
            # Mock SendGrid test
            return {"success": True, "message": "SendGrid connection successful"}
        elif integration.provider == "mailgun":
            # Mock Mailgun test
            return {"success": True, "message": "Mailgun connection successful"}
        return {"success": False, "message": "Unknown email provider"}

    def _test_sms_service(self, integration: Integration) -> Dict[str, Any]:
        """Test SMS service connection"""
        if integration.provider == "twilio":
            # Mock Twilio test
            return {"success": True, "message": "Twilio connection successful"}
        return {"success": False, "message": "Unknown SMS provider"}

    def activate_integration(self, integration_id: int) -> bool:
        """Activate an integration"""
        integration = self.db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            return False

        # Test connection first
        test_result = self.test_integration(integration_id)
        if not test_result.get("success"):
            return False

        integration.status = IntegrationStatus.ACTIVE
        integration.last_sync = utc_now()
        self.db.commit()

        self.log_integration_action(integration_id, "activate", "success")
        return True

    def deactivate_integration(self, integration_id: int) -> bool:
        """Deactivate an integration"""
        integration = self.db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            return False

        integration.status = IntegrationStatus.INACTIVE
        self.db.commit()

        self.log_integration_action(integration_id, "deactivate", "success")
        return True

    def log_integration_action(self, integration_id: int, action: str, status: str, 
                             request_data: Optional[Dict] = None, 
                             response_data: Optional[Dict] = None,
                             error_message: Optional[str] = None,
                             duration_ms: Optional[int] = None) -> IntegrationLog:
        """Log integration action"""
        log = IntegrationLog(
            integration_id=integration_id,
            action=action,
            status=status,
            request_data=request_data,
            response_data=response_data,
            error_message=error_message,
            duration_ms=duration_ms,
            completed_at=utc_now() if status in ["success", "error"] else None
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_integration_logs(self, integration_id: int, limit: int = 50) -> List[IntegrationLog]:
        """Get integration logs"""
        return self.db.query(IntegrationLog).filter(
            IntegrationLog.integration_id == integration_id
        ).order_by(desc(IntegrationLog.started_at)).limit(limit).all()

    def get_integration_health(self) -> Dict[str, Any]:
        """Get overall integration health status"""
        total_integrations = self.db.query(Integration).filter(Integration.is_active == True).count()
        active_integrations = self.db.query(Integration).filter(
            and_(
                Integration.is_active == True,
                Integration.status == IntegrationStatus.ACTIVE
            )
        ).count()
        
        # Get recent errors
        recent_errors = self.db.query(IntegrationLog).filter(
            and_(
                IntegrationLog.status == "error",
                IntegrationLog.started_at >= utc_now() - timedelta(hours=24)
            )
        ).count()

        health_score = (active_integrations / total_integrations * 100) if total_integrations > 0 else 100

        return {
            "total_integrations": total_integrations,
            "active_integrations": active_integrations,
            "inactive_integrations": total_integrations - active_integrations,
            "recent_errors_24h": recent_errors,
            "health_score": round(health_score, 1),
            "status": "healthy" if health_score >= 80 else "warning" if health_score >= 60 else "critical"
        }

class PaymentGatewayService:
    def __init__(self, db: Session):
        self.db = db
        self.integration_service = IntegrationService(db)

    def process_payment(self, amount: float, currency: str = "USD", 
                       payment_method: str = "card", metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Process payment through integrated gateway"""
        integration = self.integration_service.get_integration_by_type("payment_gateway")
        if not integration:
            return {"success": False, "message": "No payment gateway configured"}

        try:
            if integration.provider == "stripe":
                return self._process_stripe_payment(integration, amount, currency, payment_method, metadata)
            elif integration.provider == "paypal":
                return self._process_paypal_payment(integration, amount, currency, payment_method, metadata)
            else:
                return {"success": False, "message": "Unsupported payment provider"}
        except Exception as e:
            self.integration_service.log_integration_action(
                integration.id, "payment", "error", error_message=str(e)
            )
            return {"success": False, "message": f"Payment failed: {str(e)}"}

    def _process_stripe_payment(self, integration: Integration, amount: float, 
                               currency: str, payment_method: str, metadata: Optional[Dict]) -> Dict[str, Any]:
        """Process Stripe payment (mock implementation)"""
        # Mock Stripe payment processing
        payment_intent_id = f"pi_mock_{int(datetime.now().timestamp())}"
        
        self.integration_service.log_integration_action(
            integration.id, "payment", "success",
            request_data={"amount": amount, "currency": currency},
            response_data={"payment_intent_id": payment_intent_id}
        )
        
        return {
            "success": True,
            "payment_intent_id": payment_intent_id,
            "amount": amount,
            "currency": currency,
            "status": "succeeded"
        }

    def _process_paypal_payment(self, integration: Integration, amount: float,
                               currency: str, payment_method: str, metadata: Optional[Dict]) -> Dict[str, Any]:
        """Process PayPal payment (mock implementation)"""
        # Mock PayPal payment processing
        order_id = f"paypal_mock_{int(datetime.now().timestamp())}"
        
        self.integration_service.log_integration_action(
            integration.id, "payment", "success",
            request_data={"amount": amount, "currency": currency},
            response_data={"order_id": order_id}
        )
        
        return {
            "success": True,
            "order_id": order_id,
            "amount": amount,
            "currency": currency,
            "status": "completed"
        }

class EmailServiceIntegration:
    def __init__(self, db: Session):
        self.db = db
        self.integration_service = IntegrationService(db)

    def send_email(self, to_email: str, subject: str, content: str, 
                   template_id: Optional[str] = None, attachments: Optional[List] = None) -> Dict[str, Any]:
        """Send email through integrated service"""
        integration = self.integration_service.get_integration_by_type("email_service")
        if not integration:
            return {"success": False, "message": "No email service configured"}

        try:
            if integration.provider == "sendgrid":
                return self._send_sendgrid_email(integration, to_email, subject, content, template_id, attachments)
            elif integration.provider == "mailgun":
                return self._send_mailgun_email(integration, to_email, subject, content, template_id, attachments)
            else:
                return {"success": False, "message": "Unsupported email provider"}
        except Exception as e:
            self.integration_service.log_integration_action(
                integration.id, "send_email", "error", error_message=str(e)
            )
            return {"success": False, "message": f"Email send failed: {str(e)}"}

    def _send_sendgrid_email(self, integration: Integration, to_email: str, subject: str, 
                            content: str, template_id: Optional[str], attachments: Optional[List]) -> Dict[str, Any]:
        """Send email via SendGrid (mock implementation)"""
        message_id = f"sg_mock_{int(datetime.now().timestamp())}"
        
        self.integration_service.log_integration_action(
            integration.id, "send_email", "success",
            request_data={"to": to_email, "subject": subject},
            response_data={"message_id": message_id}
        )
        
        return {
            "success": True,
            "message_id": message_id,
            "provider": "sendgrid"
        }

    def _send_mailgun_email(self, integration: Integration, to_email: str, subject: str,
                           content: str, template_id: Optional[str], attachments: Optional[List]) -> Dict[str, Any]:
        """Send email via Mailgun (mock implementation)"""
        message_id = f"mg_mock_{int(datetime.now().timestamp())}"
        
        self.integration_service.log_integration_action(
            integration.id, "send_email", "success",
            request_data={"to": to_email, "subject": subject},
            response_data={"message_id": message_id}
        )
        
        return {
            "success": True,
            "message_id": message_id,
            "provider": "mailgun"
        }

class SMSServiceIntegration:
    def __init__(self, db: Session):
        self.db = db
        self.integration_service = IntegrationService(db)

    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> Dict[str, Any]:
        """Send SMS through integrated service"""
        integration = self.integration_service.get_integration_by_type("sms_service")
        if not integration:
            return {"success": False, "message": "No SMS service configured"}

        try:
            if integration.provider == "twilio":
                return self._send_twilio_sms(integration, to_phone, message, from_phone)
            else:
                return {"success": False, "message": "Unsupported SMS provider"}
        except Exception as e:
            self.integration_service.log_integration_action(
                integration.id, "send_sms", "error", error_message=str(e)
            )
            return {"success": False, "message": f"SMS send failed: {str(e)}"}

    def _send_twilio_sms(self, integration: Integration, to_phone: str, 
                        message: str, from_phone: Optional[str]) -> Dict[str, Any]:
        """Send SMS via Twilio (mock implementation)"""
        message_sid = f"twilio_mock_{int(datetime.now().timestamp())}"
        
        self.integration_service.log_integration_action(
            integration.id, "send_sms", "success",
            request_data={"to": to_phone, "message": message},
            response_data={"message_sid": message_sid}
        )
        
        return {
            "success": True,
            "message_sid": message_sid,
            "provider": "twilio"
        }
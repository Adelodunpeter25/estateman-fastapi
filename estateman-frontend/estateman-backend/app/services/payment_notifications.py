from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.models.realtor import InstallmentPayment, InstallmentPlan, PaymentStatus
from app.models.user import User
from app.models.client import Client

class PaymentNotificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_upcoming_payments(self, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """Get payments due in the next N days"""
        future_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        upcoming = self.db.query(InstallmentPayment).join(InstallmentPlan).filter(
            InstallmentPayment.status == PaymentStatus.PENDING,
            InstallmentPayment.due_date <= future_date,
            InstallmentPayment.due_date >= datetime.utcnow()
        ).all()
        
        notifications = []
        for payment in upcoming:
            plan = payment.plan
            transaction = plan.transaction
            
            notifications.append({
                "payment_id": payment.id,
                "client_id": transaction.client_id,
                "transaction_id": transaction.transaction_id,
                "amount_due": payment.amount_due,
                "due_date": payment.due_date,
                "days_until_due": (payment.due_date.date() - datetime.utcnow().date()).days,
                "installment_number": payment.installment_number,
                "total_installments": plan.total_installments,
                "notification_type": "upcoming_payment"
            })
        
        return notifications

    def get_overdue_payment_reminders(self) -> List[Dict[str, Any]]:
        """Get overdue payments that need reminders"""
        overdue = self.db.query(InstallmentPayment).join(InstallmentPlan).filter(
            InstallmentPayment.status == PaymentStatus.PENDING,
            InstallmentPayment.due_date < datetime.utcnow()
        ).all()
        
        reminders = []
        for payment in overdue:
            plan = payment.plan
            transaction = plan.transaction
            days_overdue = (datetime.utcnow().date() - payment.due_date.date()).days
            
            # Calculate late fee
            late_fee = 0.0
            if days_overdue > plan.grace_period_days:
                late_fee = payment.amount_due * (plan.late_fee_percentage / 100) * (days_overdue / 30)
            
            reminders.append({
                "payment_id": payment.id,
                "client_id": transaction.client_id,
                "transaction_id": transaction.transaction_id,
                "amount_due": payment.amount_due,
                "late_fee": round(late_fee, 2),
                "total_amount": payment.amount_due + late_fee,
                "due_date": payment.due_date,
                "days_overdue": days_overdue,
                "grace_period_expired": days_overdue > plan.grace_period_days,
                "notification_type": "overdue_payment"
            })
        
        return reminders

    def send_payment_reminders(self) -> Dict[str, Any]:
        """Send payment reminders via email/SMS"""
        upcoming = self.get_upcoming_payments(3)  # 3 days ahead
        overdue = self.get_overdue_payment_reminders()
        
        # In a real implementation, this would integrate with email/SMS services
        sent_count = 0
        
        for notification in upcoming + overdue:
            # Mock sending notification
            self._mock_send_notification(notification)
            sent_count += 1
        
        return {
            "upcoming_reminders_sent": len(upcoming),
            "overdue_reminders_sent": len(overdue),
            "total_sent": sent_count,
            "timestamp": datetime.utcnow()
        }

    def _mock_send_notification(self, notification: Dict[str, Any]):
        """Mock notification sending - would integrate with actual services"""
        notification_type = notification["notification_type"]
        
        if notification_type == "upcoming_payment":
            print(f"Sending upcoming payment reminder for payment {notification['payment_id']}")
        elif notification_type == "overdue_payment":
            print(f"Sending overdue payment reminder for payment {notification['payment_id']}")

    def get_payment_summary_for_client(self, client_id: int) -> Dict[str, Any]:
        """Get payment summary for a specific client"""
        # Get all installment plans for this client's transactions
        plans = self.db.query(InstallmentPlan).join(
            InstallmentPlan.transaction
        ).filter(
            InstallmentPlan.transaction.has(client_id=client_id)
        ).all()
        
        total_due = 0
        total_paid = 0
        overdue_amount = 0
        next_payment = None
        
        for plan in plans:
            for payment in plan.payments:
                total_due += payment.amount_due
                total_paid += payment.amount_paid
                
                if payment.status == PaymentStatus.PENDING and payment.due_date < datetime.utcnow():
                    overdue_amount += (payment.amount_due - payment.amount_paid)
                
                if payment.status == PaymentStatus.PENDING and (not next_payment or payment.due_date < next_payment["due_date"]):
                    next_payment = {
                        "payment_id": payment.id,
                        "amount_due": payment.amount_due,
                        "due_date": payment.due_date,
                        "installment_number": payment.installment_number
                    }
        
        return {
            "client_id": client_id,
            "total_contract_value": total_due,
            "total_paid": total_paid,
            "outstanding_balance": total_due - total_paid,
            "overdue_amount": overdue_amount,
            "next_payment": next_payment,
            "payment_plans_count": len(plans)
        }

    def mark_payment_as_overdue(self):
        """Update payment status to overdue for payments past due date"""
        overdue_payments = self.db.query(InstallmentPayment).filter(
            InstallmentPayment.status == PaymentStatus.PENDING,
            InstallmentPayment.due_date < datetime.utcnow()
        ).all()
        
        updated_count = 0
        for payment in overdue_payments:
            payment.status = PaymentStatus.OVERDUE
            updated_count += 1
        
        self.db.commit()
        return {"updated_payments": updated_count}

    def generate_payment_receipt(self, payment_id: int) -> Dict[str, Any]:
        """Generate payment receipt data"""
        payment = self.db.query(InstallmentPayment).filter(
            InstallmentPayment.id == payment_id
        ).first()
        
        if not payment or payment.status != PaymentStatus.PAID:
            return {}
        
        plan = payment.plan
        transaction = plan.transaction
        
        return {
            "receipt_id": f"RCP-{payment.id}-{payment.payment_date.strftime('%Y%m%d')}",
            "payment_id": payment.id,
            "transaction_id": transaction.transaction_id,
            "client_id": transaction.client_id,
            "payment_date": payment.payment_date,
            "amount_paid": payment.amount_paid,
            "payment_method": payment.payment_method,
            "payment_reference": payment.payment_reference,
            "installment_number": payment.installment_number,
            "remaining_balance": plan.total_amount - sum(p.amount_paid for p in plan.payments),
            "next_due_date": self._get_next_due_date(plan, payment.installment_number)
        }

    def _get_next_due_date(self, plan: InstallmentPlan, current_installment: int) -> datetime:
        """Get the next payment due date"""
        next_payment = self.db.query(InstallmentPayment).filter(
            InstallmentPayment.plan_id == plan.id,
            InstallmentPayment.installment_number > current_installment,
            InstallmentPayment.status == PaymentStatus.PENDING
        ).order_by(InstallmentPayment.installment_number).first()
        
        return next_payment.due_date if next_payment else None
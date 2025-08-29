from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.models.realtor import (
    Transaction, TransactionMilestone, TransactionDocument, 
    InstallmentPlan, InstallmentPayment, CommissionDispute,
    TransactionStatus, PaymentStatus, PaymentFrequency
)
from app.models.user import User
from app.models.property import Property
from app.models.client import Client

class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def create_transaction(self, transaction_data: Dict[str, Any]) -> Transaction:
        transaction = Transaction(
            transaction_id=f"T{str(uuid.uuid4())[:8].upper()}",
            **transaction_data
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        
        # Create default milestones
        self._create_default_milestones(transaction.id)
        return transaction

    def _create_default_milestones(self, transaction_id: int):
        default_milestones = [
            {"milestone_type": "contract", "title": "Contract Signed", "description": "Purchase agreement executed"},
            {"milestone_type": "inspection", "title": "Property Inspection", "description": "Professional property inspection"},
            {"milestone_type": "financing", "title": "Financing Approval", "description": "Loan approval obtained"},
            {"milestone_type": "appraisal", "title": "Property Appraisal", "description": "Property valuation completed"},
            {"milestone_type": "closing", "title": "Closing Preparation", "description": "Final documents prepared"},
            {"milestone_type": "completion", "title": "Transaction Complete", "description": "Keys transferred, transaction closed"}
        ]
        
        for i, milestone_data in enumerate(default_milestones):
            milestone = TransactionMilestone(
                transaction_id=transaction_id,
                **milestone_data
            )
            self.db.add(milestone)
        self.db.commit()

    def get_transaction(self, transaction_id: int) -> Optional[Transaction]:
        return self.db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TransactionStatus] = None,
        realtor_id: Optional[int] = None,
        client_id: Optional[int] = None
    ) -> List[Transaction]:
        query = self.db.query(Transaction)
        
        if status:
            query = query.filter(Transaction.status == status)
        if realtor_id:
            query = query.filter(Transaction.realtor_id == realtor_id)
        if client_id:
            query = query.filter(Transaction.client_id == client_id)
            
        return query.order_by(desc(Transaction.created_at)).offset(skip).limit(limit).all()

    def update_transaction_status(self, transaction_id: int, status: TransactionStatus, notes: Optional[str] = None) -> Optional[Transaction]:
        transaction = self.get_transaction(transaction_id)
        if not transaction:
            return None
            
        transaction.status = status
        if notes:
            transaction.notes = notes
        transaction.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_transaction_timeline(self, transaction_id: int) -> List[Dict[str, Any]]:
        milestones = self.db.query(TransactionMilestone).filter(
            TransactionMilestone.transaction_id == transaction_id
        ).order_by(TransactionMilestone.due_date).all()
        
        return [
            {
                "id": m.id,
                "type": m.milestone_type,
                "title": m.title,
                "description": m.description,
                "due_date": m.due_date,
                "completed_date": m.completed_date,
                "status": m.status,
                "notes": m.notes
            }
            for m in milestones
        ]

    def update_milestone(self, milestone_id: int, milestone_data: Dict[str, Any]) -> Optional[TransactionMilestone]:
        milestone = self.db.query(TransactionMilestone).filter(
            TransactionMilestone.id == milestone_id
        ).first()
        
        if not milestone:
            return None
            
        for field, value in milestone_data.items():
            if hasattr(milestone, field):
                setattr(milestone, field, value)
        
        milestone.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    def add_transaction_document(self, transaction_id: int, document_data: Dict[str, Any]) -> TransactionDocument:
        document = TransactionDocument(
            transaction_id=transaction_id,
            **document_data
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_transaction_documents(self, transaction_id: int) -> List[TransactionDocument]:
        return self.db.query(TransactionDocument).filter(
            TransactionDocument.transaction_id == transaction_id
        ).order_by(desc(TransactionDocument.created_at)).all()

    def get_transaction_pipeline(self, realtor_id: Optional[int] = None) -> Dict[str, Any]:
        query = self.db.query(Transaction)
        if realtor_id:
            query = query.filter(Transaction.realtor_id == realtor_id)
        
        transactions = query.all()
        
        pipeline = {}
        for status in TransactionStatus:
            pipeline[status.value] = [
                {
                    "id": t.id,
                    "transaction_id": t.transaction_id,
                    "property_address": "Property Address",  # Would need property relationship
                    "client_name": "Client Name",  # Would need client relationship
                    "sale_price": t.sale_price,
                    "closing_date": t.closing_date,
                    "created_at": t.created_at
                }
                for t in transactions if t.status == status
            ]
        
        return pipeline

    def get_transaction_analytics(self) -> Dict[str, Any]:
        total_transactions = self.db.query(Transaction).count()
        active_transactions = self.db.query(Transaction).filter(
            Transaction.status.in_([
                TransactionStatus.UNDER_CONTRACT,
                TransactionStatus.INSPECTION,
                TransactionStatus.FINANCING,
                TransactionStatus.APPRAISAL,
                TransactionStatus.CLOSING_PREP
            ])
        ).count()
        
        completed_transactions = self.db.query(Transaction).filter(
            Transaction.status == TransactionStatus.COMPLETED
        ).count()
        
        total_volume = self.db.query(func.sum(Transaction.sale_price)).filter(
            Transaction.status == TransactionStatus.COMPLETED
        ).scalar() or 0
        
        avg_days_to_close = 30  # Would calculate from actual data
        
        return {
            "total_transactions": total_transactions,
            "active_transactions": active_transactions,
            "completed_transactions": completed_transactions,
            "total_volume": float(total_volume),
            "avg_days_to_close": avg_days_to_close,
            "completion_rate": (completed_transactions / total_transactions * 100) if total_transactions > 0 else 0
        }

class InstallmentService:
    def __init__(self, db: Session):
        self.db = db

    def create_installment_plan(self, plan_data: Dict[str, Any]) -> InstallmentPlan:
        plan = InstallmentPlan(**plan_data)
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        
        # Generate payment schedule
        self._generate_payment_schedule(plan)
        return plan

    def _generate_payment_schedule(self, plan: InstallmentPlan):
        current_date = plan.start_date
        
        for i in range(1, plan.total_installments + 1):
            # Calculate due date based on frequency
            if plan.frequency == PaymentFrequency.WEEKLY:
                due_date = current_date + timedelta(weeks=i)
            elif plan.frequency == PaymentFrequency.MONTHLY:
                due_date = current_date + timedelta(days=30 * i)
            elif plan.frequency == PaymentFrequency.QUARTERLY:
                due_date = current_date + timedelta(days=90 * i)
            else:  # YEARLY
                due_date = current_date + timedelta(days=365 * i)
            
            payment = InstallmentPayment(
                plan_id=plan.id,
                installment_number=i,
                due_date=due_date,
                amount_due=plan.installment_amount
            )
            self.db.add(payment)
        
        self.db.commit()

    def get_installment_plan(self, plan_id: int) -> Optional[InstallmentPlan]:
        return self.db.query(InstallmentPlan).filter(InstallmentPlan.id == plan_id).first()

    def get_payment_schedule(self, plan_id: int) -> List[InstallmentPayment]:
        return self.db.query(InstallmentPayment).filter(
            InstallmentPayment.plan_id == plan_id
        ).order_by(InstallmentPayment.installment_number).all()

    def process_payment(self, payment_id: int, amount: float, payment_method: str, reference: str) -> Optional[InstallmentPayment]:
        payment = self.db.query(InstallmentPayment).filter(
            InstallmentPayment.id == payment_id
        ).first()
        
        if not payment:
            return None
        
        payment.amount_paid = amount
        payment.payment_date = datetime.utcnow()
        payment.payment_method = payment_method
        payment.payment_reference = reference
        payment.status = PaymentStatus.PAID if amount >= payment.amount_due else PaymentStatus.PENDING
        payment.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def calculate_late_fees(self, payment_id: int) -> float:
        payment = self.db.query(InstallmentPayment).filter(
            InstallmentPayment.id == payment_id
        ).first()
        
        if not payment or payment.status == PaymentStatus.PAID:
            return 0.0
        
        plan = payment.plan
        if datetime.utcnow().date() > payment.due_date.date() + timedelta(days=plan.grace_period_days):
            days_overdue = (datetime.utcnow().date() - payment.due_date.date()).days - plan.grace_period_days
            late_fee = payment.amount_due * (plan.late_fee_percentage / 100) * (days_overdue / 30)
            return round(late_fee, 2)
        
        return 0.0

    def get_overdue_payments(self) -> List[InstallmentPayment]:
        return self.db.query(InstallmentPayment).filter(
            InstallmentPayment.status == PaymentStatus.PENDING,
            InstallmentPayment.due_date < datetime.utcnow()
        ).all()

    def get_payment_analytics(self) -> Dict[str, Any]:
        total_expected = self.db.query(func.sum(InstallmentPayment.amount_due)).scalar() or 0
        total_received = self.db.query(func.sum(InstallmentPayment.amount_paid)).scalar() or 0
        overdue_amount = self.db.query(func.sum(InstallmentPayment.amount_due)).filter(
            InstallmentPayment.status == PaymentStatus.OVERDUE
        ).scalar() or 0
        
        collection_rate = (total_received / total_expected * 100) if total_expected > 0 else 0
        
        return {
            "total_expected": float(total_expected),
            "total_received": float(total_received),
            "overdue_amount": float(overdue_amount),
            "collection_rate": round(collection_rate, 1),
            "outstanding_balance": float(total_expected - total_received)
        }

class CommissionDisputeService:
    def __init__(self, db: Session):
        self.db = db

    def create_dispute(self, dispute_data: Dict[str, Any]) -> CommissionDispute:
        dispute = CommissionDispute(**dispute_data)
        self.db.add(dispute)
        self.db.commit()
        self.db.refresh(dispute)
        return dispute

    def get_disputes(self, status: Optional[str] = None) -> List[CommissionDispute]:
        query = self.db.query(CommissionDispute)
        if status:
            query = query.filter(CommissionDispute.status == status)
        return query.order_by(desc(CommissionDispute.created_at)).all()

    def resolve_dispute(self, dispute_id: int, resolution: str, resolved_by: int) -> Optional[CommissionDispute]:
        dispute = self.db.query(CommissionDispute).filter(
            CommissionDispute.id == dispute_id
        ).first()
        
        if not dispute:
            return None
        
        dispute.status = "resolved"
        dispute.resolution = resolution
        dispute.resolved_by = resolved_by
        dispute.resolved_at = datetime.utcnow()
        dispute.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(dispute)
        return dispute
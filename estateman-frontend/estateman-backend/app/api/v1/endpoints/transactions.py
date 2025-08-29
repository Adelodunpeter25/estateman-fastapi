from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.realtor import TransactionStatus, PaymentStatus
from app.schemas.realtor import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionMilestoneCreate, TransactionMilestoneUpdate, TransactionMilestoneResponse,
    TransactionDocumentCreate, TransactionDocumentResponse,
    InstallmentPlanCreate, InstallmentPlanResponse,
    InstallmentPaymentUpdate, InstallmentPaymentResponse,
    CommissionDisputeCreate, CommissionDisputeResponse
)
from app.services.transaction import TransactionService, InstallmentService, CommissionDisputeService
from app.services.payment_notifications import PaymentNotificationService

router = APIRouter()

# Transaction Management Endpoints
@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.create_transaction(transaction_data.dict())

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TransactionStatus] = None,
    realtor_id: Optional[int] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.get_transactions(skip, limit, status, realtor_id, client_id)

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    transaction = service.get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    transaction = service.get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update transaction fields
    for field, value in transaction_data.dict(exclude_unset=True).items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.put("/{transaction_id}/status")
def update_transaction_status(
    transaction_id: int,
    status: TransactionStatus,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    transaction = service.update_transaction_status(transaction_id, status, notes)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction status updated successfully", "status": status.value}

@router.get("/{transaction_id}/timeline")
def get_transaction_timeline(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.get_transaction_timeline(transaction_id)

@router.get("/pipeline/overview")
def get_transaction_pipeline(
    realtor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.get_transaction_pipeline(realtor_id)

@router.get("/analytics/overview")
def get_transaction_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.get_transaction_analytics()

# Transaction Milestone Endpoints
@router.post("/{transaction_id}/milestones", response_model=TransactionMilestoneResponse)
def create_milestone(
    transaction_id: int,
    milestone_data: TransactionMilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.realtor import TransactionMilestone
    milestone = TransactionMilestone(
        transaction_id=transaction_id,
        **milestone_data.dict(exclude={"transaction_id"})
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.put("/milestones/{milestone_id}", response_model=TransactionMilestoneResponse)
def update_milestone(
    milestone_id: int,
    milestone_data: TransactionMilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    milestone = service.update_milestone(milestone_id, milestone_data.dict(exclude_unset=True))
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone

# Transaction Document Endpoints
@router.post("/{transaction_id}/documents", response_model=TransactionDocumentResponse)
def add_transaction_document(
    transaction_id: int,
    document_data: TransactionDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.add_transaction_document(transaction_id, document_data.dict(exclude={"transaction_id"}))

@router.get("/{transaction_id}/documents", response_model=List[TransactionDocumentResponse])
def get_transaction_documents(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TransactionService(db)
    return service.get_transaction_documents(transaction_id)

# Installment Plan Endpoints
@router.post("/{transaction_id}/installment-plans", response_model=InstallmentPlanResponse)
def create_installment_plan(
    transaction_id: int,
    plan_data: InstallmentPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    plan_dict = plan_data.dict()
    plan_dict["transaction_id"] = transaction_id
    return service.create_installment_plan(plan_dict)

@router.get("/installment-plans/{plan_id}", response_model=InstallmentPlanResponse)
def get_installment_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    plan = service.get_installment_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Installment plan not found")
    return plan

@router.get("/installment-plans/{plan_id}/payments", response_model=List[InstallmentPaymentResponse])
def get_payment_schedule(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    return service.get_payment_schedule(plan_id)

@router.put("/payments/{payment_id}/process")
def process_payment(
    payment_id: int,
    amount: float,
    payment_method: str,
    reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    payment = service.process_payment(payment_id, amount, payment_method, reference)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment processed successfully", "payment_id": payment_id}

@router.get("/payments/overdue", response_model=List[InstallmentPaymentResponse])
def get_overdue_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    return service.get_overdue_payments()

@router.get("/payments/analytics")
def get_payment_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    return service.get_payment_analytics()

@router.get("/payments/{payment_id}/late-fee")
def calculate_late_fee(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InstallmentService(db)
    late_fee = service.calculate_late_fees(payment_id)
    return {"payment_id": payment_id, "late_fee": late_fee}

# Commission Dispute Endpoints
@router.post("/commission-disputes", response_model=CommissionDisputeResponse)
def create_commission_dispute(
    dispute_data: CommissionDisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionDisputeService(db)
    dispute_dict = dispute_data.dict()
    dispute_dict["raised_by"] = current_user.id
    return service.create_dispute(dispute_dict)

@router.get("/commission-disputes", response_model=List[CommissionDisputeResponse])
def get_commission_disputes(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionDisputeService(db)
    return service.get_disputes(status)

@router.put("/commission-disputes/{dispute_id}/resolve")
def resolve_commission_dispute(
    dispute_id: int,
    resolution: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionDisputeService(db)
    dispute = service.resolve_dispute(dispute_id, resolution, current_user.id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return {"message": "Dispute resolved successfully", "dispute_id": dispute_id}

# Payment Notification Endpoints
@router.get("/payments/notifications/upcoming")
def get_upcoming_payment_notifications(
    days_ahead: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    return service.get_upcoming_payments(days_ahead)

@router.get("/payments/notifications/overdue")
def get_overdue_payment_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    return service.get_overdue_payment_reminders()

@router.post("/payments/notifications/send-reminders")
def send_payment_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    return service.send_payment_reminders()

@router.get("/payments/client/{client_id}/summary")
def get_client_payment_summary(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    return service.get_payment_summary_for_client(client_id)

@router.put("/payments/mark-overdue")
def mark_overdue_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    return service.mark_payment_as_overdue()

@router.get("/payments/{payment_id}/receipt")
def generate_payment_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentNotificationService(db)
    receipt = service.generate_payment_receipt(payment_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Payment not found or not paid")
    return receipt
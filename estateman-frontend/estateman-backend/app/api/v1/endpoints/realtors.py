from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.realtor import RealtorLevel, RealtorStatus
from app.schemas.realtor import (
    RealtorCreate, RealtorUpdate, RealtorResponse,
    CommissionCreate, CommissionResponse, CommissionUpdate,
    TransactionCreate, TransactionResponse,
    RealtorAnalytics, CommissionAnalytics
)
from app.services.realtor import RealtorService, CommissionService

router = APIRouter()

# Realtor endpoints
@router.post("/", response_model=RealtorResponse)
def create_realtor(
    realtor_data: RealtorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.create_realtor(realtor_data)

@router.get("/", response_model=List[RealtorResponse])
def get_realtors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    level: Optional[RealtorLevel] = None,
    status: Optional[RealtorStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    realtors = service.get_realtors(skip, limit, level, status, search)
    return realtors or []

@router.get("/{realtor_id}", response_model=RealtorResponse)
def get_realtor(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    realtor = service.get_realtor(realtor_id)
    if not realtor:
        return {"message": "The realtor you are trying to access does not exist or has been removed"}
    return realtor

@router.put("/{realtor_id}", response_model=RealtorResponse)
def update_realtor(
    realtor_id: int,
    realtor_data: RealtorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    realtor = service.update_realtor(realtor_id, realtor_data)
    if not realtor:
        return {"message": "The realtor you are trying to update does not exist or has been removed"}
    return realtor

@router.delete("/{realtor_id}")
def delete_realtor(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    if not service.delete_realtor(realtor_id):
        return {"message": "The realtor you are trying to delete does not exist or has already been removed"}
    return {"message": "Realtor deleted successfully"}

@router.get("/analytics/overview", response_model=RealtorAnalytics)
def get_realtor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_analytics()

@router.get("/dropdown")
def get_realtors_dropdown(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    realtors = service.get_realtors(0, 100, None, None, search)
    if not realtors:
        return []
    
    result = []
    for r in realtors:
        if r.user_id and r.realtor_id:
            result.append({
                "id": r.user_id, 
                "name": r.name or f"Realtor {r.realtor_id}", 
                "realtor_id": r.realtor_id
            })
    return result

@router.get("/performance/{realtor_id}")
def get_realtor_performance(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    performance = service.get_realtor_performance(realtor_id)
    if not performance:
        return {"message": "No performance data available for this realtor - they may be new or inactive"}
    return performance

# Commission endpoints
@router.post("/commissions/", response_model=CommissionResponse)
def create_commission(
    commission_data: CommissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.create_commission(commission_data)

@router.get("/commissions/", response_model=List[CommissionResponse])
def get_commissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    realtor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    commissions = service.get_commissions(skip, limit, realtor_id, status)
    return commissions or []

@router.get("/commissions/analytics/overview", response_model=CommissionAnalytics)
def get_commission_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.get_commission_analytics()

@router.post("/commissions/calculate")
def calculate_commission(
    sale_price: float,
    rate: float,
    split: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.calculate_commission(sale_price, rate, split)
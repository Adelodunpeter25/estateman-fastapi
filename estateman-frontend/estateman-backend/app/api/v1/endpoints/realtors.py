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
    RealtorAnalytics, CommissionAnalytics,
    LeadCreate, LeadResponse, NetworkStats, NetworkMember,
    MarketingMaterial, CampaignCreate, CampaignResponse,
    EventResponse, LeaderboardEntry, RealtorProfile,
    ClientPortfolio, ActivityLog
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
            name = f"{r.user.first_name} {r.user.last_name}" if r.user else f"Realtor {r.realtor_id}"
            result.append({
                "id": r.user_id, 
                "name": name, 
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

# Team Management endpoints
@router.get("/team/{team_lead_id}")
def get_team_members(
    team_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.get_team_members(team_lead_id)

@router.get("/performance/detailed/{realtor_id}")
def get_detailed_performance(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.get_detailed_performance(realtor_id)

@router.put("/performance/update/{realtor_id}")
def update_performance_metrics(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    realtor = service.update_performance_metrics(realtor_id)
    if not realtor:
        raise HTTPException(status_code=404, detail="Realtor not found")
    return {"message": "Performance metrics updated successfully", "realtor_id": realtor.id}

# Enhanced Profile endpoints
@router.get("/{realtor_id}/profile")
def get_realtor_profile(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_profile(realtor_id)

@router.get("/{realtor_id}/clients")
def get_realtor_clients(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_clients(realtor_id)

@router.get("/{realtor_id}/activities")
def get_realtor_activities(
    realtor_id: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_activities(realtor_id, limit)

# Network/MLM endpoints
@router.get("/{realtor_id}/network/stats")
def get_network_stats(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_network_stats(realtor_id)

@router.get("/{realtor_id}/network/downline")
def get_network_downline(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_network_downline(realtor_id)

@router.get("/{realtor_id}/network/tree")
def get_network_tree(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_network_tree(realtor_id)

# Lead Management endpoints
@router.get("/{realtor_id}/leads")
def get_realtor_leads(
    realtor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_leads(realtor_id, skip, limit)

@router.get("/{realtor_id}/leads/stats")
def get_leads_stats(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_leads_stats(realtor_id)

# Marketing endpoints
@router.get("/marketing/materials")
def get_marketing_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_marketing_materials()

@router.get("/{realtor_id}/marketing/campaigns")
def get_realtor_campaigns(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_campaigns(realtor_id)

# Events endpoints
@router.get("/events")
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_events()

@router.post("/events/{event_id}/register")
def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.register_for_event(current_user.id, event_id)

# Leaderboard endpoints
@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_leaderboard(limit)

@router.get("/{realtor_id}/ranking")
def get_realtor_ranking(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RealtorService(db)
    return service.get_realtor_ranking(realtor_id)

# Enhanced Commission endpoints
@router.get("/{realtor_id}/commissions/history")
def get_commission_history(
    realtor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.get_commission_history(realtor_id, skip, limit)

@router.get("/{realtor_id}/commissions/breakdown")
def get_commission_breakdown(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.get_commission_breakdown(realtor_id)

@router.get("/{realtor_id}/commissions/statement")
def generate_commission_statement(
    realtor_id: int,
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    service = CommissionService(db)
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    return service.generate_commission_statement(realtor_id, start, end)

@router.get("/{realtor_id}/commissions/forecast")
def forecast_commission(
    realtor_id: int,
    months_ahead: int = Query(3, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.forecast_commission(realtor_id, months_ahead)

@router.put("/commissions/{commission_id}/approve")
def approve_commission(
    commission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    commission = service.approve_commission_payout(commission_id, current_user.id)
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    return {"message": "Commission approved successfully", "commission_id": commission_id}

@router.get("/{realtor_id}/tax-forms/{tax_year}")
def generate_tax_form(
    realtor_id: int,
    tax_year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommissionService(db)
    return service.generate_tax_form_data(realtor_id, tax_year)
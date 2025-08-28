from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.mlm import (
    MLMPartnerCreate, MLMPartnerUpdate, MLMPartnerResponse,
    MLMCommissionResponse, ReferralActivityResponse,
    MLMTreeNode, MLMAnalytics, TeamPerformance,
    CommissionRuleCreate, CommissionRuleResponse,
    CommissionSimulatorRequest, CommissionSimulatorResponse,
    CommissionPayoutCreate, CommissionPayoutResponse
)
from app.services.mlm import MLMService, MLMCommissionService, AdvancedCommissionService

router = APIRouter()

# MLM Partner endpoints
@router.post("/partners/", response_model=MLMPartnerResponse)
def create_mlm_partner(
    partner_data: MLMPartnerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    partner = service.create_partner(partner_data)
    return partner

@router.get("/partners/", response_model=List[MLMPartnerResponse])
def get_mlm_partners(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    partners = service.get_partners(skip, limit)
    return partners or []

@router.get("/partners/{partner_id}", response_model=MLMPartnerResponse)
def get_mlm_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    partner = service.get_partner(partner_id)
    if not partner:
        return {"message": "The MLM partner you are trying to access does not exist or has been removed"}
    return partner

@router.put("/partners/{partner_id}", response_model=MLMPartnerResponse)
def update_mlm_partner(
    partner_id: int,
    partner_data: MLMPartnerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    partner = service.update_partner(partner_id, partner_data)
    if not partner:
        return {"message": "The MLM partner you are trying to update does not exist or has been removed"}
    return partner

@router.get("/partners/{partner_id}/downline", response_model=List[MLMPartnerResponse])
def get_partner_downline(
    partner_id: int,
    max_depth: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    downline = service.get_downline(partner_id, max_depth)
    return downline or []

@router.get("/partners/{partner_id}/tree", response_model=MLMTreeNode)
def get_mlm_tree(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    tree = service.get_mlm_tree(partner_id)
    if not tree:
        return {"message": "No MLM network tree data available for this partner"}
    return tree

@router.post("/partners/{partner_id}/update-stats")
def update_network_stats(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    service.update_network_stats(partner_id)
    return {"message": "Network statistics updated successfully"}

# Analytics endpoints
@router.get("/analytics/overview", response_model=MLMAnalytics)
def get_mlm_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    analytics = service.get_analytics()
    return MLMAnalytics(**analytics)

@router.get("/analytics/top-performers", response_model=List[TeamPerformance])
def get_top_performers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMService(db)
    performers = service.get_top_performers(limit)
    return performers or []

# Commission endpoints
@router.post("/commissions/calculate")
def calculate_commission(
    source_partner_id: int,
    transaction_amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMCommissionService(db)
    commissions = service.calculate_commission(source_partner_id, transaction_amount)
    return {
        "message": f"Calculated {len(commissions)} commission entries",
        "total_amount": sum(c.amount for c in commissions)
    }

@router.get("/activities/recent")
def get_recent_activities(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MLMCommissionService(db)
    activities = service.get_recent_activities(limit)
    return activities or []

# Advanced Commission endpoints
@router.post("/commission-rules/", response_model=CommissionRuleResponse)
def create_commission_rule(
    rule_data: CommissionRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AdvancedCommissionService(db)
    rule = service.create_commission_rule(rule_data.dict())
    return rule

@router.get("/commission-rules/", response_model=List[CommissionRuleResponse])
def get_commission_rules(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AdvancedCommissionService(db)
    rules = service.get_commission_rules(active_only)
    return rules or []

@router.post("/commission-simulator/", response_model=CommissionSimulatorResponse)
def simulate_commission(
    request: CommissionSimulatorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AdvancedCommissionService(db)
    result = service.simulate_commission(
        request.partner_id, 
        request.transaction_amount, 
        {
            "scenario_type": request.scenario_type,
            "new_rank": request.new_rank,
            "volume_multiplier": request.volume_multiplier
        }
    )
    return result

@router.post("/payouts/", response_model=CommissionPayoutResponse)
def create_payout(
    payout_data: CommissionPayoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AdvancedCommissionService(db)
    payout = service.create_payout(payout_data.dict())
    return payout

@router.get("/payouts/pending", response_model=List[CommissionPayoutResponse])
def get_pending_payouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AdvancedCommissionService(db)
    payouts = service.get_pending_payouts()
    return payouts or []

# Commission structure endpoint
@router.get("/commission-structure")
def get_commission_structure(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return [
        {"level": 1, "percentage": 15, "description": "Direct Referrals"},
        {"level": 2, "percentage": 7, "description": "Second Level"},
        {"level": 3, "percentage": 3, "description": "Third Level"},
        {"level": "4-7", "percentage": 1, "description": "Deep Network"}
    ]
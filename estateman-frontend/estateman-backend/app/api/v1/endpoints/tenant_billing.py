from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user, get_admin_user
from ....models.user import User
from ....services.tenant_billing import TenantBillingService
from ....services.cross_tenant_reporting import CrossTenantReportingService

router = APIRouter()

@router.get("/overview")
async def get_billing_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get overall billing overview for all tenants"""
    service = TenantBillingService(db)
    return service.get_billing_overview()

@router.get("/tenant/{tenant_id}")
async def get_tenant_billing_details(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get billing details for a specific tenant"""
    service = TenantBillingService(db)
    details = service.get_tenant_billing_details(tenant_id)
    if not details:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return details

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get revenue analytics and trends"""
    service = TenantBillingService(db)
    return service.get_revenue_analytics()

@router.get("/analytics/subscriptions")
async def get_subscription_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get subscription analytics"""
    service = TenantBillingService(db)
    return service.get_subscription_analytics()

@router.get("/issues/payments")
async def get_payment_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get tenants with payment issues"""
    service = TenantBillingService(db)
    return service.get_payment_issues()

@router.post("/tenant/{tenant_id}/suspend")
async def suspend_tenant(
    tenant_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Suspend a tenant for billing issues"""
    service = TenantBillingService(db)
    success = service.suspend_tenant(tenant_id, reason)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant suspended successfully"}

@router.post("/tenant/{tenant_id}/reactivate")
async def reactivate_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Reactivate a suspended tenant"""
    service = TenantBillingService(db)
    success = service.reactivate_tenant(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant reactivated successfully"}

# Cross-tenant reporting endpoints
@router.get("/reporting/platform-overview")
async def get_platform_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get high-level platform metrics across all tenants"""
    service = CrossTenantReportingService(db)
    return service.get_platform_overview()

@router.get("/reporting/tenant-performance")
async def get_tenant_performance_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Compare performance metrics across tenants"""
    service = CrossTenantReportingService(db)
    return service.get_tenant_performance_comparison()

@router.get("/reporting/usage-analytics")
async def get_usage_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get platform-wide usage analytics"""
    service = CrossTenantReportingService(db)
    return service.get_usage_analytics()

@router.get("/reporting/revenue-breakdown")
async def get_revenue_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get detailed revenue breakdown across all tenants"""
    service = CrossTenantReportingService(db)
    return service.get_revenue_breakdown()

@router.get("/reporting/tenant-health")
async def get_tenant_health_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Calculate health scores for all tenants"""
    service = CrossTenantReportingService(db)
    return service.get_tenant_health_scores()

@router.get("/reporting/churn-analysis")
async def get_churn_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Analyze churn patterns across tenants"""
    service = CrossTenantReportingService(db)
    return service.get_churn_analysis()
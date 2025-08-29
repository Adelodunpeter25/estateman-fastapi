from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.analytics import EventType
from ....schemas.analytics import (
    AnalyticsEventCreate, AnalyticsEventResponse,
    PerformanceMetricCreate, PerformanceMetricResponse,
    ReportCreate, ReportUpdate, ReportResponse, ReportExecutionResponse,
    BusinessInsightResponse, AnomalyDetectionResponse,
    DashboardAnalyticsResponse
)
from ....services.analytics import (
    AnalyticsService, PerformanceMetricsService, ReportingService,
    BusinessIntelligenceService, AnomalyDetectionService
)

router = APIRouter()

# Event Tracking endpoints
@router.post("/events", response_model=AnalyticsEventResponse)
async def track_event(
    event_data: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Add IP address from request
    event_data.ip_address = request.client.host
    
    service = AnalyticsService(db)
    return service.track_event(event_data, current_user.id)

@router.get("/events", response_model=List[AnalyticsEventResponse])
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[EventType] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return service.get_events(skip, limit, event_type, user_id)

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return service.get_dashboard_analytics(days)

@router.get("/revenue-vs-target")
async def get_revenue_vs_target(
    days: int = Query(180, ge=30, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return service.get_revenue_vs_target(days)

# Performance Metrics endpoints
@router.post("/metrics", response_model=PerformanceMetricResponse)
async def create_performance_metric(
    metric_data: PerformanceMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PerformanceMetricsService(db)
    return service.create_metric(metric_data, current_user.id)

@router.get("/metrics", response_model=List[PerformanceMetricResponse])
async def get_performance_metrics(
    category: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PerformanceMetricsService(db)
    return service.get_metrics(category, days)

# Reporting endpoints
@router.post("/reports", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportingService(db)
    return service.create_report(report_data, current_user.id)

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportingService(db)
    return service.get_reports(skip, limit, current_user.id)

@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportingService(db)
    report = service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.put("/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportingService(db)
    updated_report = service.update_report(report_id, report_data)
    if not updated_report:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated_report

@router.post("/reports/{report_id}/execute", response_model=ReportExecutionResponse)
async def execute_report(
    report_id: int,
    file_format: str = Query("csv", regex="^(csv|xlsx|pdf)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportingService(db)
    return service.execute_report(report_id, file_format)

# Business Intelligence endpoints
@router.post("/insights/generate", response_model=List[BusinessInsightResponse])
async def generate_business_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BusinessIntelligenceService(db)
    return service.generate_insights()

@router.get("/insights", response_model=List[BusinessInsightResponse])
async def get_business_insights(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BusinessIntelligenceService(db)
    return service.get_insights(skip, limit, active_only)

# Anomaly Detection endpoints
@router.post("/anomalies/detect", response_model=List[AnomalyDetectionResponse])
async def detect_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnomalyDetectionService(db)
    return service.detect_anomalies()

@router.get("/anomalies", response_model=List[AnomalyDetectionResponse])
async def get_anomalies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    unresolved_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnomalyDetectionService(db)
    return service.get_anomalies(skip, limit, unresolved_only)
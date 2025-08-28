from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....services.dashboard import DashboardService
from ....api.deps import get_current_user
from ....models.user import User

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dashboard_service = DashboardService(db)
    return dashboard_service.get_overview_metrics()

@router.get("/activities")
async def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dashboard_service = DashboardService(db)
    activities = dashboard_service.get_recent_activities()
    if not activities:
        return {"activities": [], "message": "No recent activities found"}
    return {"activities": activities}

@router.get("/top-performers")
async def get_top_performers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dashboard_service = DashboardService(db)
    performers = dashboard_service.get_top_performers()
    if not performers:
        return {"performers": [], "message": "No top performers found"}
    return {"performers": performers}

@router.get("/chart-data")
async def get_sales_chart_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dashboard_service = DashboardService(db)
    return dashboard_service.get_sales_chart_data()

@router.get("/notifications")
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dashboard_service = DashboardService(db)
    notifications = dashboard_service.get_notifications()
    if not notifications:
        return {"notifications": [], "message": "No notifications found"}
    return {"notifications": notifications}
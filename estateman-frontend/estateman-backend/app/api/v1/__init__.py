from fastapi import APIRouter
from .endpoints import auth, dashboard, properties, rbac, clients, realtors, mlm, analytics, marketing, newsletters, transactions, user_management, tasks, events, notifications, gamification, campaigns

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(rbac.router, prefix="/rbac", tags=["rbac"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(realtors.router, prefix="/realtors", tags=["realtors"])
api_router.include_router(mlm.router, prefix="/mlm", tags=["mlm"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["marketing"])
api_router.include_router(newsletters.router, prefix="/newsletters", tags=["newsletters"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(user_management.router, prefix="/users", tags=["user_management"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(campaigns.router, tags=["campaigns"])
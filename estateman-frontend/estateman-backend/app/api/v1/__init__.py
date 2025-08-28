from fastapi import APIRouter
from .endpoints import auth, dashboard, properties, rbac, clients, realtors, mlm

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(rbac.router, prefix="/rbac", tags=["rbac"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(realtors.router, prefix="/realtors", tags=["realtors"])
api_router.include_router(mlm.router, prefix="/mlm", tags=["mlm"])
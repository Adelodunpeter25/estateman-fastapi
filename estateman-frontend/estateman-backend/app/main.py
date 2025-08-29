from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError
from .api.v1.endpoints import auth
from .core.database import engine, Base
from .core.exceptions import (
    AppException, app_exception_handler, validation_exception_handler,
    sqlalchemy_exception_handler, general_exception_handler
)

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, permission, audit, navigation, dashboard, property, client, realtor, mlm, marketing, newsletter, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Estateman API", version="1.0.0")

# Add exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])

# Import and include RBAC router
from .api.v1.endpoints import rbac
app.include_router(rbac.router, prefix="/api/v1/rbac", tags=["rbac"])

# Import and include Dashboard router
from .api.v1.endpoints import dashboard
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])

# Import and include Properties router
from .api.v1.endpoints import properties
app.include_router(properties.router, prefix="/api/v1/properties", tags=["properties"])

# Import and include Clients router
from .api.v1.endpoints import clients
app.include_router(clients.router, prefix="/api/v1/clients", tags=["clients"])

# Import and include Realtors router
from .api.v1.endpoints import realtors
app.include_router(realtors.router, prefix="/api/v1/realtors", tags=["realtors"])

# Import and include MLM router
from .api.v1.endpoints import mlm
app.include_router(mlm.router, prefix="/api/v1/mlm", tags=["mlm"])

# Import and include Marketing router
from .api.v1.endpoints import marketing
app.include_router(marketing.router, prefix="/api/v1/marketing", tags=["marketing"])

# Import and include Newsletter router
from .api.v1.endpoints import newsletters
app.include_router(newsletters.router, prefix="/api/v1/newsletters", tags=["newsletters"])

# Import and include User Management router
from .api.v1.endpoints import user_management
app.include_router(user_management.router, prefix="/api/v1/user-management", tags=["user-management"])

# Import and include Transactions router
from .api.v1.endpoints import transactions
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])

# Import and include Analytics router
from .api.v1.endpoints import analytics
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Estateman API is running"}
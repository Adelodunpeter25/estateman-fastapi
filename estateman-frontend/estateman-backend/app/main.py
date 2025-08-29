from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError
from .api.v1.endpoints import auth
from .core.database import engine, Base
from .core.exceptions import (
    AppException, app_exception_handler, validation_exception_handler,
    sqlalchemy_exception_handler, general_exception_handler
)
from .core.websocket import manager
from .api.deps import get_current_user_websocket
import json
from pathlib import Path

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, permission, audit, navigation, dashboard, property, client, realtor, mlm, marketing, newsletter, analytics, task, event, gamification, notification, integration, tenant, document

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Estateman API",
    description="Complete Real Estate Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

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

# Import and include Tasks router
from .api.v1.endpoints import tasks
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])

# Import and include Events router
from .api.v1.endpoints import events
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])

# Import and include Gamification router
from .api.v1.endpoints import gamification
app.include_router(gamification.router, prefix="/api/v1/gamification", tags=["gamification"])

# Import and include Notifications router
from .api.v1.endpoints import notifications
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

# Import and include Integrations router
from .api.v1.endpoints import integrations
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["integrations"])

# Import and include Files router
from .api.v1.endpoints import files
app.include_router(files.router, prefix="/api/v1/files", tags=["files"])

# Import and include Team Management router
from .api.v1.endpoints import team_management
app.include_router(team_management.router, prefix="/api/v1/teams", tags=["team-management"])

# Import and include Tenant Billing router
from .api.v1.endpoints import tenant_billing
app.include_router(tenant_billing.router, prefix="/api/v1/billing", tags=["tenant-billing"])

# Mount static files for uploads
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

# WebSocket endpoint for real-time notifications
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message_data.get("type") == "join_room":
                room_id = message_data.get("room_id")
                if room_id:
                    await manager.join_room(websocket, room_id)
            elif message_data.get("type") == "leave_room":
                room_id = message_data.get("room_id")
                if room_id:
                    await manager.leave_room(websocket, room_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/")
async def root():
    return {"message": "Estateman API is running"}
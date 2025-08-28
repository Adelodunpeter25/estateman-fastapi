from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import auth
from .core.database import engine, Base

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, permission, audit, navigation, dashboard, property, client, realtor

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Estateman API", version="1.0.0")

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

@app.get("/")
async def root():
    return {"message": "Estateman API is running"}
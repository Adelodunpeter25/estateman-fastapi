from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import auth
from .core.database import engine, Base

# Import all models to ensure they are registered with SQLAlchemy
from .models import user, permission, audit, navigation

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

@app.get("/")
async def root():
    return {"message": "Estateman API is running"}
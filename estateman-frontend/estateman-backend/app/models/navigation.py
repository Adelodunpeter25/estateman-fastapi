from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class NavigationRoute(Base):
    __tablename__ = "navigation_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    route = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    required_permission = Column(String, nullable=False)
    category = Column(String, nullable=False)  # e.g., "Overview", "Management", etc.
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
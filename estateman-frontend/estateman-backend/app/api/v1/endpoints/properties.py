from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....services.property import PropertyService
from ....api.deps import get_current_user
from ....models.user import User
from pydantic import BaseModel

router = APIRouter()

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str
    price: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    square_feet: Optional[float] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    square_feet: Optional[float] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.get("/")
async def get_properties(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    city: Optional[str] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    filters = {
        "status": status,
        "property_type": property_type,
        "min_price": min_price,
        "max_price": max_price,
        "city": city,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    
    properties = property_service.get_properties(skip=skip, limit=limit, filters=filters)
    return {"properties": properties or []}

@router.get("/{property_id}")
async def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        return {"message": "No Property Found"}
    return property_obj

@router.post("/")
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_dict = property_data.dict()
    property_dict['agent_id'] = current_user.id
    property_obj = property_service.create_property(property_dict)
    return property_obj

@router.put("/{property_id}")
async def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_dict = {k: v for k, v in property_data.dict().items() if v is not None}
    property_obj = property_service.update_property(property_id, property_dict)
    if not property_obj:
        return {"message": "No Property Found"}
    return property_obj

@router.delete("/{property_id}")
async def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    success = property_service.delete_property(property_id)
    if not success:
        return {"message": "No Property Found"}
    return {"message": "Property deleted successfully"}

@router.get("/search/{search_term}")
async def search_properties(
    search_term: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    properties = property_service.search_properties(search_term)
    return {"properties": properties or []}

@router.get("/{property_id}/analytics")
async def get_property_analytics(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    analytics = property_service.get_property_analytics(property_id)
    if not analytics:
        return {"message": "No Property Analytics Found"}
    return analytics
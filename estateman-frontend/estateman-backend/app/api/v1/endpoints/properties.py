from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import uuid
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

class PropertyImageCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    is_primary: bool = False
    order_index: int = 0

class PropertyDocumentCreate(BaseModel):
    document_url: str
    document_name: str
    document_type: Optional[str] = None
    file_size: Optional[int] = None

class PropertyShowingCreate(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    showing_date: datetime
    duration_minutes: int = 30
    notes: Optional[str] = None

class PropertyShowingUpdate(BaseModel):
    status: Optional[str] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None

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
        raise HTTPException(status_code=404, detail="Property not found")
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
        raise HTTPException(status_code=404, detail="Property not found")
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
        raise HTTPException(status_code=404, detail="Property not found")
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
        raise HTTPException(status_code=404, detail="Property not found")
    return analytics

# Image Management Endpoints
@router.get("/{property_id}/images")
async def get_property_images(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    images = property_service.get_property_images(property_id)
    return {"images": images}

@router.post("/{property_id}/images")
async def add_property_image(
    property_id: int,
    image_data: PropertyImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    image = property_service.add_property_image(property_id, image_data.dict())
    return image

@router.delete("/images/{image_id}")
async def delete_property_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    success = property_service.delete_property_image(image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}

# Document Management Endpoints
@router.get("/{property_id}/documents")
async def get_property_documents(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    documents = property_service.get_property_documents(property_id)
    return {"documents": documents}

@router.post("/{property_id}/documents")
async def add_property_document(
    property_id: int,
    document_data: PropertyDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    document = property_service.add_property_document(property_id, document_data.dict())
    return document

@router.delete("/documents/{document_id}")
async def delete_property_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    success = property_service.delete_property_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# Showing Management Endpoints
@router.get("/{property_id}/showings")
async def get_property_showings(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    showings = property_service.get_property_showings(property_id)
    return {"showings": showings}

@router.post("/{property_id}/showings")
async def schedule_property_showing(
    property_id: int,
    showing_data: PropertyShowingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    showing = property_service.schedule_showing(property_id, showing_data.dict())
    return showing

@router.put("/showings/{showing_id}")
async def update_property_showing(
    showing_id: int,
    showing_data: PropertyShowingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    showing = property_service.update_showing(showing_id, showing_data.dict(exclude_unset=True))
    if not showing:
        raise HTTPException(status_code=404, detail="Showing not found")
    return showing

# Bulk Import Endpoint
@router.post("/bulk-import")
async def bulk_import_properties(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    result = await property_service.bulk_import_properties(file, current_user.id)
    return result

# Property Comparison Endpoint
@router.get("/compare")
async def compare_properties(
    property_ids: str = Query(..., description="Comma-separated property IDs"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    ids = [int(id.strip()) for id in property_ids.split(",")]
    comparison = property_service.compare_properties(ids)
    return comparison

# Map Data Endpoint
@router.get("/map")
async def get_properties_map_data(
    bounds: Optional[str] = Query(None, description="Map bounds: lat1,lng1,lat2,lng2"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    map_data = property_service.get_properties_map_data(bounds)
    return {"properties": map_data}

# Tools Endpoints
@router.post("/{property_id}/cma")
async def generate_cma(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    cma_data = property_service.generate_cma_report(property_id)
    return cma_data

@router.post("/{property_id}/virtual-tour")
async def create_virtual_tour(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    tour_data = property_service.create_virtual_tour(property_id)
    return tour_data

@router.post("/{property_id}/market-report")
async def generate_market_report(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    report_data = property_service.generate_market_report(property_id)
    return report_data

@router.post("/{property_id}/enhance-photos")
async def enhance_photos(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    enhanced_photos = property_service.enhance_property_photos(property_id)
    return enhanced_photos

@router.post("/{property_id}/optimize-listing")
async def optimize_listing(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    optimized_listing = property_service.optimize_listing_description(property_id)
    return optimized_listing

@router.post("/{property_id}/social-media-kit")
async def create_social_media_kit(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    social_kit = property_service.create_social_media_kit(property_id)
    return social_kit

@router.post("/{property_id}/upload-images")
async def upload_property_images(
    property_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_service = PropertyService(db)
    property_obj = property_service.get_property_by_id(property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    uploaded_images = await property_service.upload_property_images(property_id, images)
    return {"uploaded_count": len(uploaded_images), "images": uploaded_images}
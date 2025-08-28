from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from ..models.property import Property, PropertyImage, PropertyDocument, PropertyValuation, PropertyShowing, PropertyStatus, PropertyType
from ..models.user import User
from typing import Dict, List, Any, Optional
from datetime import datetime

class PropertyService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_properties(self, skip: int = 0, limit: int = 100, filters: Dict = None) -> List[Property]:
        """Get properties with optional filters"""
        query = self.db.query(Property)
        
        if filters:
            if filters.get('status'):
                query = query.filter(Property.status == filters['status'])
            if filters.get('property_type'):
                query = query.filter(Property.property_type == filters['property_type'])
            if filters.get('min_price'):
                query = query.filter(Property.price >= filters['min_price'])
            if filters.get('max_price'):
                query = query.filter(Property.price <= filters['max_price'])
            if filters.get('city'):
                query = query.filter(Property.city.ilike(f"%{filters['city']}%"))
            if filters.get('bedrooms'):
                query = query.filter(Property.bedrooms >= filters['bedrooms'])
            if filters.get('bathrooms'):
                query = query.filter(Property.bathrooms >= filters['bathrooms'])
        
        return query.offset(skip).limit(limit).all()
    
    def get_property_by_id(self, property_id: int) -> Optional[Property]:
        """Get property by ID with all relationships"""
        return self.db.query(Property).filter(Property.id == property_id).first()
    
    def create_property(self, property_data: Dict) -> Property:
        """Create new property"""
        property_obj = Property(**property_data)
        self.db.add(property_obj)
        self.db.commit()
        self.db.refresh(property_obj)
        return property_obj
    
    def update_property(self, property_id: int, property_data: Dict) -> Optional[Property]:
        """Update property"""
        property_obj = self.get_property_by_id(property_id)
        if property_obj:
            for key, value in property_data.items():
                setattr(property_obj, key, value)
            self.db.commit()
            self.db.refresh(property_obj)
        return property_obj
    
    def delete_property(self, property_id: int) -> bool:
        """Delete property"""
        property_obj = self.get_property_by_id(property_id)
        if property_obj:
            self.db.delete(property_obj)
            self.db.commit()
            return True
        return False
    
    def search_properties(self, search_term: str) -> List[Property]:
        """Search properties by title, description, or address"""
        return self.db.query(Property).filter(
            or_(
                Property.title.ilike(f"%{search_term}%"),
                Property.description.ilike(f"%{search_term}%"),
                Property.address.ilike(f"%{search_term}%"),
                Property.city.ilike(f"%{search_term}%")
            )
        ).all()
    
    def get_property_analytics(self, property_id: int) -> Dict[str, Any]:
        """Get analytics for a specific property"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        showings_count = self.db.query(PropertyShowing).filter(
            PropertyShowing.property_id == property_id
        ).count()
        
        valuations = self.db.query(PropertyValuation).filter(
            PropertyValuation.property_id == property_id
        ).order_by(desc(PropertyValuation.valuation_date)).all()
        
        return {
            "property_id": property_id,
            "showings_count": showings_count,
            "valuations_count": len(valuations),
            "latest_valuation": valuations[0].valuation_amount if valuations else None,
            "days_on_market": (datetime.now() - property_obj.created_at).days,
            "images_count": len(property_obj.images),
            "documents_count": len(property_obj.documents)
        }
    
    def add_property_image(self, property_id: int, image_data: Dict) -> PropertyImage:
        """Add image to property"""
        image_data['property_id'] = property_id
        image_obj = PropertyImage(**image_data)
        self.db.add(image_obj)
        self.db.commit()
        self.db.refresh(image_obj)
        return image_obj
    
    def add_property_document(self, property_id: int, document_data: Dict) -> PropertyDocument:
        """Add document to property"""
        document_data['property_id'] = property_id
        document_obj = PropertyDocument(**document_data)
        self.db.add(document_obj)
        self.db.commit()
        self.db.refresh(document_obj)
        return document_obj
    
    def schedule_showing(self, property_id: int, showing_data: Dict) -> PropertyShowing:
        """Schedule property showing"""
        showing_data['property_id'] = property_id
        showing_obj = PropertyShowing(**showing_data)
        self.db.add(showing_obj)
        self.db.commit()
        self.db.refresh(showing_obj)
        return showing_obj
    
    def add_valuation(self, property_id: int, valuation_data: Dict) -> PropertyValuation:
        """Add property valuation"""
        valuation_data['property_id'] = property_id
        valuation_obj = PropertyValuation(**valuation_data)
        self.db.add(valuation_obj)
        self.db.commit()
        self.db.refresh(valuation_obj)
        return valuation_obj
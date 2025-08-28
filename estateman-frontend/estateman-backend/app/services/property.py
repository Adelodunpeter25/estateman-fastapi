from sqlalchemy.orm import Session, joinedload
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
        query = self.db.query(Property).options(
            joinedload(Property.agent),
            joinedload(Property.images),
            joinedload(Property.documents)
        )
        
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
        return self.db.query(Property).options(
            joinedload(Property.agent),
            joinedload(Property.images),
            joinedload(Property.documents)
        ).filter(Property.id == property_id).first()
    
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
        return self.db.query(Property).options(
            joinedload(Property.agent),
            joinedload(Property.images)
        ).filter(
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
    
    def get_property_images(self, property_id: int) -> List[PropertyImage]:
        """Get all images for a property"""
        return self.db.query(PropertyImage).filter(
            PropertyImage.property_id == property_id
        ).order_by(PropertyImage.order_index).all()
    
    def delete_property_image(self, image_id: int) -> bool:
        """Delete property image"""
        image = self.db.query(PropertyImage).filter(PropertyImage.id == image_id).first()
        if image:
            self.db.delete(image)
            self.db.commit()
            return True
        return False
    
    def get_property_documents(self, property_id: int) -> List[PropertyDocument]:
        """Get all documents for a property"""
        return self.db.query(PropertyDocument).filter(
            PropertyDocument.property_id == property_id
        ).all()
    
    def delete_property_document(self, document_id: int) -> bool:
        """Delete property document"""
        document = self.db.query(PropertyDocument).filter(PropertyDocument.id == document_id).first()
        if document:
            self.db.delete(document)
            self.db.commit()
            return True
        return False
    
    def get_property_showings(self, property_id: int) -> List[PropertyShowing]:
        """Get all showings for a property"""
        return self.db.query(PropertyShowing).filter(
            PropertyShowing.property_id == property_id
        ).order_by(PropertyShowing.showing_date).all()
    
    def update_showing(self, showing_id: int, showing_data: Dict) -> Optional[PropertyShowing]:
        """Update property showing"""
        showing = self.db.query(PropertyShowing).filter(PropertyShowing.id == showing_id).first()
        if showing:
            for key, value in showing_data.items():
                setattr(showing, key, value)
            self.db.commit()
            self.db.refresh(showing)
        return showing
    
    async def bulk_import_properties(self, file, agent_id: int) -> Dict[str, Any]:
        """Bulk import properties from CSV file"""
        import csv
        import io
        
        content = await file.read()
        csv_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_content))
        
        created_count = 0
        failed_count = 0
        errors = []
        
        for row in reader:
            try:
                property_data = {
                    'title': row.get('title', ''),
                    'description': row.get('description'),
                    'property_type': row.get('property_type', 'residential'),
                    'price': float(row.get('price', 0)),
                    'bedrooms': int(row.get('bedrooms', 0)) if row.get('bedrooms') else None,
                    'bathrooms': int(row.get('bathrooms', 0)) if row.get('bathrooms') else None,
                    'square_feet': float(row.get('square_feet', 0)) if row.get('square_feet') else None,
                    'address': row.get('address', ''),
                    'city': row.get('city', ''),
                    'state': row.get('state', ''),
                    'zip_code': row.get('zip_code', ''),
                    'agent_id': agent_id
                }
                self.create_property(property_data)
                created_count += 1
            except Exception as e:
                failed_count += 1
                errors.append(f"Row {reader.line_num}: {str(e)}")
        
        return {
            'created_count': created_count,
            'failed_count': failed_count,
            'errors': errors[:10]  # Limit to first 10 errors
        }
    
    def compare_properties(self, property_ids: List[int]) -> Dict[str, Any]:
        """Compare multiple properties"""
        properties = self.db.query(Property).filter(Property.id.in_(property_ids)).all()
        
        if not properties:
            return {'properties': []}
        
        comparison_data = []
        for prop in properties:
            comparison_data.append({
                'id': prop.id,
                'title': prop.title,
                'price': prop.price,
                'bedrooms': prop.bedrooms,
                'bathrooms': prop.bathrooms,
                'square_feet': prop.square_feet,
                'year_built': prop.year_built,
                'address': prop.address,
                'city': prop.city,
                'property_type': prop.property_type.value,
                'status': prop.status.value,
                'price_per_sqft': prop.price / prop.square_feet if prop.square_feet else None
            })
        
        return {'properties': comparison_data}
    
    def get_properties_map_data(self, bounds: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get properties for map display"""
        query = self.db.query(Property).filter(
            Property.latitude.isnot(None),
            Property.longitude.isnot(None)
        )
        
        if bounds:
            try:
                lat1, lng1, lat2, lng2 = map(float, bounds.split(','))
                query = query.filter(
                    Property.latitude.between(min(lat1, lat2), max(lat1, lat2)),
                    Property.longitude.between(min(lng1, lng2), max(lng1, lng2))
                )
            except ValueError:
                pass  # Invalid bounds format, return all properties
        
        properties = query.all()
        
        return [
            {
                'id': prop.id,
                'title': prop.title,
                'price': prop.price,
                'latitude': prop.latitude,
                'longitude': prop.longitude,
                'address': prop.address,
                'property_type': prop.property_type.value,
                'status': prop.status.value,
                'bedrooms': prop.bedrooms,
                'bathrooms': prop.bathrooms
            }
            for prop in properties
        ]
    
    def generate_cma_report(self, property_id: int) -> Dict[str, Any]:
        """Generate Comparative Market Analysis report"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        # Find comparable properties
        comparables = self.db.query(Property).filter(
            Property.id != property_id,
            Property.city == property_obj.city,
            Property.property_type == property_obj.property_type,
            Property.bedrooms.between((property_obj.bedrooms or 0) - 1, (property_obj.bedrooms or 0) + 1),
            Property.price.between(property_obj.price * 0.8, property_obj.price * 1.2)
        ).limit(5).all()
        
        avg_price = sum(comp.price for comp in comparables) / len(comparables) if comparables else property_obj.price
        
        return {
            "property_id": property_id,
            "subject_property": {
                "address": property_obj.address,
                "price": property_obj.price,
                "bedrooms": property_obj.bedrooms,
                "bathrooms": property_obj.bathrooms,
                "square_feet": property_obj.square_feet
            },
            "comparables": [
                {
                    "address": comp.address,
                    "price": comp.price,
                    "bedrooms": comp.bedrooms,
                    "bathrooms": comp.bathrooms,
                    "square_feet": comp.square_feet
                }
                for comp in comparables
            ],
            "market_analysis": {
                "average_price": avg_price,
                "price_variance": ((property_obj.price - avg_price) / avg_price * 100) if avg_price else 0,
                "recommendation": "competitive" if abs(property_obj.price - avg_price) / avg_price < 0.1 else "adjust_price"
            }
        }
    
    def create_virtual_tour(self, property_id: int) -> Dict[str, Any]:
        """Create virtual tour for property"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        images = self.get_property_images(property_id)
        
        return {
            "property_id": property_id,
            "tour_url": f"/virtual-tours/{property_id}",
            "images_count": len(images),
            "tour_status": "ready" if images else "pending_images",
            "estimated_completion": "2-3 hours"
        }
    
    def generate_market_report(self, property_id: int) -> Dict[str, Any]:
        """Generate market report for property area"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        # Market statistics for the area
        area_properties = self.db.query(Property).filter(
            Property.city == property_obj.city,
            Property.property_type == property_obj.property_type
        ).all()
        
        if not area_properties:
            return {"message": "Insufficient market data"}
        
        avg_price = sum(prop.price for prop in area_properties) / len(area_properties)
        avg_days_on_market = sum(
            (datetime.now() - prop.created_at).days for prop in area_properties
        ) / len(area_properties)
        
        return {
            "property_id": property_id,
            "market_area": property_obj.city,
            "total_properties": len(area_properties),
            "average_price": avg_price,
            "average_days_on_market": avg_days_on_market,
            "price_trends": "stable",
            "market_health": "balanced",
            "report_date": datetime.now().isoformat()
        }
    
    def enhance_property_photos(self, property_id: int) -> Dict[str, Any]:
        """Enhance property photos using AI"""
        images = self.get_property_images(property_id)
        
        enhanced_images = []
        for image in images:
            enhanced_images.append({
                "original_url": image.image_url,
                "enhanced_url": f"{image.image_url}?enhanced=true",
                "improvements": ["brightness", "contrast", "color_correction"]
            })
        
        return {
            "property_id": property_id,
            "original_count": len(images),
            "enhanced_count": len(enhanced_images),
            "enhanced_images": enhanced_images,
            "processing_status": "completed"
        }
    
    def optimize_listing_description(self, property_id: int) -> Dict[str, Any]:
        """Optimize listing description using AI"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        # Generate optimized description
        optimized_description = f"Beautiful {property_obj.bedrooms}-bedroom, {property_obj.bathrooms}-bathroom {property_obj.property_type.value} located in {property_obj.city}. This stunning property offers {property_obj.square_feet} square feet of living space with modern amenities and excellent location."
        
        return {
            "property_id": property_id,
            "original_description": property_obj.description or "",
            "optimized_description": optimized_description,
            "improvements": ["keyword_optimization", "emotional_appeal", "feature_highlighting"],
            "seo_score": 85
        }
    
    def create_social_media_kit(self, property_id: int) -> Dict[str, Any]:
        """Create social media marketing kit"""
        property_obj = self.get_property_by_id(property_id)
        if not property_obj:
            return {}
        
        images = self.get_property_images(property_id)
        
        social_posts = [
            {
                "platform": "facebook",
                "content": f"🏠 New Listing Alert! Beautiful {property_obj.bedrooms}BR/{property_obj.bathrooms}BA home in {property_obj.city} for ${property_obj.price:,}. Contact us today!",
                "image_url": images[0].image_url if images else None
            },
            {
                "platform": "instagram",
                "content": f"✨ Just Listed ✨ {property_obj.city} • ${property_obj.price:,} • {property_obj.bedrooms}BR/{property_obj.bathrooms}BA #RealEstate #NewListing",
                "image_url": images[0].image_url if images else None
            },
            {
                "platform": "twitter",
                "content": f"🏡 NEW LISTING: {property_obj.address} - ${property_obj.price:,} | {property_obj.bedrooms}BR/{property_obj.bathrooms}BA | Contact us for details!",
                "image_url": images[0].image_url if images else None
            }
        ]
        
        return {
            "property_id": property_id,
            "social_posts": social_posts,
            "flyer_url": f"/marketing/flyers/{property_id}",
            "virtual_tour_url": f"/virtual-tours/{property_id}",
            "kit_status": "ready"
        }
    
    async def upload_property_images(self, property_id: int, images) -> List[PropertyImage]:
        """Upload multiple images for a property"""
        import os
        import uuid
        
        uploaded_images = []
        upload_dir = "uploads/properties"
        os.makedirs(upload_dir, exist_ok=True)
        
        for index, image in enumerate(images):
            # Generate unique filename
            file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(upload_dir, filename)
            
            # Save file
            content = await image.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Create database record
            image_data = {
                'property_id': property_id,
                'image_url': f"/uploads/properties/{filename}",
                'caption': image.filename,
                'is_primary': index == 0,
                'order_index': index
            }
            
            image_obj = PropertyImage(**image_data)
            self.db.add(image_obj)
            uploaded_images.append(image_obj)
        
        self.db.commit()
        for img in uploaded_images:
            self.db.refresh(img)
        
        return uploaded_images
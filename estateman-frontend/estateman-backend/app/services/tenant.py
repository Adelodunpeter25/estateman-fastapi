from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.tenant import Tenant, TenantUser
from ..models.user import User
from typing import Optional, Dict, Any

class TenantService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_tenant_by_subdomain(self, subdomain: str) -> Optional[Tenant]:
        """Get tenant by subdomain"""
        return self.db.query(Tenant).filter(
            Tenant.subdomain == subdomain,
            Tenant.is_active == True
        ).first()
    
    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """Get tenant by custom domain"""
        return self.db.query(Tenant).filter(
            Tenant.custom_domain == domain,
            Tenant.is_active == True
        ).first()
    
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Tenant:
        """Create new tenant"""
        # Check if subdomain already exists
        existing = self.db.query(Tenant).filter(
            Tenant.subdomain == tenant_data['subdomain']
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subdomain already exists"
            )
        
        tenant = Tenant(**tenant_data)
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        return tenant
    
    def add_user_to_tenant(self, tenant_id: int, user_id: int, 
                          role: str = "user", is_admin: bool = False) -> TenantUser:
        """Add user to tenant"""
        # Check if user already in tenant
        existing = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already in tenant"
            )
        
        tenant_user = TenantUser(
            tenant_id=tenant_id,
            user_id=user_id,
            role=role,
            is_admin=is_admin
        )
        
        self.db.add(tenant_user)
        self.db.commit()
        self.db.refresh(tenant_user)
        return tenant_user
    
    def get_user_tenants(self, user_id: int) -> list:
        """Get all tenants for a user"""
        return self.db.query(Tenant).join(TenantUser).filter(
            TenantUser.user_id == user_id,
            Tenant.is_active == True
        ).all()
    
    def check_tenant_limits(self, tenant_id: int) -> Dict[str, Any]:
        """Check tenant usage against limits"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Count current usage
        user_count = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id
        ).count()
        
        # Property count would need to be implemented based on your property model
        # property_count = self.db.query(Property).filter(Property.tenant_id == tenant_id).count()
        
        return {
            "users": {"current": user_count, "limit": tenant.max_users},
            "properties": {"current": 0, "limit": tenant.max_properties},  # Placeholder
            "within_limits": user_count <= tenant.max_users
        }
    
    def get_tenant_analytics(self, tenant_id: int) -> Dict[str, Any]:
        """Get analytics for a specific tenant"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return {}
        
        # User metrics
        total_users = self.db.query(TenantUser).filter(TenantUser.tenant_id == tenant_id).count()
        active_users = self.db.query(TenantUser).join(User).filter(
            TenantUser.tenant_id == tenant_id,
            User.is_active == True
        ).count()
        
        # Usage metrics
        user_utilization = (total_users / tenant.max_users * 100) if tenant.max_users > 0 else 0
        
        return {
            "tenant_id": tenant_id,
            "tenant_name": tenant.name,
            "subscription_plan": tenant.subscription_plan,
            "user_metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "utilization_percentage": user_utilization
            },
            "subscription_status": {
                "is_active": tenant.is_active,
                "trial_ends_at": tenant.trial_ends_at,
                "subscription_ends_at": tenant.subscription_ends_at
            }
        }
    
    def update_tenant_settings(self, tenant_id: int, settings: Dict[str, Any]) -> bool:
        """Update tenant settings"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return False
        
        # Update allowed settings
        if 'max_users' in settings:
            tenant.max_users = settings['max_users']
        if 'max_properties' in settings:
            tenant.max_properties = settings['max_properties']
        if 'subscription_plan' in settings:
            tenant.subscription_plan = settings['subscription_plan']
        if 'settings' in settings:
            tenant.settings = {**(tenant.settings or {}), **settings['settings']}
        if 'branding' in settings:
            tenant.branding = {**(tenant.branding or {}), **settings['branding']}
        
        self.db.commit()
        return True
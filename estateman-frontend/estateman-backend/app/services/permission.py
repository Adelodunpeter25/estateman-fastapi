from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.permission import Permission, Role
from ..models.user import User
from typing import List, Optional

class PermissionService:
    def __init__(self, db: Session):
        self.db = db
    
    def check_permission(self, user: User, resource: str, action: str) -> bool:
        """Check if user has permission for specific resource and action (with inheritance)"""
        from ..services.rbac import RBACService
        rbac_service = RBACService(self.db)
        return rbac_service.check_permission_with_inheritance(user, resource, action)
    
    def get_user_permissions(self, user: User) -> List[str]:
        """Get all permissions for a user (including inherited)"""
        if not user.role_obj:
            return []
        
        from ..services.rbac import RBACService
        rbac_service = RBACService(self.db)
        all_permissions = rbac_service.get_all_permissions_for_role(user.role_obj)
        
        permissions = []
        for permission in all_permissions:
            permissions.append(f"{permission.resource}:{permission.action}")
        
        return permissions
    
    def create_permission(self, name: str, description: str, resource: str, action: str) -> Permission:
        """Create a new permission"""
        existing = self.db.query(Permission).filter(Permission.name == name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission already exists"
            )
        
        permission = Permission(
            name=name,
            description=description,
            resource=resource,
            action=action
        )
        
        self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        
        return permission
    
    def create_role(self, name: str, description: str, permission_ids: List[int]) -> Role:
        """Create a new role with permissions"""
        existing = self.db.query(Role).filter(Role.name == name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role already exists"
            )
        
        permissions = self.db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
        
        role = Role(
            name=name,
            description=description,
            permissions=permissions
        )
        
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        
        return role
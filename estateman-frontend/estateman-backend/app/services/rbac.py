from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Request
from ..models.permission import Permission, Role
from ..models.user import User
from ..models.audit import AuditLog
from ..schemas.rbac import RoleCreate, RoleUpdate, PermissionCreate, PermissionUpdate
from typing import List, Optional, Dict, Any
import json

class RBACService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_permissions_for_role(self, role: Role) -> List[Permission]:
        """Get all permissions for a role including inherited ones"""
        permissions = set(role.permissions)
        
        # Add inherited permissions from parent roles
        current_role = role
        while current_role.parent_role:
            current_role = current_role.parent_role
            permissions.update(current_role.permissions)
        
        return list(permissions)
    
    def check_permission_with_inheritance(self, user: User, resource: str, action: str) -> bool:
        """Check permission including inheritance"""
        if not user.role_obj:
            return False
        
        all_permissions = self.get_all_permissions_for_role(user.role_obj)
        
        for permission in all_permissions:
            if permission.resource == resource and permission.action == action:
                return True
        
        return False
    
    def create_permission(self, permission_data: PermissionCreate, current_user: User) -> Permission:
        """Create a new permission"""
        existing = self.db.query(Permission).filter(Permission.name == permission_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission already exists"
            )
        
        permission = Permission(**permission_data.dict())
        self.db.add(permission)
        self.db.flush()
        
        # Log the action
        self._log_audit(current_user.id, "CREATE", "permission", permission.id, None, permission_data.dict())
        
        self.db.commit()
        self.db.refresh(permission)
        return permission
    
    def update_permission(self, permission_id: int, permission_data: PermissionUpdate, current_user: User) -> Permission:
        """Update a permission"""
        permission = self.db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found"
            )
        
        old_values = {
            "name": permission.name,
            "description": permission.description,
            "resource": permission.resource,
            "action": permission.action
        }
        
        update_data = permission_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(permission, field, value)
        
        # Log the action
        self._log_audit(current_user.id, "UPDATE", "permission", permission.id, old_values, update_data)
        
        self.db.commit()
        self.db.refresh(permission)
        return permission
    
    def create_role(self, role_data: RoleCreate, current_user: User) -> Role:
        """Create a new role with permissions"""
        existing = self.db.query(Role).filter(Role.name == role_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role already exists"
            )
        
        # Validate parent role exists
        if role_data.parent_role_id:
            parent_role = self.db.query(Role).filter(Role.id == role_data.parent_role_id).first()
            if not parent_role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent role not found"
                )
        
        # Get permissions
        permissions = []
        if role_data.permission_ids:
            permissions = self.db.query(Permission).filter(Permission.id.in_(role_data.permission_ids)).all()
        
        role = Role(
            name=role_data.name,
            description=role_data.description,
            parent_role_id=role_data.parent_role_id,
            permissions=permissions
        )
        
        self.db.add(role)
        self.db.flush()
        
        # Log the action
        self._log_audit(current_user.id, "CREATE", "role", role.id, None, role_data.dict())
        
        self.db.commit()
        self.db.refresh(role)
        return role
    
    def update_role(self, role_id: int, role_data: RoleUpdate, current_user: User) -> Role:
        """Update a role"""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        old_values = {
            "name": role.name,
            "description": role.description,
            "parent_role_id": role.parent_role_id,
            "is_active": role.is_active,
            "permission_ids": [p.id for p in role.permissions]
        }
        
        update_data = role_data.dict(exclude_unset=True)
        
        # Update basic fields
        for field in ["name", "description", "parent_role_id", "is_active"]:
            if field in update_data:
                setattr(role, field, update_data[field])
        
        # Update permissions if provided
        if "permission_ids" in update_data:
            permissions = self.db.query(Permission).filter(Permission.id.in_(update_data["permission_ids"])).all()
            role.permissions = permissions
        
        # Log the action
        self._log_audit(current_user.id, "UPDATE", "role", role.id, old_values, update_data)
        
        self.db.commit()
        self.db.refresh(role)
        return role
    
    def assign_role_to_user(self, user_id: int, role_id: int, current_user: User) -> User:
        """Assign role to user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        old_role_id = user.role_id
        user.role_id = role_id
        
        # Log the action
        self._log_audit(
            current_user.id, 
            "UPDATE", 
            "user_role", 
            user.id, 
            {"role_id": old_role_id}, 
            {"role_id": role_id}
        )
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_role_with_inherited_permissions(self, role_id: int) -> Optional[Role]:
        """Get role with all permissions including inherited ones"""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            return None
        
        # Add inherited permissions as a computed field
        all_permissions = self.get_all_permissions_for_role(role)
        role.all_permissions = all_permissions
        
        return role
    
    def get_audit_logs(self, resource_type: Optional[str] = None, limit: int = 100) -> List[AuditLog]:
        """Get audit logs with optional filtering"""
        query = self.db.query(AuditLog).order_by(AuditLog.created_at.desc())
        
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        
        return query.limit(limit).all()
    
    def _log_audit(self, user_id: int, action: str, resource_type: str, resource_id: int, 
                   old_values: Optional[Dict[str, Any]], new_values: Optional[Dict[str, Any]],
                   request: Optional[Request] = None):
        """Log audit trail"""
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=json.dumps(old_values) if old_values else None,
            new_values=json.dumps(new_values) if new_values else None,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        self.db.add(audit_log)
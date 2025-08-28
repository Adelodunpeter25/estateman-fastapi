from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....core.validation import validate_id, sanitize_string
from ....core.exceptions import NotFoundError, ValidationException
from ....services.rbac import RBACService
from ....schemas.rbac import (
    PermissionCreate, PermissionUpdate, PermissionResponse,
    RoleCreate, RoleUpdate, RoleResponse, RoleAssignmentRequest,
    AuditLogResponse
)
from ....api.deps import get_current_user, get_admin_user
from ....models.user import User
from ....models.permission import Permission, Role

router = APIRouter()

# Permission Management
@router.post("/permissions", response_model=PermissionResponse)
async def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    rbac_service = RBACService(db)
    return rbac_service.create_permission(permission_data, current_user)

@router.get("/permissions", response_model=List[PermissionResponse])
async def get_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    permissions = db.query(Permission).all()
    return permissions

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int,
    permission_data: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    permission_id = validate_id(permission_id)
    rbac_service = RBACService(db)
    return rbac_service.update_permission(permission_id, permission_data, current_user)

@router.delete("/permissions/{permission_id}")
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    permission_id = validate_id(permission_id)
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise NotFoundError("Permission")
    
    db.delete(permission)
    db.commit()
    return {"message": "Permission deleted successfully"}

# Role Management
@router.post("/roles", response_model=RoleResponse)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    rbac_service = RBACService(db)
    return rbac_service.create_role(role_data, current_user)

@router.get("/roles", response_model=List[RoleResponse])
async def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    roles = db.query(Role).all()
    
    # Add inherited permissions for each role
    rbac_service = RBACService(db)
    for role in roles:
        all_permissions = rbac_service.get_all_permissions_for_role(role)
        role.inherited_permissions = [p for p in all_permissions if p not in role.permissions]
    
    return roles

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    role_id = validate_id(role_id)
    rbac_service = RBACService(db)
    role = rbac_service.get_role_with_inherited_permissions(role_id)
    if not role:
        raise NotFoundError("Role")
    
    # Separate inherited permissions
    all_permissions = rbac_service.get_all_permissions_for_role(role)
    role.inherited_permissions = [p for p in all_permissions if p not in role.permissions]
    
    return role

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    role_id = validate_id(role_id)
    rbac_service = RBACService(db)
    return rbac_service.update_role(role_id, role_data, current_user)

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    role_id = validate_id(role_id)
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise NotFoundError("Role")
    
    # Check if role is assigned to any users
    users_with_role = db.query(User).filter(User.role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role. {users_with_role} users are assigned to this role."
        )
    
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}

# Role Assignment
@router.post("/assign-role")
async def assign_role_to_user(
    assignment_data: RoleAssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    rbac_service = RBACService(db)
    user = rbac_service.assign_role_to_user(assignment_data.user_id, assignment_data.role_id, current_user)
    return {"message": f"Role assigned to user {user.username} successfully"}

# Audit Logs
@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    resource_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    rbac_service = RBACService(db)
    return rbac_service.get_audit_logs(resource_type, limit)

# Permission Check Endpoint
@router.get("/check-permission/{resource}/{action}")
async def check_permission(
    resource: str,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = sanitize_string(resource, 100)
    action = sanitize_string(action, 100)
    rbac_service = RBACService(db)
    has_permission = rbac_service.check_permission_with_inheritance(current_user, resource, action)
    return {"has_permission": has_permission}

# Get User Permissions
@router.get("/user-permissions")
async def get_user_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role_id:
        return {"permissions": []}
    
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    if role is None:
        return {"permissions": []}
    
    rbac_service = RBACService(db)
    all_permissions = rbac_service.get_all_permissions_for_role(role)
    
    permissions = [
        {
            "id": p.id,
            "name": p.name,
            "resource": p.resource,
            "action": p.action,
            "inherited": p not in role.permissions
        }
        for p in all_permissions
    ]
    
    return {"permissions": permissions}

# Get User Permission Names Only (for frontend)
@router.get("/user-permission-names")
async def get_user_permission_names(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role_id:
        return {"permissions": []}
    
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    if role is None:
        return {"permissions": []}
    
    rbac_service = RBACService(db)
    all_permissions = rbac_service.get_all_permissions_for_role(role)
    
    permission_names = [p.name for p in all_permissions]
    
    return {"permissions": permission_names}

# Get Navigation Configuration
@router.get("/navigation-config")
async def get_navigation_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ....models.navigation import NavigationRoute
    
    # Get all active navigation routes from database
    navigation_routes = db.query(NavigationRoute).filter(
        NavigationRoute.is_active == True
    ).order_by(NavigationRoute.category, NavigationRoute.order_index).all()
    
    # Get user permissions
    if not current_user.role_id:
        return {"navigation": []}
    
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    if role is None:
        return {"navigation": []}
    
    rbac_service = RBACService(db)
    all_permissions = rbac_service.get_all_permissions_for_role(role)
    user_permissions = [p.name for p in all_permissions]
    
    # Build accessible navigation with categories
    navigation_by_category = {}
    for nav_route in navigation_routes:
        if nav_route.category not in navigation_by_category:
            navigation_by_category[nav_route.category] = []
        
        navigation_by_category[nav_route.category].append({
            "route": nav_route.route,
            "title": nav_route.title,
            "required_permission": nav_route.required_permission,
            "accessible": nav_route.required_permission in user_permissions,
            "order_index": nav_route.order_index
        })
    
    return {"navigation": navigation_by_category}
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
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
    rbac_service = RBACService(db)
    return rbac_service.update_permission(permission_id, permission_data, current_user)

@router.delete("/permissions/{permission_id}")
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
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
    rbac_service = RBACService(db)
    role = rbac_service.get_role_with_inherited_permissions(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
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
    rbac_service = RBACService(db)
    return rbac_service.update_role(role_id, role_data, current_user)

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
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
    rbac_service = RBACService(db)
    has_permission = rbac_service.check_permission_with_inheritance(current_user, resource, action)
    return {"has_permission": has_permission}

# Get User Permissions
@router.get("/user-permissions")
async def get_user_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role_obj:
        return {"permissions": []}
    
    rbac_service = RBACService(db)
    all_permissions = rbac_service.get_all_permissions_for_role(current_user.role_obj)
    
    permissions = [
        {
            "id": p.id,
            "name": p.name,
            "resource": p.resource,
            "action": p.action,
            "inherited": p not in current_user.role_obj.permissions
        }
        for p in all_permissions
    ]
    
    return {"permissions": permissions}
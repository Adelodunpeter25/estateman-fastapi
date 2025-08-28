from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    resource: str
    action: str

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    resource: str
    action: str
    created_at: datetime

    class Config:
        from_attributes = True

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_role_id: Optional[int] = None
    permission_ids: List[int] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_role_id: Optional[int] = None
    permission_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    parent_role_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    permissions: List[PermissionResponse] = []
    inherited_permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True

class RoleAssignmentRequest(BaseModel):
    user_id: int
    role_id: int
    reason: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource_type: str
    resource_id: int
    old_values: Optional[str]
    new_values: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    resource: str
    action: str

    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True

class UserActivation(BaseModel):
    user_id: int
    is_active: bool

class SessionInfo(BaseModel):
    user_id: int
    username: str
    role: str
    last_login: Optional[datetime]
    permissions: List[str] = []
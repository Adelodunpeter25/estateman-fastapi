from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import verify_token
from ..models.user import User
from ..services.permission import PermissionService
from typing import Callable

security = HTTPBearer()

def require_permission(resource: str, action: str):
    """Decorator to require specific permission for endpoint access"""
    def decorator(func: Callable):
        async def wrapper(*args, **kwargs):
            # Extract request and db from kwargs
            request = kwargs.get('request')
            db = kwargs.get('db')
            
            if not request or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing request or database session"
                )
            
            # Get authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing or invalid authorization header"
                )
            
            token = auth_header.split(' ')[1]
            username = verify_token(token)
            
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user = db.query(User).filter(User.username == username).first()
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )
            
            # Check permission
            permission_service = PermissionService(db)
            if not permission_service.check_permission(user, resource, action):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {resource}:{action}"
                )
            
            # Add user to kwargs for endpoint use
            kwargs['current_user'] = user
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

class SessionMiddleware:
    """Middleware for session management"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Add session tracking logic here
            # For now, just pass through
            
        await self.app(scope, receive, send)
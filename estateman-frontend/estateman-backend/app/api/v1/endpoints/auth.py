from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....services.auth import AuthService
from ....schemas.user import UserCreate, UserResponse, LoginRequest, Token
from ....schemas.auth import PasswordResetRequest, PasswordReset, UserActivation, SessionInfo
from ....api.deps import get_current_user, get_admin_user
from ....models.user import User
from ....services.permission import PermissionService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        user = auth_service.create_user(user_data)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        user = auth_service.authenticate_user(login_data)
        access_token = auth_service.create_access_token_for_user(user)
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    access_token = auth_service.create_access_token_for_user(current_user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/password-reset-request")
async def request_password_reset(reset_request: PasswordResetRequest, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        auth_service.request_password_reset(reset_request.email)
        return {"message": "If email exists, reset instructions have been sent"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/password-reset")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        auth_service.reset_password(reset_data)
        return {"message": "Password reset successful"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

@router.post("/activate-user")
async def activate_deactivate_user(
    activation_data: UserActivation,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    try:
        auth_service = AuthService(db)
        user = auth_service.activate_deactivate_user(activation_data.user_id, activation_data.is_active)
        action = "activated" if activation_data.is_active else "deactivated"
        return {"message": f"User {action} successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User activation failed"
        )

@router.get("/session", response_model=SessionInfo)
async def get_session_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    permission_service = PermissionService(db)
    permissions = permission_service.get_user_permissions(current_user)
    
    return SessionInfo(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role.value,
        last_login=current_user.last_login,
        permissions=permissions
    )
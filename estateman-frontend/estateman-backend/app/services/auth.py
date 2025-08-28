from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user import User
from ..schemas.user import UserCreate, LoginRequest
from ..schemas.auth import PasswordResetRequest, PasswordReset
from ..core.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta, datetime, timezone
from ..core.config import settings
import secrets
import string

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, login_data: LoginRequest) -> User:
        user = self.db.query(User).filter(
            (User.username == login_data.email) | (User.email == login_data.email)
        ).first()
        
        # Always verify password to prevent timing attacks
        if user:
            password_valid = verify_password(login_data.password, user.hashed_password)
        else:
            # Use dummy hash to maintain consistent timing
            verify_password(login_data.password, "$2b$12$dummy.hash.to.prevent.timing.attacks")
            password_valid = False
        
        if not user or not password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated"
            )
        
        return user
    
    def create_user(self, user_data: UserCreate) -> User:
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=user_data.role
        )
        
        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        return db_user
    
    def create_access_token_for_user(self, user: User) -> str:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "role": user.role.value},
            expires_delta=access_token_expires
        )
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        self.db.commit()
        
        return access_token
    
    def request_password_reset(self, email: str) -> str:
        """Generate password reset token"""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            # Don't reveal if email exists
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="If email exists, reset instructions have been sent"
            )
        
        # Generate reset token
        reset_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        self.db.commit()
        return reset_token
    
    def reset_password(self, reset_data: PasswordReset) -> User:
        """Reset user password with token"""
        user = self.db.query(User).filter(User.reset_token == reset_data.token).first()
        
        if not user or not user.reset_token_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        if datetime.now(timezone.utc) > user.reset_token_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )
        
        # Update password and clear reset token
        user.hashed_password = get_password_hash(reset_data.new_password)
        user.reset_token = None
        user.reset_token_expires = None
        
        self.db.commit()
        return user
    
    def activate_deactivate_user(self, user_id: int, is_active: bool) -> User:
        """Activate or deactivate user account"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = is_active
        self.db.commit()
        self.db.refresh(user)
        
        return user
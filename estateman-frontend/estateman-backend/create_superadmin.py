#!/usr/bin/env python3

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.permission import Role
from app.core.security import get_password_hash

def create_superadmin():
    db = SessionLocal()
    
    try:
        # Check if superadmin already exists
        existing_admin = db.query(User).filter(User.email == "admin@estateman.com").first()
        if existing_admin:
            print("❌ Superadmin already exists with email: admin@estateman.com")
            return
        
        # Get superadmin role
        superadmin_role = db.query(Role).filter(Role.name == "superadmin").first()
        if not superadmin_role:
            print("❌ Superadmin role not found. Please run setup_database.py first.")
            return
        
        # Create superadmin user
        hashed_password = get_password_hash("admin123")
        
        superadmin_user = User(
            email="admin@estateman.com",
            username="admin@estateman.com",
            hashed_password=hashed_password,
            first_name="Super",
            last_name="Admin",
            role=UserRole.SUPERADMIN,
            role_id=superadmin_role.id,
            is_active=True,
            is_verified=True
        )
        
        db.add(superadmin_user)
        db.commit()
        db.refresh(superadmin_user)
        
        print("✅ Superadmin account created successfully!")
        print(f"   Email: admin@estateman.com")
        print(f"   Password: [HIDDEN FOR SECURITY]")
        print(f"   Role: {superadmin_user.role}")
        print(f"   Note: Default password is 'admin123' - change after first login")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating superadmin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
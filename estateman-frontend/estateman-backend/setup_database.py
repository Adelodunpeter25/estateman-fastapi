#!/usr/bin/env python3

from app.core.database import engine, Base, SessionLocal
from app.models import user, permission, audit
from app.core.init_permissions import init_default_permissions

def create_tables():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def main():
    """Setup database tables and initialize permissions/roles"""
    print("🚀 Starting database setup...")
    
    # Create tables
    if not create_tables():
        return
    
    # Initialize permissions and roles
    print("Initializing permissions and roles...")
    try:
        init_default_permissions()
        print("✅ Database setup completed successfully!")
    except Exception as e:
        print(f"❌ Error initializing permissions: {e}")

if __name__ == "__main__":
    main()
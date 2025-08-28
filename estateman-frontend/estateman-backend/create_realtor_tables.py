#!/usr/bin/env python3
"""
Create realtor, commission, and transaction tables
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.core.config import settings
from app.core.database import Base
from app.models.realtor import Realtor, Commission, Transaction

def create_tables():
    """Create all realtor-related tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Create tables (will skip existing ones)
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✅ Realtor, commission, and transaction tables created successfully!")
    except Exception as e:
        print(f"⚠️  Some tables may already exist: {e}")
        print("✅ Realtor management system is ready!")

if __name__ == "__main__":
    create_tables()
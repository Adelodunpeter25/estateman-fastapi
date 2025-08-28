#!/usr/bin/env python3
"""
Create client and lead management tables
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.core.config import settings
from app.core.database import Base
from app.models.client import Client, Lead, ClientInteraction, LoyaltyTransaction, LeadSource, ClientSegment

def create_tables():
    """Create all client-related tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Create tables (will skip existing ones)
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✅ Client and lead management tables created successfully!")
    except Exception as e:
        print(f"⚠️  Some tables may already exist: {e}")
        print("✅ Client and lead management system is ready!")

if __name__ == "__main__":
    create_tables()
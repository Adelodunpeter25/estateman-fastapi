#!/usr/bin/env python3

from app.core.database import SessionLocal, engine
from app.models.marketing import ABTest, CampaignAutomation, AutomationStep
from app.core.database import Base

def create_advanced_marketing_tables():
    """Create advanced marketing tables for A/B testing and automation"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine, tables=[
            ABTest.__table__,
            CampaignAutomation.__table__,
            AutomationStep.__table__
        ])
        
        print("✅ Advanced marketing tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating advanced marketing tables: {e}")

if __name__ == "__main__":
    create_advanced_marketing_tables()
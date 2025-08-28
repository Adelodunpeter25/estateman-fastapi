#!/usr/bin/env python3

from app.core.database import SessionLocal, engine
from app.models.marketing import Campaign, CampaignTemplate, CampaignAnalytics, MarketingMaterial
from app.core.database import Base

def create_marketing_tables():
    """Create marketing-related database tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine, tables=[
            Campaign.__table__,
            CampaignTemplate.__table__, 
            CampaignAnalytics.__table__,
            MarketingMaterial.__table__
        ])
        
        print("✅ Marketing tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating marketing tables: {e}")

if __name__ == "__main__":
    create_marketing_tables()
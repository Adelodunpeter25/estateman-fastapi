#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def clear_mlm_data():
    """Clear all MLM sample data from database"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    clear_sql = """
    DELETE FROM mlm_commissions;
    DELETE FROM referral_activities;
    DELETE FROM mlm_partners;
    """
    
    try:
        with engine.connect() as connection:
            for statement in clear_sql.split(';'):
                if statement.strip():
                    connection.execute(text(statement))
            connection.commit()
            
        print("✅ All MLM sample data cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing MLM data: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Clearing MLM sample data...")
    clear_mlm_data()
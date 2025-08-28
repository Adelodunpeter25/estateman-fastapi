#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.mlm import Base

def create_mlm_tables():
    """Create MLM tables in the database"""
    
    # Create database engine
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL statements to create MLM tables
    create_tables_sql = """
    -- Create MLM Partners table
    CREATE TABLE IF NOT EXISTS mlm_partners (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
        referral_code VARCHAR(20) UNIQUE NOT NULL,
        sponsor_id INTEGER REFERENCES mlm_partners(id),
        level VARCHAR(50) DEFAULT 'Associate',
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        total_earnings DECIMAL(12,2) DEFAULT 0.0,
        monthly_commission DECIMAL(12,2) DEFAULT 0.0,
        direct_referrals_count INTEGER DEFAULT 0,
        total_network_size INTEGER DEFAULT 0,
        network_depth INTEGER DEFAULT 0
    );

    -- Create MLM Commissions table
    CREATE TABLE IF NOT EXISTS mlm_commissions (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        source_partner_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        commission_type VARCHAR(50) NOT NULL,
        level INTEGER NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        reference_transaction_id INTEGER,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        is_paid BOOLEAN DEFAULT FALSE
    );

    -- Create Referral Activities table
    CREATE TABLE IF NOT EXISTS referral_activities (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        referred_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        activity_type VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) DEFAULT 0.0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_mlm_partners_user_id ON mlm_partners(user_id);
    CREATE INDEX IF NOT EXISTS idx_mlm_partners_sponsor_id ON mlm_partners(sponsor_id);
    CREATE INDEX IF NOT EXISTS idx_mlm_partners_referral_code ON mlm_partners(referral_code);
    CREATE INDEX IF NOT EXISTS idx_mlm_commissions_partner_id ON mlm_commissions(partner_id);
    CREATE INDEX IF NOT EXISTS idx_mlm_commissions_source_partner_id ON mlm_commissions(source_partner_id);
    CREATE INDEX IF NOT EXISTS idx_referral_activities_referrer_id ON referral_activities(referrer_id);
    CREATE INDEX IF NOT EXISTS idx_referral_activities_referred_id ON referral_activities(referred_id);
    """
    
    try:
        with engine.connect() as connection:
            # Execute the SQL statements
            for statement in create_tables_sql.split(';'):
                if statement.strip():
                    connection.execute(text(statement))
            connection.commit()
            
        print("✅ MLM tables created successfully!")
        
        # Insert sample data
        insert_sample_data(engine)
        
    except Exception as e:
        print(f"❌ Error creating MLM tables: {e}")
        return False
    
    return True

def insert_sample_data(engine):
    """Insert sample MLM data"""
    
    sample_data_sql = """
    -- Insert sample MLM partners (assuming users with IDs 1-10 exist)
    INSERT INTO mlm_partners (user_id, referral_code, sponsor_id, level, total_earnings, monthly_commission, direct_referrals_count, total_network_size, network_depth)
    VALUES 
        (1, 'SJ2025001', NULL, 'Diamond Partner', 287650.00, 15420.00, 24, 187, 4),
        (2, 'MC2025002', 1, 'Gold Partner', 195430.00, 11280.00, 18, 143, 3),
        (3, 'ED2025003', 1, 'Silver Partner', 98760.00, 6890.00, 12, 67, 2),
        (4, 'JW2025004', 2, 'Bronze Partner', 42130.00, 3450.00, 8, 34, 2),
        (5, 'AK2025005', 2, 'Silver Partner', 65890.00, 4890.00, 12, 45, 2)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert sample referral activities
    INSERT INTO referral_activities (referrer_id, referred_id, activity_type, amount, description)
    VALUES 
        (1, 2, 'Direct Referral', 500.00, 'New partner referral bonus'),
        (2, 4, 'Direct Referral', 500.00, 'New partner referral bonus'),
        (1, 3, 'Level 2 Bonus', 250.00, 'Second level referral bonus')
    ON CONFLICT DO NOTHING;

    -- Insert sample commissions
    INSERT INTO mlm_commissions (partner_id, source_partner_id, commission_type, level, amount, percentage, description)
    VALUES 
        (1, 2, 'Direct Referral', 1, 1500.00, 15.00, 'Direct referral commission'),
        (1, 4, 'Level Bonus', 2, 700.00, 7.00, 'Level 2 commission'),
        (2, 4, 'Direct Referral', 1, 1200.00, 15.00, 'Direct referral commission')
    ON CONFLICT DO NOTHING;
    """
    
    try:
        with engine.connect() as connection:
            for statement in sample_data_sql.split(';'):
                if statement.strip():
                    connection.execute(text(statement))
            connection.commit()
            
        print("✅ Sample MLM data inserted successfully!")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not insert sample data: {e}")

if __name__ == "__main__":
    print("Creating MLM tables...")
    success = create_mlm_tables()
    
    if success:
        print("\n🎉 MLM system setup completed!")
        print("You can now use the MLM & Referral System features.")
    else:
        print("\n❌ MLM system setup failed!")
        sys.exit(1)
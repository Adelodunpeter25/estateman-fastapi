#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_advanced_mlm_tables():
    """Create advanced MLM commission tables"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    create_tables_sql = """
    -- Create Commission Rules table
    CREATE TABLE IF NOT EXISTS commission_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        commission_type VARCHAR(50) NOT NULL,
        level INTEGER NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        min_volume DECIMAL(12,2) DEFAULT 0.0,
        min_rank VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Commission Qualifications table
    CREATE TABLE IF NOT EXISTS commission_qualifications (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        rule_id INTEGER NOT NULL REFERENCES commission_rules(id),
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        volume_achieved DECIMAL(12,2) DEFAULT 0.0,
        status VARCHAR(50) DEFAULT 'Pending',
        qualified_at TIMESTAMP
    );

    -- Create Commission Payouts table
    CREATE TABLE IF NOT EXISTS commission_payouts (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES mlm_partners(id),
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        paid_at TIMESTAMP,
        notes TEXT
    );

    -- Create Commission Adjustments table
    CREATE TABLE IF NOT EXISTS commission_adjustments (
        id SERIAL PRIMARY KEY,
        commission_id INTEGER NOT NULL REFERENCES mlm_commissions(id),
        adjustment_type VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        reason TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_commission_rules_type ON commission_rules(commission_type);
    CREATE INDEX IF NOT EXISTS idx_commission_qualifications_partner ON commission_qualifications(partner_id);
    CREATE INDEX IF NOT EXISTS idx_commission_payouts_partner ON commission_payouts(partner_id);
    CREATE INDEX IF NOT EXISTS idx_commission_payouts_status ON commission_payouts(status);
    CREATE INDEX IF NOT EXISTS idx_commission_adjustments_commission ON commission_adjustments(commission_id);
    """
    
    try:
        with engine.connect() as connection:
            for statement in create_tables_sql.split(';'):
                if statement.strip():
                    connection.execute(text(statement))
            connection.commit()
            
        print("✅ Advanced MLM commission tables created successfully!")
        
        # Insert sample commission rules
        insert_sample_rules(engine)
        
    except Exception as e:
        print(f"❌ Error creating advanced MLM tables: {e}")
        return False
    
    return True

def insert_sample_rules(engine):
    """Insert sample commission rules"""
    
    sample_rules_sql = """
    INSERT INTO commission_rules (name, commission_type, level, percentage, min_volume, min_rank)
    VALUES 
        ('Direct Referral Bonus', 'Direct Referral', 1, 15.00, 0, 'Associate'),
        ('Level 2 Team Bonus', 'Level Bonus', 2, 7.00, 1000, 'Bronze Partner'),
        ('Level 3 Team Bonus', 'Level Bonus', 3, 3.00, 2000, 'Silver Partner'),
        ('Leadership Override', 'Leadership Override', 1, 5.00, 5000, 'Gold Partner'),
        ('Performance Bonus', 'Performance Bonus', 1, 10.00, 10000, 'Diamond Partner')
    ON CONFLICT DO NOTHING;
    """
    
    try:
        with engine.connect() as connection:
            connection.execute(text(sample_rules_sql))
            connection.commit()
            
        print("✅ Sample commission rules inserted successfully!")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not insert sample rules: {e}")

if __name__ == "__main__":
    print("Creating advanced MLM commission tables...")
    success = create_advanced_mlm_tables()
    
    if success:
        print("\n🎉 Advanced MLM commission system setup completed!")
        print("New features available:")
        print("- Commission rules management")
        print("- Commission simulation")
        print("- Payout management")
        print("- Commission reconciliation")
    else:
        print("\n❌ Advanced MLM setup failed!")
        sys.exit(1)
#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.marketing import DynamicAudienceRule, CampaignOptimization, CampaignMetrics, DripCampaignTemplate, DripCampaignStep

def create_enhanced_marketing_tables():
    """Create enhanced marketing tables for missing features"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL for creating enhanced marketing tables
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS dynamic_audience_rules (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            rule_type VARCHAR(50) NOT NULL,
            conditions JSONB,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS campaign_optimizations (
            id SERIAL PRIMARY KEY,
            campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
            optimization_type VARCHAR(50) NOT NULL,
            recommendation TEXT NOT NULL,
            impact_score FLOAT DEFAULT 0.0,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            applied_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS campaign_metrics (
            id SERIAL PRIMARY KEY,
            campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            active_users INTEGER DEFAULT 0,
            bounce_rate FLOAT DEFAULT 0.0,
            engagement_rate FLOAT DEFAULT 0.0,
            conversion_rate FLOAT DEFAULT 0.0
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS drip_campaign_templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            trigger_event VARCHAR(100) NOT NULL,
            total_steps INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS drip_campaign_steps (
            id SERIAL PRIMARY KEY,
            template_id INTEGER NOT NULL REFERENCES drip_campaign_templates(id) ON DELETE CASCADE,
            step_number INTEGER NOT NULL,
            delay_days INTEGER DEFAULT 0,
            delay_hours INTEGER DEFAULT 0,
            subject VARCHAR(255),
            content JSONB,
            campaign_type VARCHAR(20) DEFAULT 'email'
        );
        """,
        
        # Create indexes for better performance
        "CREATE INDEX IF NOT EXISTS idx_dynamic_audience_rules_active ON dynamic_audience_rules(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_campaign_optimizations_campaign ON campaign_optimizations(campaign_id);",
        "CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_time ON campaign_metrics(campaign_id, timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_drip_templates_active ON drip_campaign_templates(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_drip_steps_template ON drip_campaign_steps(template_id, step_number);"
    ]
    
    try:
        with engine.connect() as connection:
            for sql in sql_commands:
                print(f"Executing: {sql.strip()[:50]}...")
                connection.execute(text(sql))
                connection.commit()
        
        print("✅ Enhanced marketing tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating enhanced marketing tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_enhanced_marketing_tables()
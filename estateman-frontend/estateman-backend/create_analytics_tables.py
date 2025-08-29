#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_analytics_tables():
    """Create analytics and reporting tables"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS analytics_events (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            session_id VARCHAR(255),
            event_type VARCHAR(50) NOT NULL,
            event_name VARCHAR(255) NOT NULL,
            properties JSONB,
            page_url VARCHAR(500),
            referrer VARCHAR(500),
            user_agent VARCHAR(500),
            ip_address VARCHAR(45),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            processed BOOLEAN DEFAULT false
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id SERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            metric_category VARCHAR(50) NOT NULL,
            value FLOAT NOT NULL,
            target_value FLOAT,
            period_start TIMESTAMP WITH TIME ZONE NOT NULL,
            period_end TIMESTAMP WITH TIME ZONE NOT NULL,
            period_type VARCHAR(20) DEFAULT 'daily',
            calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            report_type VARCHAR(50) NOT NULL,
            filters JSONB,
            columns JSONB,
            schedule JSONB,
            is_active BOOLEAN DEFAULT true,
            is_scheduled BOOLEAN DEFAULT false,
            last_generated TIMESTAMP WITH TIME ZONE,
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS report_executions (
            id SERIAL PRIMARY KEY,
            report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            file_path VARCHAR(500),
            file_format VARCHAR(10) DEFAULT 'csv',
            file_size INTEGER,
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS business_insights (
            id SERIAL PRIMARY KEY,
            insight_type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            confidence_score FLOAT DEFAULT 0.0,
            impact_level VARCHAR(20) DEFAULT 'medium',
            data_source VARCHAR(100),
            supporting_data JSONB,
            is_active BOOLEAN DEFAULT true,
            is_dismissed BOOLEAN DEFAULT false,
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS prediction_models (
            id SERIAL PRIMARY KEY,
            model_name VARCHAR(100) NOT NULL,
            model_type VARCHAR(50) NOT NULL,
            features JSONB,
            parameters JSONB,
            accuracy_score FLOAT,
            is_active BOOLEAN DEFAULT true,
            last_trained TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS anomaly_detections (
            id SERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            expected_value FLOAT NOT NULL,
            actual_value FLOAT NOT NULL,
            deviation_score FLOAT NOT NULL,
            anomaly_type VARCHAR(50),
            severity VARCHAR(20) DEFAULT 'medium',
            description TEXT,
            is_resolved BOOLEAN DEFAULT false,
            detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Create indexes for better performance
        "CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time ON analytics_events(user_id, timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);",
        "CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);",
        "CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(metric_category);",
        "CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);",
        "CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);",
        "CREATE INDEX IF NOT EXISTS idx_reports_active ON reports(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_business_insights_active ON business_insights(is_active, is_dismissed);",
        "CREATE INDEX IF NOT EXISTS idx_anomaly_detections_resolved ON anomaly_detections(is_resolved);"
    ]
    
    try:
        with engine.connect() as connection:
            for sql in sql_commands:
                print(f"Executing: {sql.strip()[:50]}...")
                connection.execute(text(sql))
                connection.commit()
        
        print("✅ Analytics tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating analytics tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_analytics_tables()
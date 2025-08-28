#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_audit_tables():
    """Create audit and session tracking tables"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL for creating audit_logs table
    audit_logs_sql = """
    DROP TABLE IF EXISTS audit_logs CASCADE;
    CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        resource_id INTEGER,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
    CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
    """
    
    # SQL for creating user_sessions table
    user_sessions_sql = """
    DROP TABLE IF EXISTS user_sessions CASCADE;
    CREATE TABLE user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
    );
    
    CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
    CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
    """
    
    try:
        with engine.connect() as connection:
            # Create audit_logs table
            connection.execute(text(audit_logs_sql))
            print("✅ Audit logs table created successfully!")
            
            # Create user_sessions table
            connection.execute(text(user_sessions_sql))
            print("✅ User sessions table created successfully!")
            
            connection.commit()
            
    except Exception as e:
        print(f"❌ Error creating audit tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_audit_tables()
    if success:
        print("🎉 All audit tables created successfully!")
    else:
        print("💥 Failed to create audit tables!")
        sys.exit(1)
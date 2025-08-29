#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def create_tenant_tables():
    """Create tenant-related tables"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL commands to create tenant tables
    create_commands = [
        """
        CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            subdomain VARCHAR(100) UNIQUE NOT NULL,
            custom_domain VARCHAR(255) UNIQUE,
            contact_email VARCHAR(255) NOT NULL,
            contact_phone VARCHAR(20),
            is_active BOOLEAN DEFAULT TRUE,
            subscription_plan VARCHAR(50) DEFAULT 'basic',
            max_users INTEGER DEFAULT 10,
            max_properties INTEGER DEFAULT 100,
            settings JSON DEFAULT '{}',
            branding JSON DEFAULT '{}',
            billing_email VARCHAR(255),
            billing_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            trial_ends_at TIMESTAMP WITH TIME ZONE,
            subscription_ends_at TIMESTAMP WITH TIME ZONE
        )
        """,
        
        """
        CREATE TABLE IF NOT EXISTS tenant_users (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            is_admin BOOLEAN DEFAULT FALSE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(tenant_id, user_id)
        )
        """,
        
        # Create indexes
        "CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain)",
        "CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain)",
        "CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id)",
        "CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id)"
    ]
    
    try:
        with engine.connect() as connection:
            print("Creating tenant tables...")
            
            for i, command in enumerate(create_commands, 1):
                try:
                    print(f"Executing step {i}/{len(create_commands)}...")
                    connection.execute(text(command))
                    connection.commit()
                    print(f"✓ Step {i} completed successfully")
                except ProgrammingError as e:
                    if "already exists" in str(e):
                        print(f"⚠ Step {i} skipped (already exists)")
                    else:
                        print(f"✗ Step {i} failed: {e}")
                        raise
                except Exception as e:
                    print(f"✗ Step {i} failed: {e}")
                    raise
            
            print("\n✅ Tenant tables created successfully!")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_tenant_tables()
    sys.exit(0 if success else 1)
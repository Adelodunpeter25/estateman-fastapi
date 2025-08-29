#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def migrate_events_table():
    """Add missing columns to existing events table"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL commands to add missing columns
    migration_commands = [
        # Add recurrence columns
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) DEFAULT 'NONE'",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id INTEGER REFERENCES events(id)",
        
        # Add calendar integration columns
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS google_calendar_id VARCHAR(500)",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS outlook_calendar_id VARCHAR(500)",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE",
        
        # Add resources column
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS resources_needed JSON",
        
        # Create enum type for recurrence_type if it doesn't exist
        """
        DO $$ BEGIN
            CREATE TYPE recurrencetype AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """,
        
        # Update recurrence_type column to use enum
        "ALTER TABLE events ALTER COLUMN recurrence_type DROP DEFAULT",
        "ALTER TABLE events ALTER COLUMN recurrence_type TYPE recurrencetype USING recurrence_type::recurrencetype",
        "ALTER TABLE events ALTER COLUMN recurrence_type SET DEFAULT 'NONE'"
    ]
    
    try:
        with engine.connect() as connection:
            print("Starting events table migration...")
            
            for i, command in enumerate(migration_commands, 1):
                try:
                    print(f"Executing migration step {i}/{len(migration_commands)}...")
                    connection.execute(text(command))
                    connection.commit()
                    print(f"✓ Step {i} completed successfully")
                except ProgrammingError as e:
                    if "already exists" in str(e) or "duplicate" in str(e):
                        print(f"⚠ Step {i} skipped (already exists)")
                    else:
                        print(f"✗ Step {i} failed: {e}")
                        raise
                except Exception as e:
                    print(f"✗ Step {i} failed: {e}")
                    raise
            
            print("\n✅ Events table migration completed successfully!")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = migrate_events_table()
    sys.exit(0 if success else 1)
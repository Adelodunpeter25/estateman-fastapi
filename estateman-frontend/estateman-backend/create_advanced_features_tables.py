#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.core.database import Base
from app.models.task import Project, Task
from app.models.event import Event, EventAttendee
from app.models.notification import Notification, NotificationPreference
from app.core.config import settings

def create_advanced_features_tables():
    """Create tables for advanced features: tasks, events, notifications"""
    
    # Create database engine
    database_url = settings.DATABASE_URL
    engine = create_engine(database_url)
    
    print("Creating advanced features tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine, tables=[
            Project.__table__,
            Task.__table__,
            Event.__table__,
            EventAttendee.__table__,
            Notification.__table__,
            NotificationPreference.__table__
        ])
        
        print("✅ Advanced features tables created successfully!")
        print("Created tables:")
        print("  - projects")
        print("  - tasks") 
        print("  - events")
        print("  - event_attendees")
        print("  - notifications")
        print("  - notification_preferences")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_advanced_features_tables()
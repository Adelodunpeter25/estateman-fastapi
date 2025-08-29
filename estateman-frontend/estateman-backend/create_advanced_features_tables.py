#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.models.task import TaskDependency, TaskTimeLog, TaskComment, ProjectMember
from app.models.event import Resource, ResourceBooking, UserAvailability
from app.models.integration import Integration, IntegrationLog, WebhookEvent, APIRateLimit, DataSync

def create_advanced_features_tables():
    """Create tables for advanced features: enhanced tasks, events, and integrations"""
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    print("Creating advanced features tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Advanced features tables created successfully!")
        
        print("✅ Tables created without sample data!")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_advanced_features_tables()
    if success:
        print("\n🎉 Advanced features setup completed successfully!")
        print("\nNew features available:")
        print("- Enhanced task management with dependencies and time tracking")
        print("- Resource booking system for events")
        print("- Third-party integrations framework")
        print("- Real-time WebSocket notifications")
        print("- Kanban board and Gantt chart support")
    else:
        print("\n💥 Setup failed. Please check the error messages above.")
        sys.exit(1)
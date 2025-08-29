#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.core.database import Base
from app.models.task import Project, Task
from app.models.event import Event, EventAttendee
from app.models.notification import Notification, NotificationPreference
from app.models.gamification import (
    Achievement, Badge, UserAchievement, LoyaltyMember, PointTransaction,
    Reward, RewardRedemption, Challenge, ChallengeParticipation,
    Leaderboard, LeaderboardEntry
)
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
            NotificationPreference.__table__,
            Badge.__table__,
            Achievement.__table__,
            UserAchievement.__table__,
            LoyaltyMember.__table__,
            PointTransaction.__table__,
            Reward.__table__,
            RewardRedemption.__table__,
            Challenge.__table__,
            ChallengeParticipation.__table__,
            Leaderboard.__table__,
            LeaderboardEntry.__table__
        ])
        
        print("✅ Advanced features tables created successfully!")
        print("Created tables:")
        print("  - projects")
        print("  - tasks") 
        print("  - events")
        print("  - event_attendees")
        print("  - notifications")
        print("  - notification_preferences")
        print("  - badges")
        print("  - achievements")
        print("  - user_achievements")
        print("  - loyalty_members")
        print("  - point_transactions")
        print("  - rewards")
        print("  - reward_redemptions")
        print("  - challenges")
        print("  - challenge_participations")
        print("  - leaderboards")
        print("  - leaderboard_entries")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_advanced_features_tables()
#!/usr/bin/env python3

from app.core.database import SessionLocal, engine
from app.models.newsletter import Newsletter, EmailTemplate, Subscriber, NewsletterAnalytics, EmailSequence, SequenceEmail
from app.core.database import Base

def create_newsletter_tables():
    """Create newsletter-related database tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine, tables=[
            Newsletter.__table__,
            EmailTemplate.__table__,
            Subscriber.__table__,
            NewsletterAnalytics.__table__,
            EmailSequence.__table__,
            SequenceEmail.__table__
        ])
        
        print("✅ Newsletter tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating newsletter tables: {e}")

if __name__ == "__main__":
    create_newsletter_tables()
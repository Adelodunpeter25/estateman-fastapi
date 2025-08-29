#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.models.realtor import (
    Transaction, TransactionMilestone, TransactionDocument,
    InstallmentPlan, InstallmentPayment, CommissionDispute
)

def create_transaction_tables():
    """Create transaction-related tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Transaction tables created successfully!")
        
        # Add some sample data
        print("✅ Transaction tables structure created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating transaction tables: {e}")
        return False
    
    return True

def add_sample_milestones():
    """Add sample milestones for existing transactions"""
    print("ℹ️  Skipping sample milestone creation - use API to create milestones")

def add_sample_installment_plans():
    """Add sample installment plans"""
    print("ℹ️  Skipping sample installment plan creation - use API to create plans")

if __name__ == "__main__":
    print("🚀 Creating transaction management tables...")
    
    if create_transaction_tables():
        print("\nℹ️  Database schema ready - use API endpoints to create data")
        
        print("\n✅ Transaction management system setup complete!")
        print("\nNew features available:")
        print("- Enhanced transaction lifecycle management")
        print("- Transaction milestone tracking")
        print("- Document management")
        print("- Installment payment plans")
        print("- Payment notifications and reminders")
        print("- Commission dispute management")
        print("- Commission forecasting and tax forms")
        
        print("\nAPI Endpoints:")
        print("- GET /api/v1/transactions/ - List transactions")
        print("- POST /api/v1/transactions/ - Create transaction")
        print("- GET /api/v1/transactions/{id}/timeline - Transaction milestones")
        print("- POST /api/v1/transactions/{id}/installment-plans - Create payment plan")
        print("- GET /api/v1/transactions/payments/overdue - Overdue payments")
        print("- POST /api/v1/transactions/payments/notifications/send-reminders - Send reminders")
        
    else:
        print("❌ Setup failed!")
        sys.exit(1)
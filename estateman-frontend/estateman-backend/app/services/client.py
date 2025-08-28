from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.models.client import (
    Client, Lead, ClientInteraction, LoyaltyTransaction, 
    LeadSource, ClientSegment, ClientStatus, LeadStatus, LeadTemperature
)
from app.schemas.client import (
    ClientCreate, ClientUpdate, LeadCreate, LeadUpdate,
    InteractionCreate, LoyaltyTransactionCreate
)

class ClientService:
    def __init__(self, db: Session):
        self.db = db

    def create_client(self, client_data: ClientCreate) -> Client:
        client = Client(
            client_id=f"C{str(uuid.uuid4())[:8].upper()}",
            **client_data.dict()
        )
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        
        # Calculate initial lead score
        self._update_lead_score(client.id)
        return client

    def get_client(self, client_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_clients(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[ClientStatus] = None,
        assigned_agent_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[Client]:
        query = self.db.query(Client)
        
        if status:
            query = query.filter(Client.status == status)
        if assigned_agent_id:
            query = query.filter(Client.assigned_agent_id == assigned_agent_id)
        if search:
            search_filter = or_(
                Client.first_name.ilike(f"%{search}%"),
                Client.last_name.ilike(f"%{search}%"),
                Client.email.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
            
        return query.offset(skip).limit(limit).all()

    def update_client(self, client_id: int, client_data: ClientUpdate) -> Optional[Client]:
        client = self.get_client(client_id)
        if not client:
            return None
            
        for field, value in client_data.dict(exclude_unset=True).items():
            setattr(client, field, value)
        
        client.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(client)
        
        # Recalculate lead score if relevant fields changed
        self._update_lead_score(client_id)
        return client

    def delete_client(self, client_id: int) -> bool:
        client = self.get_client(client_id)
        if not client:
            return False
        self.db.delete(client)
        self.db.commit()
        return True

    def _update_lead_score(self, client_id: int):
        """Calculate and update lead score based on various factors"""
        client = self.get_client(client_id)
        if not client:
            return
            
        score = 0
        
        # Basic information completeness (0-20 points)
        if client.phone: score += 5
        if client.budget_min and client.budget_max: score += 10
        if client.preferred_location: score += 5
        
        # Engagement level (0-30 points)
        recent_interactions = self.db.query(ClientInteraction).filter(
            and_(
                ClientInteraction.client_id == client_id,
                ClientInteraction.created_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).count()
        score += min(recent_interactions * 5, 30)
        
        # Lead source quality (0-20 points)
        source_scores = {
            "referral": 20, "website": 15, "social_media": 10,
            "google_ads": 12, "walk_in": 8, "cold_call": 5
        }
        score += source_scores.get(client.lead_source, 0)
        
        # Budget range (0-30 points)
        if client.budget_max:
            if client.budget_max >= 1000000: score += 30
            elif client.budget_max >= 500000: score += 20
            elif client.budget_max >= 250000: score += 10
            else: score += 5
        
        client.lead_score = min(score, 100)
        
        # Update engagement level
        if score >= 80: client.engagement_level = "high"
        elif score >= 50: client.engagement_level = "medium"
        else: client.engagement_level = "low"
        
        self.db.commit()

    def get_client_analytics(self) -> Dict[str, Any]:
        total_clients = self.db.query(Client).count()
        active_clients = self.db.query(Client).filter(Client.status == ClientStatus.ACTIVE).count()
        leads_count = self.db.query(Client).filter(Client.status == ClientStatus.LEAD).count()
        
        avg_score = self.db.query(func.avg(Client.lead_score)).scalar() or 0
        total_points = self.db.query(func.sum(Client.loyalty_points)).scalar() or 0
        
        conversion_rate = (active_clients / total_clients * 100) if total_clients > 0 else 0
        
        # Top lead sources
        top_sources = self.db.query(
            Client.lead_source,
            func.count(Client.id).label('count')
        ).filter(Client.lead_source.isnot(None)).group_by(Client.lead_source).order_by(desc('count')).limit(5).all()
        
        return {
            "total_clients": total_clients,
            "active_clients": active_clients,
            "leads_count": leads_count,
            "conversion_rate": round(conversion_rate, 2),
            "average_lead_score": round(avg_score, 1),
            "total_loyalty_points": total_points,
            "top_lead_sources": [{"source": s[0], "count": s[1]} for s in top_sources]
        }

class LeadService:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, lead_data: LeadCreate) -> Lead:
        lead = Lead(
            lead_id=f"L{str(uuid.uuid4())[:8].upper()}",
            **lead_data.dict()
        )
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead(self, lead_id: int) -> Optional[Lead]:
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def get_leads(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[LeadStatus] = None,
        temperature: Optional[LeadTemperature] = None,
        assigned_agent_id: Optional[int] = None
    ) -> List[Lead]:
        query = self.db.query(Lead)
        
        if status:
            query = query.filter(Lead.status == status)
        if temperature:
            query = query.filter(Lead.temperature == temperature)
        if assigned_agent_id:
            query = query.filter(Lead.assigned_agent_id == assigned_agent_id)
            
        return query.offset(skip).limit(limit).all()

    def update_lead(self, lead_id: int, lead_data: LeadUpdate) -> Optional[Lead]:
        lead = self.get_lead(lead_id)
        if not lead:
            return None
            
        for field, value in lead_data.dict(exclude_unset=True).items():
            setattr(lead, field, value)
        
        lead.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_lead_pipeline(self) -> List[Dict[str, Any]]:
        pipeline = self.db.query(
            Lead.status,
            func.count(Lead.id).label('count'),
            func.sum(Lead.estimated_value).label('value')
        ).group_by(Lead.status).all()
        
        return [
            {
                "stage": stage.value,
                "count": count,
                "value": float(value or 0)
            }
            for stage, count, value in pipeline
        ]

class LoyaltyService:
    def __init__(self, db: Session):
        self.db = db

    def add_points(self, client_id: int, points: int, description: str, reference_type: str = None, reference_id: str = None):
        transaction = LoyaltyTransaction(
            client_id=client_id,
            type="earned",
            points=points,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id,
            expires_at=datetime.utcnow() + timedelta(days=365)  # Points expire in 1 year
        )
        self.db.add(transaction)
        
        # Update client's total points
        client = self.db.query(Client).filter(Client.id == client_id).first()
        if client:
            client.loyalty_points += points
            self._update_loyalty_tier(client)
        
        self.db.commit()

    def redeem_points(self, client_id: int, points: int, description: str) -> bool:
        client = self.db.query(Client).filter(Client.id == client_id).first()
        if not client or client.loyalty_points < points:
            return False
        
        transaction = LoyaltyTransaction(
            client_id=client_id,
            type="redeemed",
            points=-points,
            description=description
        )
        self.db.add(transaction)
        
        client.loyalty_points -= points
        self._update_loyalty_tier(client)
        self.db.commit()
        return True

    def _update_loyalty_tier(self, client: Client):
        """Update client's loyalty tier based on total points"""
        if client.loyalty_points >= 10000:
            client.loyalty_tier = "platinum"
        elif client.loyalty_points >= 5000:
            client.loyalty_tier = "gold"
        elif client.loyalty_points >= 2000:
            client.loyalty_tier = "silver"
        else:
            client.loyalty_tier = "bronze"

    def get_loyalty_transactions(self, client_id: int) -> List[LoyaltyTransaction]:
        return self.db.query(LoyaltyTransaction).filter(
            LoyaltyTransaction.client_id == client_id
        ).order_by(desc(LoyaltyTransaction.created_at)).all()

class CommunicationService:
    def __init__(self, db: Session):
        self.db = db

    def create_interaction(self, interaction_data: InteractionCreate) -> ClientInteraction:
        interaction = ClientInteraction(**interaction_data.dict())
        self.db.add(interaction)
        
        # Update client's last contact date
        client = self.db.query(Client).filter(Client.id == interaction_data.client_id).first()
        if client:
            client.last_contact_date = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def get_client_interactions(self, client_id: int) -> List[ClientInteraction]:
        return self.db.query(ClientInteraction).filter(
            ClientInteraction.client_id == client_id
        ).order_by(desc(ClientInteraction.created_at)).all()

    def get_interaction_timeline(self, client_id: int) -> List[Dict[str, Any]]:
        interactions = self.get_client_interactions(client_id)
        return [
            {
                "id": i.id,
                "type": i.type.value,
                "subject": i.subject,
                "content": i.content,
                "agent_id": i.agent_id,
                "created_at": i.created_at,
                "completed_at": i.completed_at,
                "outcome": i.outcome
            }
            for i in interactions
        ]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.client import ClientStatus, LeadStatus, LeadTemperature
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse,
    LeadCreate, LeadUpdate, LeadResponse,
    InteractionCreate, InteractionResponse,
    LoyaltyTransactionCreate, LoyaltyTransactionResponse,
    ClientAnalytics, LeadPipeline
)
from app.services.client import ClientService, LeadService, LoyaltyService, CommunicationService, RewardService

router = APIRouter()

# Client endpoints
@router.post("/", response_model=ClientResponse)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    return service.create_client(client_data)

@router.get("/", response_model=List[ClientResponse])
def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ClientStatus] = None,
    assigned_agent_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    clients = service.get_clients(skip, limit, status, assigned_agent_id, search)
    return clients or []

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    client = service.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    client = service.update_client(client_id, client_data)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    if not service.delete_client(client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

@router.get("/analytics/overview", response_model=ClientAnalytics)
def get_client_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ClientService(db)
    return service.get_client_analytics()

# Lead endpoints
@router.post("/leads/", response_model=LeadResponse)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeadService(db)
    return service.create_lead(lead_data)

@router.get("/leads/", response_model=List[LeadResponse])
def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[LeadStatus] = None,
    temperature: Optional[LeadTemperature] = None,
    assigned_agent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeadService(db)
    leads = service.get_leads(skip, limit, status, temperature, assigned_agent_id)
    return leads or []

@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeadService(db)
    lead = service.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/leads/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeadService(db)
    lead = service.update_lead(lead_id, lead_data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.get("/leads/analytics/pipeline", response_model=List[LeadPipeline])
def get_lead_pipeline(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeadService(db)
    return service.get_lead_pipeline()

# Interaction endpoints
@router.post("/{client_id}/interactions/", response_model=InteractionResponse)
def create_interaction(
    client_id: int,
    interaction_data: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interaction_data.client_id = client_id
    interaction_data.agent_id = current_user.id
    service = CommunicationService(db)
    return service.create_interaction(interaction_data)

@router.get("/{client_id}/interactions/", response_model=List[InteractionResponse])
def get_client_interactions(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    interactions = service.get_client_interactions(client_id)
    return interactions or []

@router.get("/{client_id}/timeline/")
def get_client_timeline(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    return service.get_interaction_timeline(client_id)

# Loyalty endpoints
@router.post("/{client_id}/loyalty/add-points/")
def add_loyalty_points(
    client_id: int,
    points: int,
    description: str,
    reference_type: Optional[str] = None,
    reference_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LoyaltyService(db)
    service.add_points(client_id, points, description, reference_type, reference_id)
    return {"message": f"Added {points} points to client"}

@router.post("/{client_id}/loyalty/redeem-points/")
def redeem_loyalty_points(
    client_id: int,
    points: int,
    description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LoyaltyService(db)
    if not service.redeem_points(client_id, points, description):
        return {"message": "Unable to redeem points - either insufficient points available or client does not exist"}
    return {"message": f"Successfully redeemed {points} points for client"}

@router.get("/{client_id}/loyalty/transactions/", response_model=List[LoyaltyTransactionResponse])
def get_loyalty_transactions(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LoyaltyService(db)
    transactions = service.get_loyalty_transactions(client_id)
    return transactions or []

# Duplicate Detection endpoints
@router.get("/duplicates/detect")
def detect_duplicates(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    duplicates = service.detect_duplicates(email, phone)
    return {"duplicates": duplicates}

@router.post("/duplicates/merge")
def merge_clients(
    primary_id: int,
    duplicate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    success = service.merge_clients(primary_id, duplicate_id, current_user.id)
    if not success:
        return {"message": "Failed to merge clients"}
    return {"message": "Clients merged successfully"}

# Communication endpoints
@router.post("/{client_id}/send-email")
def send_email(
    client_id: int,
    template_id: int,
    agent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    result = service.send_email(client_id, template_id, {"agent_id": agent_id or current_user.id})
    return result

@router.post("/{client_id}/send-sms")
def send_sms(
    client_id: int,
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    result = service.send_sms(client_id, message, current_user.id)
    return result

@router.get("/templates/")
def get_templates(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    templates = service.get_templates(type)
    return {"templates": templates}

@router.post("/templates/")
def create_template(
    name: str,
    type: str,
    subject: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    template = service.create_template({
        "name": name,
        "type": type,
        "subject": subject,
        "content": content
    })
    return template

@router.post("/campaigns/")
def create_campaign(
    name: str,
    type: str,
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    campaign = service.create_campaign({
        "name": name,
        "type": type,
        "template_id": template_id
    })
    return campaign

@router.post("/campaigns/{campaign_id}/send")
def send_bulk_communication(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CommunicationService(db)
    result = service.send_bulk_communication(campaign_id)
    return result

# Reward Catalog endpoints
@router.get("/rewards/")
def get_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    rewards = service.get_rewards()
    return {"rewards": rewards}

@router.post("/rewards/")
def create_reward(
    name: str,
    description: str,
    points_required: int,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    reward = service.create_reward({
        "name": name,
        "description": description,
        "points_required": points_required,
        "category": category
    })
    return reward

@router.post("/{client_id}/rewards/{reward_id}/redeem")
def redeem_reward(
    client_id: int,
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    result = service.redeem_reward(client_id, reward_id)
    return result
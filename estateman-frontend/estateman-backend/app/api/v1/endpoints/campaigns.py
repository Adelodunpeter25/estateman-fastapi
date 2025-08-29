from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.marketing import Campaign
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from datetime import datetime

router = APIRouter()

@router.post("/realtors/{realtor_id}/marketing/campaigns", response_model=CampaignResponse)
def create_campaign(
    realtor_id: int,
    campaign: CampaignCreate,
    db: Session = Depends(get_db)
):
    """Create a new marketing campaign for a realtor"""
    db_campaign = Campaign(
        realtor_id=realtor_id,
        name=campaign.name,
        type=campaign.type,
        target_audience=campaign.target_audience,
        message=campaign.message,
        schedule_date=campaign.schedule_date,
        status="draft",
        created_at=datetime.utcnow()
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.get("/realtors/{realtor_id}/marketing/campaigns", response_model=List[CampaignResponse])
def get_realtor_campaigns(
    realtor_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all campaigns for a realtor"""
    campaigns = db.query(Campaign).filter(
        Campaign.realtor_id == realtor_id
    ).offset(skip).limit(limit).all()
    return campaigns

@router.get("/realtors/{realtor_id}/marketing/campaigns/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    realtor_id: int,
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.realtor_id == realtor_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/realtors/{realtor_id}/marketing/campaigns/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    realtor_id: int,
    campaign_id: int,
    campaign_update: CampaignUpdate,
    db: Session = Depends(get_db)
):
    """Update a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.realtor_id == realtor_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    update_data = campaign_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    campaign.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/realtors/{realtor_id}/marketing/campaigns/{campaign_id}")
def delete_campaign(
    realtor_id: int,
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Delete a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.realtor_id == realtor_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}
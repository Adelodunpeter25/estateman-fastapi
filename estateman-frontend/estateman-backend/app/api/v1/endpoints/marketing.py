from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.marketing import CampaignStatus
from ....schemas.marketing import (
    CampaignCreate, CampaignUpdate, CampaignResponse,
    CampaignTemplateCreate, CampaignTemplateResponse,
    MarketingMaterialCreate, MarketingMaterialResponse,
    CampaignStatsResponse, CampaignAnalyticsResponse,
    ABTestCreate, ABTestResponse,
    CampaignAutomationCreate, CampaignAutomationResponse,
    AutomationStepCreate, AutomationStepResponse
)
from ....services.marketing import MarketingService, CampaignTemplateService, MarketingMaterialService, ABTestService, CampaignAutomationService

router = APIRouter()

# Campaign endpoints
@router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    campaign = service.create_campaign(campaign_data, current_user.id)
    if not campaign:
        raise HTTPException(status_code=400, detail="Failed to create campaign")
    return campaign

@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[CampaignStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    return service.get_campaigns(skip, limit, status, current_user.id)

@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    campaign = service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    updated_campaign = service.update_campaign(campaign_id, campaign_data)
    if not updated_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated_campaign

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    if not service.delete_campaign(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}

@router.get("/campaigns/{campaign_id}/analytics", response_model=List[CampaignAnalyticsResponse])
async def get_campaign_analytics(
    campaign_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    campaign = service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return service.get_campaign_analytics(campaign_id, days)

@router.get("/stats", response_model=CampaignStatsResponse)
async def get_campaign_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingService(db)
    return service.get_campaign_stats()

# Template endpoints
@router.post("/templates", response_model=CampaignTemplateResponse)
async def create_template(
    template_data: CampaignTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignTemplateService(db)
    return service.create_template(template_data)

@router.get("/templates", response_model=List[CampaignTemplateResponse])
async def get_templates(
    campaign_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignTemplateService(db)
    templates = service.get_templates(campaign_type)
    return templates

# Material endpoints
@router.post("/materials", response_model=MarketingMaterialResponse)
async def create_material(
    material_data: MarketingMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingMaterialService(db)
    return service.create_material(material_data, current_user.id)

@router.get("/materials", response_model=List[MarketingMaterialResponse])
async def get_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingMaterialService(db)
    return service.get_materials(skip, limit, category)

@router.get("/materials/{material_id}", response_model=MarketingMaterialResponse)
async def get_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingMaterialService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.post("/materials/{material_id}/download")
async def download_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingMaterialService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    service.increment_download(material_id)
    return {"message": "Download recorded"}

@router.post("/materials/{material_id}/view")
async def view_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MarketingMaterialService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    service.increment_view(material_id)
    return {"message": "View recorded"}

# A/B Testing endpoints
@router.post("/ab-tests", response_model=ABTestResponse)
async def create_ab_test(
    ab_test_data: ABTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ABTestService(db)
    return service.create_ab_test(ab_test_data)

@router.get("/ab-tests", response_model=List[ABTestResponse])
async def get_ab_tests(
    campaign_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ABTestService(db)
    return service.get_ab_tests(campaign_id)

@router.get("/ab-tests/{ab_test_id}", response_model=ABTestResponse)
async def get_ab_test(
    ab_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ABTestService(db)
    ab_test = service.get_ab_test(ab_test_id)
    if not ab_test:
        raise HTTPException(status_code=404, detail="A/B Test not found")
    return ab_test

@router.post("/ab-tests/{ab_test_id}/start", response_model=ABTestResponse)
async def start_ab_test(
    ab_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ABTestService(db)
    return service.start_ab_test(ab_test_id)

@router.post("/ab-tests/{ab_test_id}/end", response_model=ABTestResponse)
async def end_ab_test(
    ab_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ABTestService(db)
    return service.end_ab_test(ab_test_id)

# Campaign Automation endpoints
@router.post("/automations", response_model=CampaignAutomationResponse)
async def create_automation(
    automation_data: CampaignAutomationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignAutomationService(db)
    return service.create_automation(automation_data)

@router.get("/automations", response_model=List[CampaignAutomationResponse])
async def get_automations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignAutomationService(db)
    return service.get_automations(skip, limit)

@router.get("/automations/{automation_id}", response_model=CampaignAutomationResponse)
async def get_automation(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignAutomationService(db)
    automation = service.get_automation(automation_id)
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

@router.post("/automations/steps", response_model=AutomationStepResponse)
async def add_automation_step(
    step_data: AutomationStepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignAutomationService(db)
    return service.add_automation_step(step_data)

@router.get("/automations/{automation_id}/steps", response_model=List[AutomationStepResponse])
async def get_automation_steps(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CampaignAutomationService(db)
    return service.get_automation_steps(automation_id)

@router.post("/materials/upload", response_model=MarketingMaterialResponse)
async def upload_material(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(""),
    category: str = Form("General"),
    tags: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/marketing")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Parse tags
    tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    # Create material record
    material_data = MarketingMaterialCreate(
        name=name,
        description=description or None,
        category=category,
        file_type=file.content_type or "application/octet-stream",
        file_url=f"/uploads/marketing/{unique_filename}",
        file_size=len(content),
        tags=tag_list
    )
    
    service = MarketingMaterialService(db)
    return service.create_material(material_data, current_user.id)
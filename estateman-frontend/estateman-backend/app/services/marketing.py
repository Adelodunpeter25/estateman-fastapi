from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..core.datetime_utils import utc_now, ensure_timezone_aware
from ..core.validation import sanitize_html, validate_id
from ..core.exceptions import NotFoundError, ValidationException
from ..models.marketing import Campaign, CampaignTemplate, CampaignAnalytics, MarketingMaterial, CampaignStatus, ABTest, CampaignAutomation, AutomationStep, DynamicAudienceRule, CampaignOptimization, CampaignMetrics, DripCampaignTemplate, DripCampaignStep
from ..schemas.marketing import CampaignCreate, CampaignUpdate, CampaignTemplateCreate, MarketingMaterialCreate, ABTestCreate, CampaignAutomationCreate, AutomationStepCreate, DynamicAudienceRuleCreate, DripCampaignTemplateCreate, DripCampaignStepCreate

class MarketingService:
    def __init__(self, db: Session):
        self.db = db

    def create_campaign(self, campaign_data: CampaignCreate, user_id: int) -> Campaign:
        campaign = Campaign(
            **campaign_data.dict(exclude={'template_id'}),
            created_by=user_id,
            template_id=campaign_data.template_id
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def get_campaigns(self, skip: int = 0, limit: int = 100, status: Optional[CampaignStatus] = None, user_id: Optional[int] = None) -> List[Campaign]:
        query = self.db.query(Campaign)
        if status:
            query = query.filter(Campaign.status == status)
        if user_id:
            query = query.filter(Campaign.created_by == user_id)
        return query.order_by(desc(Campaign.created_at)).offset(skip).limit(limit).all()

    def get_campaign(self, campaign_id: int) -> Optional[Campaign]:
        campaign_id = validate_id(campaign_id)
        return self.db.query(Campaign).filter(Campaign.id == campaign_id).first()

    def update_campaign(self, campaign_id: int, campaign_data: CampaignUpdate) -> Optional[Campaign]:
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            raise NotFoundError("Campaign")
        
        for field, value in campaign_data.dict(exclude_unset=True).items():
            if field == 'title' and value:
                value = sanitize_html(value)
            setattr(campaign, field, value)
        
        campaign.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def delete_campaign(self, campaign_id: int) -> bool:
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            return False
        self.db.delete(campaign)
        self.db.commit()
        return True

    def get_campaign_stats(self) -> Dict[str, Any]:
        active_campaigns = self.db.query(Campaign).filter(Campaign.status == CampaignStatus.ACTIVE).count()
        
        total_reach = self.db.query(func.sum(Campaign.total_reach)).scalar() or 0
        total_clicks = self.db.query(func.sum(Campaign.total_clicks)).scalar() or 0
        total_opens = self.db.query(func.sum(Campaign.total_opens)).scalar() or 0
        total_conversions = self.db.query(func.sum(Campaign.total_conversions)).scalar() or 0
        total_budget = self.db.query(func.sum(Campaign.budget)).scalar() or 0
        total_spent = self.db.query(func.sum(Campaign.spent)).scalar() or 0
        
        # Calculate engagement rate
        avg_engagement = (total_clicks / total_opens * 100) if total_opens > 0 else 0
        
        return {
            "active_campaigns": active_campaigns,
            "total_reach": total_reach,
            "avg_engagement": round(avg_engagement, 1),
            "leads_generated": total_conversions,
            "total_budget": total_budget,
            "total_spent": total_spent
        }

    def get_campaign_analytics(self, campaign_id: int, days: int = 30) -> List[CampaignAnalytics]:
        campaign_id = validate_id(campaign_id)
        start_date = utc_now() - timedelta(days=days)
        
        return self.db.query(CampaignAnalytics).filter(
            and_(
                CampaignAnalytics.campaign_id == campaign_id,
                CampaignAnalytics.date >= start_date
            )
        ).order_by(CampaignAnalytics.date).all()

class CampaignTemplateService:
    def __init__(self, db: Session):
        self.db = db

    def create_template(self, template_data: CampaignTemplateCreate) -> CampaignTemplate:
        template = CampaignTemplate(**template_data.dict())
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def get_templates(self, campaign_type: Optional[str] = None) -> List[CampaignTemplate]:
        query = self.db.query(CampaignTemplate).filter(CampaignTemplate.is_active == True)
        if campaign_type:
            query = query.filter(CampaignTemplate.campaign_type == campaign_type)
        return query.order_by(CampaignTemplate.name).all()

    def get_template(self, template_id: int) -> Optional[CampaignTemplate]:
        template_id = validate_id(template_id)
        return self.db.query(CampaignTemplate).filter(CampaignTemplate.id == template_id).first()

class MarketingMaterialService:
    def __init__(self, db: Session):
        self.db = db

    def create_material(self, material_data: MarketingMaterialCreate, user_id: int) -> MarketingMaterial:
        material = MarketingMaterial(
            **material_data.dict(),
            created_by=user_id
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def get_materials(self, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[MarketingMaterial]:
        query = self.db.query(MarketingMaterial).filter(MarketingMaterial.is_active == True)
        if category:
            query = query.filter(MarketingMaterial.category == category)
        return query.order_by(desc(MarketingMaterial.created_at)).offset(skip).limit(limit).all()

    def get_material(self, material_id: int) -> Optional[MarketingMaterial]:
        material_id = validate_id(material_id)
        return self.db.query(MarketingMaterial).filter(MarketingMaterial.id == material_id).first()

    def increment_download(self, material_id: int):
        material = self.get_material(material_id)
        if material:
            material.download_count += 1
            self.db.commit()

    def increment_view(self, material_id: int):
        material = self.get_material(material_id)
        if material:
            material.view_count += 1
            self.db.commit()

class ABTestService:
    def __init__(self, db: Session):
        self.db = db

    def create_ab_test(self, ab_test_data: ABTestCreate) -> ABTest:
        ab_test = ABTest(**ab_test_data.dict())
        self.db.add(ab_test)
        self.db.commit()
        self.db.refresh(ab_test)
        return ab_test

    def get_ab_tests(self, campaign_id: Optional[int] = None) -> List[ABTest]:
        query = self.db.query(ABTest)
        if campaign_id:
            query = query.filter(ABTest.campaign_id == campaign_id)
        return query.order_by(desc(ABTest.created_at)).all()

    def get_ab_test(self, ab_test_id: int) -> Optional[ABTest]:
        ab_test_id = validate_id(ab_test_id)
        return self.db.query(ABTest).filter(ABTest.id == ab_test_id).first()

    def start_ab_test(self, ab_test_id: int) -> ABTest:
        ab_test = self.get_ab_test(ab_test_id)
        if not ab_test:
            raise NotFoundError("A/B Test")
        
        ab_test.status = "running"
        ab_test.started_at = utc_now()
        self.db.commit()
        self.db.refresh(ab_test)
        return ab_test

    def end_ab_test(self, ab_test_id: int) -> ABTest:
        ab_test = self.get_ab_test(ab_test_id)
        if not ab_test:
            raise NotFoundError("A/B Test")
        
        # Determine winner
        if ab_test.variant_a_conversions > ab_test.variant_b_conversions:
            ab_test.winner = "variant_a"
        elif ab_test.variant_b_conversions > ab_test.variant_a_conversions:
            ab_test.winner = "variant_b"
        else:
            ab_test.winner = "inconclusive"
        
        ab_test.status = "completed"
        ab_test.ended_at = utc_now()
        self.db.commit()
        self.db.refresh(ab_test)
        return ab_test

class CampaignAutomationService:
    def __init__(self, db: Session):
        self.db = db

    def create_automation(self, automation_data: CampaignAutomationCreate) -> CampaignAutomation:
        automation = CampaignAutomation(**automation_data.dict())
        self.db.add(automation)
        self.db.commit()
        self.db.refresh(automation)
        return automation

    def get_automations(self, skip: int = 0, limit: int = 100) -> List[CampaignAutomation]:
        return self.db.query(CampaignAutomation).order_by(desc(CampaignAutomation.created_at)).offset(skip).limit(limit).all()

    def get_automation(self, automation_id: int) -> Optional[CampaignAutomation]:
        automation_id = validate_id(automation_id)
        return self.db.query(CampaignAutomation).filter(CampaignAutomation.id == automation_id).first()

    def add_automation_step(self, step_data: AutomationStepCreate) -> AutomationStep:
        step = AutomationStep(**step_data.dict())
        self.db.add(step)
        self.db.commit()
        self.db.refresh(step)
        return step

    def get_automation_steps(self, automation_id: int) -> List[AutomationStep]:
        return self.db.query(AutomationStep).filter(AutomationStep.automation_id == automation_id).order_by(AutomationStep.step_order).all()

class DynamicAudienceService:
    def __init__(self, db: Session):
        self.db = db

    def create_audience_rule(self, rule_data: DynamicAudienceRuleCreate) -> DynamicAudienceRule:
        rule = DynamicAudienceRule(**rule_data.dict())
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def get_audience_rules(self, skip: int = 0, limit: int = 100) -> List[DynamicAudienceRule]:
        return self.db.query(DynamicAudienceRule).filter(DynamicAudienceRule.is_active == True).offset(skip).limit(limit).all()

    def get_audience_rule(self, rule_id: int) -> Optional[DynamicAudienceRule]:
        rule_id = validate_id(rule_id)
        return self.db.query(DynamicAudienceRule).filter(DynamicAudienceRule.id == rule_id).first()

class CampaignOptimizationService:
    def __init__(self, db: Session):
        self.db = db

    def generate_optimizations(self, campaign_id: int) -> List[CampaignOptimization]:
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return []
        
        optimizations = []
        
        # Budget optimization
        if campaign.budget > 0 and campaign.spent > campaign.budget * 0.8:
            opt = CampaignOptimization(
                campaign_id=campaign_id,
                optimization_type="budget",
                recommendation="Budget utilization is high. Consider increasing budget or optimizing spend allocation",
                impact_score=85.0
            )
            optimizations.append(opt)
        
        # Performance optimization
        if campaign.total_opens > 0:
            click_rate = (campaign.total_clicks / campaign.total_opens) * 100
            if click_rate < 2.0:
                opt = CampaignOptimization(
                    campaign_id=campaign_id,
                    optimization_type="content",
                    recommendation="Click-through rate is below industry average. Consider A/B testing content variations",
                    impact_score=70.0
                )
                optimizations.append(opt)
        
        # Conversion optimization
        if campaign.total_clicks > 0:
            conversion_rate = (campaign.total_conversions / campaign.total_clicks) * 100
            if conversion_rate < 1.0:
                opt = CampaignOptimization(
                    campaign_id=campaign_id,
                    optimization_type="audience",
                    recommendation="Low conversion rate detected. Review audience targeting and landing page optimization",
                    impact_score=80.0
                )
                optimizations.append(opt)
        
        # Timing optimization
        if campaign.status == CampaignStatus.ACTIVE and campaign.total_reach < 100:
            opt = CampaignOptimization(
                campaign_id=campaign_id,
                optimization_type="timing",
                recommendation="Low reach detected. Consider adjusting campaign timing or increasing frequency",
                impact_score=60.0
            )
            optimizations.append(opt)
        
        for opt in optimizations:
            self.db.add(opt)
        
        self.db.commit()
        return optimizations

    def get_campaign_optimizations(self, campaign_id: int) -> List[CampaignOptimization]:
        return self.db.query(CampaignOptimization).filter(CampaignOptimization.campaign_id == campaign_id).all()

class CampaignMetricsService:
    def __init__(self, db: Session):
        self.db = db

    def record_real_time_metrics(self, campaign_id: int, metrics_data: Dict[str, Any]) -> CampaignMetrics:
        metrics = CampaignMetrics(
            campaign_id=campaign_id,
            active_users=metrics_data.get('active_users', 0),
            bounce_rate=metrics_data.get('bounce_rate', 0.0),
            engagement_rate=metrics_data.get('engagement_rate', 0.0),
            conversion_rate=metrics_data.get('conversion_rate', 0.0)
        )
        self.db.add(metrics)
        self.db.commit()
        self.db.refresh(metrics)
        return metrics

    def get_real_time_metrics(self, campaign_id: int, hours: int = 24) -> List[CampaignMetrics]:
        start_time = utc_now() - timedelta(hours=hours)
        return self.db.query(CampaignMetrics).filter(
            and_(
                CampaignMetrics.campaign_id == campaign_id,
                CampaignMetrics.timestamp >= start_time
            )
        ).order_by(CampaignMetrics.timestamp).all()

class DripCampaignService:
    def __init__(self, db: Session):
        self.db = db

    def create_drip_template(self, template_data: DripCampaignTemplateCreate) -> DripCampaignTemplate:
        template = DripCampaignTemplate(**template_data.dict())
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def add_drip_step(self, step_data: DripCampaignStepCreate) -> DripCampaignStep:
        step = DripCampaignStep(**step_data.dict())
        self.db.add(step)
        self.db.commit()
        self.db.refresh(step)
        return step

    def get_drip_templates(self, skip: int = 0, limit: int = 100) -> List[DripCampaignTemplate]:
        return self.db.query(DripCampaignTemplate).filter(DripCampaignTemplate.is_active == True).offset(skip).limit(limit).all()

    def get_drip_template_steps(self, template_id: int) -> List[DripCampaignStep]:
        return self.db.query(DripCampaignStep).filter(DripCampaignStep.template_id == template_id).order_by(DripCampaignStep.step_number).all()
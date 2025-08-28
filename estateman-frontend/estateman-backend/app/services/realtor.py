from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.models.realtor import Realtor, Commission, Transaction, RealtorLevel, RealtorStatus
from app.models.user import User
from app.schemas.realtor import RealtorCreate, RealtorUpdate, CommissionCreate, TransactionCreate

class RealtorService:
    def __init__(self, db: Session):
        self.db = db

    def create_realtor(self, realtor_data: RealtorCreate) -> Realtor:
        realtor = Realtor(
            realtor_id=f"R{str(uuid.uuid4())[:8].upper()}",
            **realtor_data.dict()
        )
        self.db.add(realtor)
        self.db.commit()
        self.db.refresh(realtor)
        return realtor

    def get_realtor(self, realtor_id: int) -> Optional[Realtor]:
        return self.db.query(Realtor).filter(Realtor.id == realtor_id).first()

    def get_realtors(
        self,
        skip: int = 0,
        limit: int = 100,
        level: Optional[RealtorLevel] = None,
        status: Optional[RealtorStatus] = None,
        search: Optional[str] = None
    ) -> List[Realtor]:
        query = self.db.query(Realtor).join(User)
        
        if level:
            query = query.filter(Realtor.level == level)
        if status:
            query = query.filter(Realtor.status == status)
        if search:
            search_filter = or_(
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                Realtor.realtor_id.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
            
        return query.offset(skip).limit(limit).all()

    def update_realtor(self, realtor_id: int, realtor_data: RealtorUpdate) -> Optional[Realtor]:
        realtor = self.get_realtor(realtor_id)
        if not realtor:
            return None
            
        for field, value in realtor_data.dict(exclude_unset=True).items():
            setattr(realtor, field, value)
        
        realtor.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(realtor)
        return realtor

    def delete_realtor(self, realtor_id: int) -> bool:
        realtor = self.get_realtor(realtor_id)
        if not realtor:
            return False
        self.db.delete(realtor)
        self.db.commit()
        return True

    def get_realtor_analytics(self) -> Dict[str, Any]:
        total_realtors = self.db.query(Realtor).count()
        active_realtors = self.db.query(Realtor).filter(Realtor.status == RealtorStatus.ACTIVE).count()
        
        total_commissions = self.db.query(func.sum(Realtor.total_commissions)).scalar() or 0
        avg_rating = self.db.query(func.avg(Realtor.rating)).scalar() or 0
        
        # Top performers
        top_performers = self.db.query(Realtor).join(User).order_by(desc(Realtor.total_commissions)).limit(5).all()
        
        return {
            "total_realtors": total_realtors,
            "active_realtors": active_realtors,
            "total_commissions": float(total_commissions),
            "average_rating": round(float(avg_rating), 1),
            "top_performers": [
                {
                    "id": r.id,
                    "name": f"{r.user.first_name} {r.user.last_name}",
                    "realtor_id": r.realtor_id,
                    "total_commissions": r.total_commissions,
                    "level": r.level.value
                }
                for r in top_performers
            ]
        }

    def get_realtor_performance(self, realtor_id: int) -> Dict[str, Any]:
        realtor = self.get_realtor(realtor_id)
        if not realtor:
            return {}
        
        # Monthly progress
        progress_percentage = (realtor.monthly_earned / realtor.monthly_target * 100) if realtor.monthly_target > 0 else 0
        
        # Recent commissions
        recent_commissions = self.db.query(Commission).filter(
            Commission.realtor_id == realtor_id
        ).order_by(desc(Commission.created_at)).limit(10).all()
        
        return {
            "realtor_id": realtor.realtor_id,
            "total_clients": realtor.total_clients,
            "active_deals": realtor.active_deals,
            "monthly_target": realtor.monthly_target,
            "monthly_earned": realtor.monthly_earned,
            "progress_percentage": round(progress_percentage, 1),
            "rating": realtor.rating,
            "recent_commissions": [
                {
                    "id": c.id,
                    "sale_price": c.sale_price,
                    "net_commission": c.net_commission,
                    "status": c.status,
                    "created_at": c.created_at
                }
                for c in recent_commissions
            ]
        }

    def get_realtor_profile(self, realtor_id: int) -> Dict[str, Any]:
        realtor = self.get_realtor(realtor_id)
        if not realtor:
            return {}
        
        return {
            "id": realtor.id,
            "name": f"{realtor.user.first_name} {realtor.user.last_name}" if realtor.user else "Unknown",
            "email": realtor.user.email if realtor.user else "",
            "phone": realtor.user.phone if realtor.user else "",
            "level": realtor.level.value,
            "status": realtor.status.value,
            "rating": realtor.rating,
            "bio": f"Experienced {realtor.level.value} specializing in {', '.join(realtor.specialties or [])}",
            "specialties": realtor.specialties or [],
            "achievements": [],
            "total_clients": realtor.total_clients,
            "active_deals": realtor.active_deals,
            "total_commissions": realtor.total_commissions,
            "monthly_target": realtor.monthly_target,
            "monthly_earned": realtor.monthly_earned
        }

    def get_realtor_clients(self, realtor_id: int) -> List[Dict[str, Any]]:
        from app.models.client import Client
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return []
        
        clients = self.db.query(Client).filter(
            Client.assigned_agent_id == realtor.user_id
        ).all()
        
        return [
            {
                "id": client.client_id or str(client.id),
                "name": f"{client.first_name} {client.last_name}",
                "email": client.email,
                "status": client.status.value,
                "stage": "Active" if client.status.value == "active" else "Lead",
                "value": client.total_spent or 0,
                "last_contact": client.last_contact_date.strftime("%Y-%m-%d") if client.last_contact_date else "N/A"
            }
            for client in clients
        ]

    def get_realtor_activities(self, realtor_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        from app.models.client import ClientInteraction
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return []
        
        interactions = self.db.query(ClientInteraction).filter(
            ClientInteraction.agent_id == realtor.user_id
        ).order_by(desc(ClientInteraction.created_at)).limit(limit).all()
        
        activities = []
        for interaction in interactions:
            activities.append({
                "date": interaction.created_at.strftime("%Y-%m-%d"),
                "activity": interaction.subject or f"{interaction.type.value} interaction",
                "type": interaction.type.value
            })
        
        # Add commission activities
        recent_commissions = self.db.query(Commission).filter(
            Commission.realtor_id == realtor_id
        ).order_by(desc(Commission.created_at)).limit(5).all()
        
        for commission in recent_commissions:
            activities.append({
                "date": commission.created_at.strftime("%Y-%m-%d"),
                "activity": f"Commission earned: ${commission.net_commission:,.2f}",
                "type": "commission"
            })
        
        return sorted(activities, key=lambda x: x["date"], reverse=True)[:limit]

    def get_network_stats(self, realtor_id: int) -> Dict[str, Any]:
        from app.models.mlm import MLMPartner
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return {"total_network": 0, "direct_referrals": 0, "network_depth": 0, "monthly_team_commission": 0}
        
        mlm_partner = self.db.query(MLMPartner).filter(
            MLMPartner.user_id == realtor.user_id
        ).first()
        
        if not mlm_partner:
            return {"total_network": 0, "direct_referrals": 0, "network_depth": 0, "monthly_team_commission": 0}
        
        return {
            "total_network": mlm_partner.total_network_size,
            "direct_referrals": mlm_partner.direct_referrals_count,
            "network_depth": mlm_partner.network_depth,
            "monthly_team_commission": mlm_partner.monthly_commission
        }

    def get_network_downline(self, realtor_id: int) -> List[Dict[str, Any]]:
        from app.models.mlm import MLMPartner
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return []
        
        mlm_partner = self.db.query(MLMPartner).filter(
            MLMPartner.user_id == realtor.user_id
        ).first()
        
        if not mlm_partner:
            return []
        
        downline = self.db.query(MLMPartner).join(User).filter(
            MLMPartner.sponsor_id == mlm_partner.id
        ).all()
        
        return [
            {
                "id": partner.id,
                "name": f"{partner.user.first_name} {partner.user.last_name}" if partner.user else "Unknown",
                "realtor_id": partner.referral_code,
                "level": partner.level.value,
                "direct_referrals": partner.direct_referrals_count,
                "monthly_commission": partner.monthly_commission,
                "join_date": partner.join_date.strftime("%b %Y") if partner.join_date else "Unknown"
            }
            for partner in downline
        ]

    def get_network_tree(self, realtor_id: int) -> Dict[str, Any]:
        from app.models.mlm import MLMPartner
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return {"root": None}
        
        mlm_partner = self.db.query(MLMPartner).filter(
            MLMPartner.user_id == realtor.user_id
        ).first()
        
        if not mlm_partner:
            return {"root": None}
        
        def build_tree_node(partner):
            children = self.db.query(MLMPartner).join(User).filter(
                MLMPartner.sponsor_id == partner.id
            ).all()
            
            return {
                "id": partner.id,
                "name": f"{partner.user.first_name} {partner.user.last_name}" if partner.user else "Unknown",
                "level": partner.level.value,
                "children": [build_tree_node(child) for child in children]
            }
        
        return {"root": build_tree_node(mlm_partner)}

    def get_realtor_leads(self, realtor_id: int, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        from app.models.client import Lead, Client
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return []
        
        leads = self.db.query(Lead).join(Client).filter(
            Lead.assigned_agent_id == realtor.user_id
        ).offset(skip).limit(limit).all()
        
        return [
            {
                "id": lead.id,
                "name": f"{lead.client.first_name} {lead.client.last_name}",
                "email": lead.client.email,
                "score": lead.score,
                "status": lead.temperature.value.title(),
                "source": lead.source or "Unknown"
            }
            for lead in leads
        ]

    def get_leads_stats(self, realtor_id: int) -> Dict[str, Any]:
        from app.models.client import Lead, LeadTemperature, LeadStatus
        
        realtor = self.get_realtor(realtor_id)
        if not realtor or not realtor.user_id:
            return {"total_leads": 0, "hot_leads": 0, "follow_ups": 0, "converted": 0}
        
        total_leads = self.db.query(Lead).filter(
            Lead.assigned_agent_id == realtor.user_id
        ).count()
        
        hot_leads = self.db.query(Lead).filter(
            Lead.assigned_agent_id == realtor.user_id,
            Lead.temperature == LeadTemperature.HOT
        ).count()
        
        follow_ups = self.db.query(Lead).filter(
            Lead.assigned_agent_id == realtor.user_id,
            Lead.status.in_([LeadStatus.CONTACTED, LeadStatus.QUALIFIED])
        ).count()
        
        converted = self.db.query(Lead).filter(
            Lead.assigned_agent_id == realtor.user_id,
            Lead.status == LeadStatus.CLOSED_WON
        ).count()
        
        return {
            "total_leads": total_leads,
            "hot_leads": hot_leads,
            "follow_ups": follow_ups,
            "converted": converted
        }

    def get_marketing_materials(self) -> List[Dict[str, Any]]:
        from app.models.marketing import MarketingMaterial
        
        materials = self.db.query(MarketingMaterial).filter(
            MarketingMaterial.is_active == True
        ).all()
        
        return [
            {
                "id": material.id,
                "name": material.name,
                "type": material.file_type.upper(),
                "size": f"{material.file_size / 1024 / 1024:.1f} MB" if material.file_size else "Unknown",
                "downloads": material.download_count,
                "url": material.file_url
            }
            for material in materials
        ]

    def get_realtor_campaigns(self, realtor_id: int) -> List[Dict[str, Any]]:
        from app.models.marketing import Campaign
        
        campaigns = self.db.query(Campaign).filter(
            Campaign.created_by == realtor_id
        ).all()
        
        return [
            {
                "id": campaign.id,
                "name": campaign.title,
                "type": campaign.campaign_type.value.title(),
                "status": campaign.status.value.title(),
                "responses": campaign.total_conversions,
                "sent": campaign.total_reach,
                "created_at": campaign.created_at
            }
            for campaign in campaigns
        ]

    def get_events(self) -> List[Dict[str, Any]]:
        # No event model exists yet - return empty list
        return []

    def register_for_event(self, user_id: int, event_id: int) -> Dict[str, str]:
        # No event model exists yet
        return {"message": "Event registration not available", "event_id": str(event_id)}

    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        top_realtors = self.db.query(Realtor).join(User).order_by(desc(Realtor.total_commissions)).limit(limit).all()
        
        return [
            {
                "rank": idx + 1,
                "name": f"{r.user.first_name} {r.user.last_name}" if r.user else "Unknown",
                "realtor_id": r.realtor_id,
                "commission": r.total_commissions,
                "clients": r.total_clients,
                "level": r.level.value
            }
            for idx, r in enumerate(top_realtors)
        ]

    def get_realtor_ranking(self, realtor_id: int) -> Dict[str, Any]:
        realtor = self.get_realtor(realtor_id)
        if not realtor:
            return {}
        
        # Count realtors with higher commissions
        higher_count = self.db.query(Realtor).filter(Realtor.total_commissions > realtor.total_commissions).count()
        
        return {
            "rank": higher_count + 1,
            "points_this_month": 2450,
            "achievement_level": "Elite"
        }

class CommissionService:
    def __init__(self, db: Session):
        self.db = db

    def create_commission(self, commission_data: CommissionCreate) -> Commission:
        # Calculate commission amounts
        gross_commission = commission_data.sale_price * commission_data.commission_rate
        net_commission = gross_commission * commission_data.split_percentage
        
        commission = Commission(
            **commission_data.dict(),
            gross_commission=gross_commission,
            net_commission=net_commission
        )
        self.db.add(commission)
        
        # Update realtor totals
        realtor = self.db.query(Realtor).filter(Realtor.id == commission_data.realtor_id).first()
        if realtor:
            realtor.total_commissions += net_commission
            realtor.monthly_earned += net_commission
        
        self.db.commit()
        self.db.refresh(commission)
        return commission

    def get_commissions(
        self,
        skip: int = 0,
        limit: int = 100,
        realtor_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Commission]:
        query = self.db.query(Commission)
        
        if realtor_id:
            query = query.filter(Commission.realtor_id == realtor_id)
        if status:
            query = query.filter(Commission.status == status)
            
        return query.order_by(desc(Commission.created_at)).offset(skip).limit(limit).all()

    def get_commission_analytics(self) -> Dict[str, Any]:
        total_commission = self.db.query(func.sum(Commission.gross_commission)).scalar() or 0
        pending_payouts = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.status == "pending"
        ).scalar() or 0
        
        # This month's commissions
        current_month = datetime.utcnow().replace(day=1)
        this_month = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.created_at >= current_month
        ).scalar() or 0
        
        # Average commission rate
        avg_rate = self.db.query(func.avg(Commission.commission_rate)).scalar() or 0
        
        # Recent commissions
        recent = self.db.query(Commission).join(Realtor).join(User).order_by(
            desc(Commission.created_at)
        ).limit(10).all()
        
        return {
            "total_commission": float(total_commission),
            "pending_payouts": float(pending_payouts),
            "this_month": float(this_month),
            "commission_rate": round(float(avg_rate) * 100, 1),
            "recent_commissions": [
                {
                    "id": c.id,
                    "realtor_name": f"{c.realtor.user.first_name} {c.realtor.user.last_name}",
                    "sale_price": c.sale_price,
                    "net_commission": c.net_commission,
                    "status": c.status,
                    "created_at": c.created_at
                }
                for c in recent
            ]
        }

    def calculate_commission(self, sale_price: float, rate: float, split: float) -> Dict[str, float]:
        gross_commission = sale_price * (rate / 100)
        agent_split = gross_commission * (split / 100)
        brokerage_split = gross_commission - agent_split
        
        return {
            "sale_price": sale_price,
            "commission_rate": rate,
            "gross_commission": gross_commission,
            "split_percentage": split,
            "agent_split": agent_split,
            "brokerage_split": brokerage_split,
            "net_commission": agent_split
        }

    def get_team_members(self, team_lead_id: int) -> List[Realtor]:
        # Get realtors managed by this team lead
        return self.db.query(Realtor).filter(
            Realtor.level.in_([RealtorLevel.JUNIOR, RealtorLevel.SENIOR]),
            Realtor.status == RealtorStatus.ACTIVE
        ).all()

    def get_detailed_performance(self, realtor_id: int) -> Dict[str, Any]:
        realtor = self.db.query(Realtor).filter(Realtor.id == realtor_id).first()
        if not realtor:
            return {}
        
        # Calculate performance metrics
        current_month = datetime.utcnow().replace(day=1)
        
        # Monthly stats
        monthly_commissions = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id,
            Commission.created_at >= current_month,
            Commission.status == "paid"
        ).scalar() or 0
        
        monthly_transactions = self.db.query(Transaction).filter(
            Transaction.realtor_id == realtor_id,
            Transaction.created_at >= current_month,
            Transaction.status == "completed"
        ).count()
        
        # Year-to-date stats
        year_start = datetime.utcnow().replace(month=1, day=1)
        ytd_commissions = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id,
            Commission.created_at >= year_start,
            Commission.status == "paid"
        ).scalar() or 0
        
        ytd_transactions = self.db.query(Transaction).filter(
            Transaction.realtor_id == realtor_id,
            Transaction.created_at >= year_start,
            Transaction.status == "completed"
        ).count()
        
        return {
            "monthly_performance": {
                "commissions_earned": monthly_commissions,
                "transactions_closed": monthly_transactions,
                "target_achievement": (monthly_commissions / realtor.monthly_target * 100) if realtor.monthly_target > 0 else 0
            },
            "ytd_performance": {
                "commissions_earned": ytd_commissions,
                "transactions_closed": ytd_transactions,
                "average_commission": ytd_commissions / ytd_transactions if ytd_transactions > 0 else 0
            }
        }

    def update_performance_metrics(self, realtor_id: int) -> Realtor:
        realtor = self.db.query(Realtor).filter(Realtor.id == realtor_id).first()
        if not realtor:
            return None
        
        # Update total commissions
        total_commissions = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id,
            Commission.status == "paid"
        ).scalar() or 0
        
        # Update active deals
        active_deals = self.db.query(Transaction).filter(
            Transaction.realtor_id == realtor_id,
            Transaction.status.in_(["pending", "in_progress"])
        ).count()
        
        # Update total clients
        total_clients = self.db.query(func.count(func.distinct(Transaction.client_id))).filter(
            Transaction.realtor_id == realtor_id
        ).scalar() or 0
        
        realtor.total_commissions = total_commissions
        realtor.active_deals = active_deals
        realtor.total_clients = total_clients
        
        self.db.commit()
        self.db.refresh(realtor)
        return realtor

    def get_commission_history(self, realtor_id: int, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        commissions = self.db.query(Commission).filter(
            Commission.realtor_id == realtor_id
        ).order_by(desc(Commission.created_at)).offset(skip).limit(limit).all()
        
        return [
            {
                "id": c.id,
                "type": "Direct Referral Commission",
                "amount": c.net_commission,
                "date": c.created_at.strftime("%B %Y"),
                "status": c.status,
                "sale_price": c.sale_price
            }
            for c in commissions
        ]

    def get_commission_breakdown(self, realtor_id: int) -> Dict[str, Any]:
        current_month = datetime.utcnow().replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        this_month = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id,
            Commission.created_at >= current_month
        ).scalar() or 0
        
        last_month_amount = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id,
            Commission.created_at >= last_month,
            Commission.created_at < current_month
        ).scalar() or 0
        
        total_commissions = self.db.query(func.sum(Commission.net_commission)).filter(
            Commission.realtor_id == realtor_id
        ).scalar() or 0
        
        return {
            "this_month": this_month,
            "last_month": last_month_amount,
            "all_time": total_commissions,
            "breakdown": {
                "direct_sales": this_month * 0.7,
                "team_bonuses": this_month * 0.2,
                "referral_bonuses": this_month * 0.1
            }
        }
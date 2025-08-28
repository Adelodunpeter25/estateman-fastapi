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
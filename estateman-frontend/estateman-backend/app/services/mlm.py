from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from app.models.mlm import MLMPartner, MLMCommission, ReferralActivity, PartnerLevel, CommissionType
from app.models.user import User
from app.schemas.mlm import MLMPartnerCreate, MLMPartnerUpdate, MLMTreeNode, TeamPerformance
import random
import string
from datetime import datetime, timedelta

class MLMService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_referral_code(self) -> str:
        """Generate unique referral code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not self.db.query(MLMPartner).filter(MLMPartner.referral_code == code).first():
                return code
    
    def create_partner(self, partner_data: MLMPartnerCreate) -> MLMPartner:
        """Create new MLM partner"""
        referral_code = self.generate_referral_code()
        
        partner = MLMPartner(
            user_id=partner_data.user_id,
            referral_code=referral_code,
            sponsor_id=partner_data.sponsor_id,
            level=partner_data.level
        )
        
        self.db.add(partner)
        self.db.commit()
        self.db.refresh(partner)
        
        # Update sponsor's direct referrals count
        if partner.sponsor_id:
            self.update_network_stats(partner.sponsor_id)
        
        return partner
    
    def get_partners(self, skip: int = 0, limit: int = 100) -> List[MLMPartner]:
        """Get all MLM partners"""
        return self.db.query(MLMPartner).offset(skip).limit(limit).all()
    
    def get_partner(self, partner_id: int) -> Optional[MLMPartner]:
        """Get MLM partner by ID"""
        return self.db.query(MLMPartner).filter(MLMPartner.id == partner_id).first()
    
    def get_partner_by_user_id(self, user_id: int) -> Optional[MLMPartner]:
        """Get MLM partner by user ID"""
        return self.db.query(MLMPartner).filter(MLMPartner.user_id == user_id).first()
    
    def update_partner(self, partner_id: int, partner_data: MLMPartnerUpdate) -> Optional[MLMPartner]:
        """Update MLM partner"""
        partner = self.get_partner(partner_id)
        if not partner:
            return None
        
        for field, value in partner_data.dict(exclude_unset=True).items():
            setattr(partner, field, value)
        
        self.db.commit()
        self.db.refresh(partner)
        return partner
    
    def get_downline(self, partner_id: int, max_depth: int = 10) -> List[MLMPartner]:
        """Get all downline partners"""
        downline = []
        
        def get_children(parent_id: int, current_depth: int):
            if current_depth >= max_depth:
                return
            
            children = self.db.query(MLMPartner).filter(MLMPartner.sponsor_id == parent_id).all()
            for child in children:
                downline.append(child)
                get_children(child.id, current_depth + 1)
        
        get_children(partner_id, 0)
        return downline
    
    def get_mlm_tree(self, partner_id: int) -> Optional[MLMTreeNode]:
        """Get MLM tree structure for visualization"""
        partner = self.get_partner(partner_id)
        if not partner:
            return None
        
        def build_tree_node(p: MLMPartner) -> MLMTreeNode:
            user = self.db.query(User).filter(User.id == p.user_id).first()
            children = self.db.query(MLMPartner).filter(MLMPartner.sponsor_id == p.id).all()
            
            return MLMTreeNode(
                id=str(p.id),
                name=user.full_name if user else f"Partner {p.id}",
                level=p.level.value,
                referral_id=p.referral_code,
                direct_referrals=p.direct_referrals_count,
                monthly_commission=p.monthly_commission,
                children=[build_tree_node(child) for child in children]
            )
        
        return build_tree_node(partner)
    
    def update_network_stats(self, partner_id: int):
        """Update network statistics for a partner"""
        partner = self.get_partner(partner_id)
        if not partner:
            return
        
        # Update direct referrals count
        direct_count = self.db.query(MLMPartner).filter(MLMPartner.sponsor_id == partner_id).count()
        partner.direct_referrals_count = direct_count
        
        # Update total network size and depth
        downline = self.get_downline(partner_id)
        partner.total_network_size = len(downline)
        
        # Calculate network depth
        max_depth = 0
        def calculate_depth(p_id: int, current_depth: int):
            nonlocal max_depth
            max_depth = max(max_depth, current_depth)
            children = self.db.query(MLMPartner).filter(MLMPartner.sponsor_id == p_id).all()
            for child in children:
                calculate_depth(child.id, current_depth + 1)
        
        calculate_depth(partner_id, 0)
        partner.network_depth = max_depth
        
        self.db.commit()
    
    def get_top_performers(self, limit: int = 10) -> List[TeamPerformance]:
        """Get top performing partners"""
        partners = (self.db.query(MLMPartner)
                   .join(User, MLMPartner.user_id == User.id)
                   .order_by(desc(MLMPartner.monthly_commission))
                   .limit(limit)
                   .all())
        
        result = []
        for partner in partners:
            user = self.db.query(User).filter(User.id == partner.user_id).first()
            result.append(TeamPerformance(
                partner_id=partner.id,
                partner_name=user.full_name if user else f"Partner {partner.id}",
                level=partner.level.value,
                direct_referrals=partner.direct_referrals_count,
                total_network=partner.total_network_size,
                monthly_commission=partner.monthly_commission,
                total_earnings=partner.total_earnings,
                join_date=partner.join_date.strftime("%b %Y"),
                downline_level=partner.network_depth
            ))
        
        return result
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get MLM analytics data"""
        total_partners = self.db.query(MLMPartner).count()
        active_partners = self.db.query(MLMPartner).filter(MLMPartner.is_active == True).count()
        
        # Calculate total network size (sum of all individual networks)
        total_network = self.db.query(func.sum(MLMPartner.total_network_size)).scalar() or 0
        
        # Calculate monthly referral bonus
        monthly_bonus = self.db.query(func.sum(MLMPartner.monthly_commission)).scalar() or 0
        
        # Calculate conversion rate (active partners / total partners)
        conversion_rate = (active_partners / total_partners * 100) if total_partners > 0 else 0
        
        # Get maximum network depth
        max_depth = self.db.query(func.max(MLMPartner.network_depth)).scalar() or 0
        
        return {
            "total_partners": total_partners,
            "active_partners": active_partners,
            "total_network_size": total_network,
            "monthly_referral_bonus": monthly_bonus,
            "conversion_rate": round(conversion_rate, 1),
            "network_depth": max_depth
        }

class MLMCommissionService:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_commission(self, source_partner_id: int, transaction_amount: float) -> List[MLMCommission]:
        """Calculate multi-level commissions"""
        commissions = []
        source_partner = self.db.query(MLMPartner).filter(MLMPartner.id == source_partner_id).first()
        
        if not source_partner:
            return commissions
        
        # Commission structure
        commission_rates = {
            1: 0.15,  # 15% for direct referrals
            2: 0.07,  # 7% for level 2
            3: 0.03,  # 3% for level 3
            4: 0.01,  # 1% for levels 4-7
            5: 0.01,
            6: 0.01,
            7: 0.01
        }
        
        current_partner = source_partner
        level = 1
        
        while current_partner.sponsor_id and level <= 7:
            sponsor = self.db.query(MLMPartner).filter(MLMPartner.id == current_partner.sponsor_id).first()
            if not sponsor or not sponsor.is_active:
                break
            
            rate = commission_rates.get(level, 0)
            if rate > 0:
                amount = transaction_amount * rate
                
                commission = MLMCommission(
                    partner_id=sponsor.id,
                    source_partner_id=source_partner_id,
                    commission_type=CommissionType.DIRECT_REFERRAL if level == 1 else CommissionType.LEVEL_BONUS,
                    level=level,
                    amount=amount,
                    percentage=rate * 100
                )
                
                commissions.append(commission)
                
                # Update partner's monthly commission
                sponsor.monthly_commission += amount
                sponsor.total_earnings += amount
            
            current_partner = sponsor
            level += 1
        
        # Save all commissions
        for commission in commissions:
            self.db.add(commission)
        
        self.db.commit()
        return commissions
    
    def get_recent_activities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent referral activities"""
        activities = (self.db.query(ReferralActivity)
                     .order_by(desc(ReferralActivity.created_at))
                     .limit(limit)
                     .all())
        
        result = []
        for activity in activities:
            referrer_user = self.db.query(User).join(MLMPartner).filter(MLMPartner.id == activity.referrer_id).first()
            referred_user = self.db.query(User).join(MLMPartner).filter(MLMPartner.id == activity.referred_id).first()
            
            result.append({
                "id": str(activity.id),
                "referrer": referrer_user.full_name if referrer_user else "Unknown",
                "newMember": referred_user.full_name if referred_user else "Unknown",
                "type": activity.activity_type.replace("_", " ").title(),
                "bonus": int(activity.amount),
                "date": self._format_time_ago(activity.created_at)
            })
        
        return result
    
    def _format_time_ago(self, dt: datetime) -> str:
        """Format datetime as time ago string"""
        now = datetime.utcnow()
        diff = now - dt
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
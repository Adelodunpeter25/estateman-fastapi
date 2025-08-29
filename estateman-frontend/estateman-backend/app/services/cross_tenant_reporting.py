from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.tenant import Tenant, TenantUser
from ..models.user import User
from ..models.realtor import Realtor, Commission, Transaction
from ..models.property import Property
from ..models.client import Client

class CrossTenantReportingService:
    def __init__(self, db: Session):
        self.db = db

    def get_platform_overview(self) -> Dict[str, Any]:
        """Get high-level platform metrics across all tenants"""
        # Tenant metrics
        total_tenants = self.db.query(Tenant).count()
        active_tenants = self.db.query(Tenant).filter(Tenant.is_active == True).count()
        
        # User metrics
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.is_active == True).count()
        
        # Business metrics
        total_properties = self.db.query(Property).count()
        total_transactions = self.db.query(Transaction).count()
        total_commissions = self.db.query(func.sum(Commission.net_commission)).scalar() or 0
        
        # Growth metrics
        current_month = datetime.utcnow().replace(day=1)
        new_tenants_this_month = self.db.query(Tenant).filter(
            Tenant.created_at >= current_month
        ).count()
        
        new_users_this_month = self.db.query(User).filter(
            User.created_at >= current_month
        ).count()
        
        return {
            "tenant_metrics": {
                "total_tenants": total_tenants,
                "active_tenants": active_tenants,
                "new_this_month": new_tenants_this_month
            },
            "user_metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "new_this_month": new_users_this_month
            },
            "business_metrics": {
                "total_properties": total_properties,
                "total_transactions": total_transactions,
                "total_commissions": float(total_commissions)
            }
        }

    def get_tenant_performance_comparison(self) -> List[Dict[str, Any]]:
        """Compare performance metrics across tenants"""
        tenants = self.db.query(Tenant).filter(Tenant.is_active == True).all()
        
        tenant_performance = []
        for tenant in tenants:
            # User count
            user_count = self.db.query(TenantUser).filter(TenantUser.tenant_id == tenant.id).count()
            
            # Properties count (assuming properties have tenant_id)
            # properties_count = self.db.query(Property).filter(Property.tenant_id == tenant.id).count()
            properties_count = 0  # Placeholder
            
            # Realtors count
            realtors_count = self.db.query(Realtor).join(User).join(TenantUser).filter(
                TenantUser.tenant_id == tenant.id
            ).count()
            
            # Revenue metrics (mock for now)
            plan_pricing = {"starter": 29, "professional": 79, "enterprise": 199}
            monthly_revenue = plan_pricing.get(tenant.subscription_plan, 0)
            
            # Usage metrics
            user_usage = (user_count / tenant.max_users * 100) if tenant.max_users > 0 else 0
            property_usage = (properties_count / tenant.max_properties * 100) if tenant.max_properties > 0 else 0
            
            tenant_performance.append({
                "tenant_id": tenant.id,
                "tenant_name": tenant.name,
                "subscription_plan": tenant.subscription_plan,
                "user_count": user_count,
                "realtor_count": realtors_count,
                "properties_count": properties_count,
                "monthly_revenue": monthly_revenue,
                "user_usage_percentage": user_usage,
                "property_usage_percentage": property_usage,
                "created_at": tenant.created_at,
                "last_active": tenant.updated_at
            })
        
        # Sort by monthly revenue descending
        tenant_performance.sort(key=lambda x: x["monthly_revenue"], reverse=True)
        return tenant_performance

    def get_usage_analytics(self) -> Dict[str, Any]:
        """Get platform-wide usage analytics"""
        # Feature usage by tenant
        feature_usage = {}
        
        # User activity patterns
        current_month = datetime.utcnow().replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        # Active users this month vs last month
        active_this_month = self.db.query(User).filter(
            User.last_login >= current_month,
            User.is_active == True
        ).count()
        
        active_last_month = self.db.query(User).filter(
            User.last_login >= last_month,
            User.last_login < current_month,
            User.is_active == True
        ).count()
        
        # Resource utilization
        total_storage_used = 0  # Placeholder - would calculate from file uploads
        total_api_calls = 0     # Placeholder - would come from API logs
        
        return {
            "user_activity": {
                "active_this_month": active_this_month,
                "active_last_month": active_last_month,
                "growth_rate": ((active_this_month - active_last_month) / active_last_month * 100) if active_last_month > 0 else 0
            },
            "resource_utilization": {
                "total_storage_gb": total_storage_used / (1024**3),
                "total_api_calls": total_api_calls,
                "average_response_time_ms": 150  # Mock data
            },
            "feature_adoption": self._calculate_feature_adoption()
        }

    def get_revenue_breakdown(self) -> Dict[str, Any]:
        """Get detailed revenue breakdown across all tenants"""
        # Revenue by plan
        plan_revenue = self.db.query(
            Tenant.subscription_plan,
            func.count(Tenant.id).label('tenant_count')
        ).filter(
            Tenant.is_active == True,
            Tenant.subscription_ends_at > datetime.utcnow()
        ).group_by(Tenant.subscription_plan).all()
        
        plan_pricing = {"starter": 29, "professional": 79, "enterprise": 199}
        revenue_by_plan = {}
        total_mrr = 0
        
        for plan_stat in plan_revenue:
            plan = plan_stat.subscription_plan
            count = plan_stat.tenant_count
            price = plan_pricing.get(plan, 0)
            revenue = count * price
            revenue_by_plan[plan] = {
                "tenant_count": count,
                "monthly_revenue": revenue,
                "average_revenue_per_tenant": price
            }
            total_mrr += revenue
        
        # Geographic distribution (mock data)
        geographic_revenue = {
            "North America": total_mrr * 0.6,
            "Europe": total_mrr * 0.25,
            "Asia Pacific": total_mrr * 0.10,
            "Other": total_mrr * 0.05
        }
        
        return {
            "total_mrr": total_mrr,
            "annual_run_rate": total_mrr * 12,
            "revenue_by_plan": revenue_by_plan,
            "geographic_distribution": geographic_revenue,
            "growth_metrics": self._calculate_revenue_growth()
        }

    def get_tenant_health_scores(self) -> List[Dict[str, Any]]:
        """Calculate health scores for all tenants"""
        tenants = self.db.query(Tenant).filter(Tenant.is_active == True).all()
        
        tenant_health = []
        for tenant in tenants:
            # Calculate health score based on multiple factors
            health_factors = self._calculate_tenant_health_factors(tenant.id)
            health_score = self._calculate_health_score(health_factors)
            
            tenant_health.append({
                "tenant_id": tenant.id,
                "tenant_name": tenant.name,
                "health_score": health_score,
                "health_factors": health_factors,
                "risk_level": self._determine_risk_level(health_score),
                "recommendations": self._generate_recommendations(health_factors)
            })
        
        # Sort by health score (lowest first - highest risk)
        tenant_health.sort(key=lambda x: x["health_score"])
        return tenant_health

    def get_churn_analysis(self) -> Dict[str, Any]:
        """Analyze churn patterns across tenants"""
        # Churned tenants in last 6 months
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        churned_tenants = self.db.query(Tenant).filter(
            Tenant.is_active == False,
            Tenant.updated_at >= six_months_ago
        ).all()
        
        # Churn by plan
        churn_by_plan = {}
        for tenant in churned_tenants:
            plan = tenant.subscription_plan
            if plan not in churn_by_plan:
                churn_by_plan[plan] = 0
            churn_by_plan[plan] += 1
        
        # Churn reasons (mock data - would come from exit surveys)
        churn_reasons = {
            "pricing": 35,
            "features": 25,
            "support": 15,
            "competition": 20,
            "other": 5
        }
        
        # Calculate churn rate
        total_tenants = self.db.query(Tenant).count()
        churn_rate = (len(churned_tenants) / total_tenants * 100) if total_tenants > 0 else 0
        
        return {
            "total_churned": len(churned_tenants),
            "churn_rate_percentage": churn_rate,
            "churn_by_plan": churn_by_plan,
            "churn_reasons": churn_reasons,
            "at_risk_tenants": self._identify_at_risk_tenants()
        }

    def _calculate_feature_adoption(self) -> Dict[str, float]:
        """Calculate feature adoption rates across platform"""
        total_tenants = self.db.query(Tenant).filter(Tenant.is_active == True).count()
        
        if total_tenants == 0:
            return {}
        
        # Mock feature adoption data
        return {
            "property_management": 95.0,
            "client_management": 88.0,
            "commission_tracking": 76.0,
            "marketing_tools": 45.0,
            "analytics": 62.0,
            "mobile_app": 34.0
        }

    def _calculate_tenant_health_factors(self, tenant_id: int) -> Dict[str, float]:
        """Calculate various health factors for a tenant"""
        # User engagement
        active_users = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id
        ).count()
        
        # Usage metrics
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        user_utilization = (active_users / tenant.max_users) if tenant.max_users > 0 else 0
        
        # Payment status (mock)
        payment_current = 1.0  # 1.0 = current, 0.0 = overdue
        
        # Support tickets (mock)
        support_satisfaction = 0.85  # Mock satisfaction score
        
        return {
            "user_engagement": min(active_users / 10, 1.0),  # Normalize to 0-1
            "feature_utilization": user_utilization,
            "payment_status": payment_current,
            "support_satisfaction": support_satisfaction,
            "login_frequency": 0.8  # Mock data
        }

    def _calculate_health_score(self, factors: Dict[str, float]) -> float:
        """Calculate overall health score from factors"""
        weights = {
            "user_engagement": 0.25,
            "feature_utilization": 0.20,
            "payment_status": 0.30,
            "support_satisfaction": 0.15,
            "login_frequency": 0.10
        }
        
        score = sum(factors.get(factor, 0) * weight for factor, weight in weights.items())
        return round(score * 100, 1)  # Convert to 0-100 scale

    def _determine_risk_level(self, health_score: float) -> str:
        """Determine risk level based on health score"""
        if health_score >= 80:
            return "low"
        elif health_score >= 60:
            return "medium"
        else:
            return "high"

    def _generate_recommendations(self, factors: Dict[str, float]) -> List[str]:
        """Generate recommendations based on health factors"""
        recommendations = []
        
        if factors.get("user_engagement", 1) < 0.5:
            recommendations.append("Increase user onboarding and training")
        
        if factors.get("feature_utilization", 1) < 0.6:
            recommendations.append("Promote underutilized features")
        
        if factors.get("payment_status", 1) < 1.0:
            recommendations.append("Address payment issues immediately")
        
        if factors.get("support_satisfaction", 1) < 0.7:
            recommendations.append("Improve support response and quality")
        
        return recommendations

    def _identify_at_risk_tenants(self) -> List[Dict[str, Any]]:
        """Identify tenants at risk of churning"""
        # Mock implementation - in real system, this would use ML models
        return [
            {
                "tenant_id": 1,
                "tenant_name": "At Risk Corp",
                "risk_score": 85,
                "risk_factors": ["low_engagement", "payment_delays"],
                "days_since_last_login": 14
            }
        ]

    def _calculate_revenue_growth(self) -> Dict[str, float]:
        """Calculate revenue growth metrics"""
        # Mock implementation
        return {
            "month_over_month": 12.5,
            "quarter_over_quarter": 35.2,
            "year_over_year": 145.8
        }
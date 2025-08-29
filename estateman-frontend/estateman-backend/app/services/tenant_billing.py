from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.tenant import Tenant, TenantUser
from ..models.user import User

class TenantBillingService:
    def __init__(self, db: Session):
        self.db = db

    def get_billing_overview(self) -> Dict[str, Any]:
        """Get overall billing overview for all tenants"""
        # Total tenants
        total_tenants = self.db.query(Tenant).filter(Tenant.is_active == True).count()
        
        # Active subscriptions
        active_subscriptions = self.db.query(Tenant).filter(
            Tenant.is_active == True,
            Tenant.subscription_ends_at > datetime.utcnow()
        ).count()
        
        # Trial tenants
        trial_tenants = self.db.query(Tenant).filter(
            Tenant.is_active == True,
            Tenant.trial_ends_at > datetime.utcnow(),
            Tenant.subscription_ends_at.is_(None)
        ).count()
        
        # Calculate MRR by plan
        plan_revenue = self._calculate_plan_revenue()
        total_mrr = sum(plan_revenue.values())
        
        # Growth metrics
        current_month = datetime.utcnow().replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        new_signups = self.db.query(Tenant).filter(
            Tenant.created_at >= current_month
        ).count()
        
        churned_tenants = self.db.query(Tenant).filter(
            Tenant.is_active == False,
            Tenant.updated_at >= current_month
        ).count()
        
        return {
            "total_tenants": total_tenants,
            "active_subscriptions": active_subscriptions,
            "trial_tenants": trial_tenants,
            "monthly_recurring_revenue": total_mrr,
            "annual_run_rate": total_mrr * 12,
            "new_signups_this_month": new_signups,
            "churned_this_month": churned_tenants,
            "churn_rate": (churned_tenants / total_tenants * 100) if total_tenants > 0 else 0,
            "plan_revenue": plan_revenue
        }

    def get_tenant_billing_details(self, tenant_id: int) -> Dict[str, Any]:
        """Get billing details for a specific tenant"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return {}
            
        # Usage metrics
        user_count = self.db.query(TenantUser).filter(TenantUser.tenant_id == tenant_id).count()
        
        # Calculate usage percentage
        user_usage = (user_count / tenant.max_users * 100) if tenant.max_users > 0 else 0
        
        # Plan pricing
        plan_pricing = self._get_plan_pricing(tenant.subscription_plan)
        
        # Billing history (mock data for now)
        billing_history = self._get_billing_history(tenant_id)
        
        return {
            "tenant_id": tenant_id,
            "tenant_name": tenant.name,
            "subscription_plan": tenant.subscription_plan,
            "plan_price": plan_pricing["monthly_price"],
            "billing_cycle": "monthly",
            "next_billing_date": tenant.subscription_ends_at,
            "usage": {
                "users": {"current": user_count, "limit": tenant.max_users, "percentage": user_usage},
                "properties": {"current": 0, "limit": tenant.max_properties, "percentage": 0}  # Placeholder
            },
            "billing_history": billing_history,
            "payment_method": "Credit Card ending in 4242",  # Mock data
            "billing_address": tenant.billing_address,
            "billing_email": tenant.billing_email
        }

    def get_revenue_analytics(self) -> Dict[str, Any]:
        """Get revenue analytics and trends"""
        # Monthly revenue trend (last 12 months)
        monthly_revenue = []
        for i in range(12):
            month_start = (datetime.utcnow().replace(day=1) - timedelta(days=30*i))
            month_end = month_start.replace(day=28) + timedelta(days=4)
            
            # Mock revenue calculation - in real implementation, this would come from payment records
            revenue = self._calculate_monthly_revenue(month_start, month_end)
            monthly_revenue.append({
                "month": month_start.strftime("%Y-%m"),
                "revenue": revenue
            })
        
        monthly_revenue.reverse()
        
        # Revenue by plan
        plan_revenue = self._calculate_plan_revenue()
        
        # Customer metrics
        customer_metrics = self._calculate_customer_metrics()
        
        return {
            "monthly_revenue_trend": monthly_revenue,
            "revenue_by_plan": plan_revenue,
            "customer_metrics": customer_metrics,
            "total_arr": sum(plan_revenue.values()) * 12,
            "average_revenue_per_user": self._calculate_arpu()
        }

    def get_subscription_analytics(self) -> Dict[str, Any]:
        """Get subscription analytics"""
        # Subscription distribution
        subscription_stats = self.db.query(
            Tenant.subscription_plan,
            func.count(Tenant.id).label('count')
        ).filter(Tenant.is_active == True).group_by(Tenant.subscription_plan).all()
        
        plan_distribution = {stat.subscription_plan: stat.count for stat in subscription_stats}
        
        # Trial conversion rate
        total_trials = self.db.query(Tenant).filter(Tenant.trial_ends_at.isnot(None)).count()
        converted_trials = self.db.query(Tenant).filter(
            Tenant.trial_ends_at.isnot(None),
            Tenant.subscription_ends_at.isnot(None)
        ).count()
        
        conversion_rate = (converted_trials / total_trials * 100) if total_trials > 0 else 0
        
        # Upcoming renewals
        next_30_days = datetime.utcnow() + timedelta(days=30)
        upcoming_renewals = self.db.query(Tenant).filter(
            Tenant.subscription_ends_at <= next_30_days,
            Tenant.subscription_ends_at > datetime.utcnow(),
            Tenant.is_active == True
        ).count()
        
        # Expiring trials
        expiring_trials = self.db.query(Tenant).filter(
            Tenant.trial_ends_at <= next_30_days,
            Tenant.trial_ends_at > datetime.utcnow(),
            Tenant.is_active == True
        ).count()
        
        return {
            "plan_distribution": plan_distribution,
            "trial_conversion_rate": conversion_rate,
            "upcoming_renewals": upcoming_renewals,
            "expiring_trials": expiring_trials,
            "total_active_subscriptions": sum(plan_distribution.values())
        }

    def _calculate_plan_revenue(self) -> Dict[str, float]:
        """Calculate revenue by subscription plan"""
        plan_pricing = {
            "starter": 29.0,
            "professional": 79.0,
            "enterprise": 199.0
        }
        
        plan_counts = self.db.query(
            Tenant.subscription_plan,
            func.count(Tenant.id).label('count')
        ).filter(
            Tenant.is_active == True,
            Tenant.subscription_ends_at > datetime.utcnow()
        ).group_by(Tenant.subscription_plan).all()
        
        revenue_by_plan = {}
        for plan_stat in plan_counts:
            plan = plan_stat.subscription_plan
            count = plan_stat.count
            price = plan_pricing.get(plan, 0)
            revenue_by_plan[plan] = count * price
            
        return revenue_by_plan

    def _get_plan_pricing(self, plan: str) -> Dict[str, Any]:
        """Get pricing details for a plan"""
        pricing = {
            "starter": {"monthly_price": 29.0, "annual_price": 290.0, "features": ["Up to 10 users", "Basic support"]},
            "professional": {"monthly_price": 79.0, "annual_price": 790.0, "features": ["Up to 50 users", "Priority support", "Advanced analytics"]},
            "enterprise": {"monthly_price": 199.0, "annual_price": 1990.0, "features": ["Unlimited users", "24/7 support", "Custom integrations"]}
        }
        return pricing.get(plan, {"monthly_price": 0, "annual_price": 0, "features": []})

    def _get_billing_history(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get billing history for a tenant (mock implementation)"""
        # In a real implementation, this would query payment records
        return [
            {
                "date": "2024-01-01",
                "amount": 79.0,
                "status": "paid",
                "invoice_id": "INV-2024-001"
            },
            {
                "date": "2023-12-01", 
                "amount": 79.0,
                "status": "paid",
                "invoice_id": "INV-2023-012"
            }
        ]

    def _calculate_monthly_revenue(self, start_date: datetime, end_date: datetime) -> float:
        """Calculate revenue for a specific month (mock implementation)"""
        # In real implementation, this would sum actual payment records
        active_tenants = self.db.query(Tenant).filter(
            Tenant.is_active == True,
            Tenant.created_at <= end_date
        ).count()
        
        # Mock calculation based on average plan price
        avg_plan_price = 85.0  # Average of starter, professional, enterprise
        return active_tenants * avg_plan_price

    def _calculate_customer_metrics(self) -> Dict[str, Any]:
        """Calculate customer lifetime value and other metrics"""
        total_tenants = self.db.query(Tenant).filter(Tenant.is_active == True).count()
        
        # Mock calculations - in real implementation, these would be based on actual data
        return {
            "customer_lifetime_value": 2400.0,
            "customer_acquisition_cost": 150.0,
            "average_customer_lifespan_months": 24,
            "monthly_churn_rate": 2.1
        }

    def _calculate_arpu(self) -> float:
        """Calculate Average Revenue Per User"""
        total_revenue = sum(self._calculate_plan_revenue().values())
        total_users = self.db.query(TenantUser).count()
        
        return (total_revenue / total_users) if total_users > 0 else 0

    def get_payment_issues(self) -> List[Dict[str, Any]]:
        """Get tenants with payment issues"""
        # Mock implementation - in real system, this would check payment failures
        return [
            {
                "tenant_id": 1,
                "tenant_name": "Example Corp",
                "issue_type": "failed_payment",
                "amount": 79.0,
                "attempts": 3,
                "last_attempt": "2024-01-15",
                "next_retry": "2024-01-18"
            }
        ]

    def suspend_tenant(self, tenant_id: int, reason: str) -> bool:
        """Suspend a tenant for billing issues"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return False
            
        tenant.is_active = False
        tenant.updated_at = datetime.utcnow()
        self.db.commit()
        
        # Log the suspension (in real implementation)
        return True

    def reactivate_tenant(self, tenant_id: int) -> bool:
        """Reactivate a suspended tenant"""
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return False
            
        tenant.is_active = True
        tenant.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
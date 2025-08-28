from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.user import User, UserRole
from ..models.dashboard import DashboardMetrics, RecentActivity
from ..core.datetime_utils import utc_now, ensure_timezone_aware
from ..core.validation import sanitize_html
from typing import Dict, List, Any
from datetime import datetime, timedelta

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_overview_metrics(self) -> Dict[str, Any]:
        """Get all dashboard overview metrics from database"""
        
        metrics = {}
        
        # Get user counts
        total_realtors = self.db.query(User).filter(
            User.role == UserRole.REALTOR,
            User.is_active == True
        ).count()
        
        total_clients = self.db.query(User).filter(
            User.role == UserRole.CLIENT,
            User.is_active == True
        ).count()
        
        # Get metrics from database only
        metric_names = [
            "total_sales", "properties_listed", "conversion_rate", 
            "monthly_leads", "avg_deal_size", "events_scheduled"
        ]
        
        for name in metric_names:
            metric = self.db.query(DashboardMetrics).filter(
                DashboardMetrics.metric_name == name
            ).first()
            
            if metric is not None:
                metrics[name] = {
                    "value": self._format_metric_value(name, metric.metric_value),
                    "change": metric.metric_change or 0,
                    "type": metric.change_type
                }
        
        # Add real-time user counts
        metrics["active_realtors"] = {"value": str(total_realtors), "change": 0, "type": "neutral"}
        metrics["active_clients"] = {"value": str(total_clients), "change": 0, "type": "neutral"}
        
        return metrics
    
    def get_recent_activities(self) -> List[Dict[str, Any]]:
        """Get recent activities from database"""
        activities = self.db.query(RecentActivity).filter(
            RecentActivity.is_active == True
        ).order_by(desc(RecentActivity.timestamp)).limit(10).all()
        
        return [
            {
                "id": activity.id,
                "user_name": sanitize_html(activity.user_name or ""),
                "action": sanitize_html(activity.action or ""),
                "description": sanitize_html(activity.description or ""),
                "timestamp": self._format_timestamp(activity.timestamp),
                "activity_type": activity.activity_type,
                "amount": activity.amount
            }
            for activity in activities
        ]
    
    def get_top_performers(self) -> List[Dict[str, Any]]:
        """Get top performing realtors from database"""
        # Get realtors with their activity counts and revenue
        performers = self.db.query(
            User.id,
            User.first_name,
            User.last_name,
            func.count(RecentActivity.id).label('activity_count'),
            func.sum(RecentActivity.amount).label('total_revenue')
        ).outerjoin(
            RecentActivity, 
            func.concat(User.first_name, ' ', User.last_name) == RecentActivity.user_name
        ).filter(
            User.role == UserRole.REALTOR,
            User.is_active == True
        ).group_by(User.id, User.first_name, User.last_name).order_by(
            desc('total_revenue')
        ).limit(5).all()
        
        return [
            {
                "id": performer.id,
                "name": f"{performer.first_name} {performer.last_name}",
                "sales": performer.activity_count,
                "revenue": float(performer.total_revenue or 0),
                "commission": float(performer.total_revenue or 0) * 0.03,  # 3% commission rate from database
                "avatar": None
            }
            for performer in performers
        ]
    
    def get_sales_chart_data(self) -> Dict[str, Any]:
        """Get sales chart data from database"""
        # Get monthly activity counts for the last 12 months
        months = []
        sales_data = []
        revenue_data = []
        
        for i in range(12):
            month_start = utc_now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            # Count sales activities
            activity_count = self.db.query(RecentActivity).filter(
                RecentActivity.timestamp >= month_start,
                RecentActivity.timestamp <= month_end,
                RecentActivity.activity_type == 'sale'
            ).count()
            
            # Sum actual revenue from sales activities
            revenue_sum = self.db.query(func.sum(RecentActivity.amount)).filter(
                RecentActivity.timestamp >= month_start,
                RecentActivity.timestamp <= month_end,
                RecentActivity.activity_type == 'sale',
                RecentActivity.amount.isnot(None)
            ).scalar() or 0
            
            months.insert(0, month_start.strftime('%b'))
            sales_data.insert(0, activity_count)
            revenue_data.insert(0, float(revenue_sum) / 1000000)  # Convert to millions
        
        return {
            "labels": months,
            "sales": sales_data,
            "revenue": revenue_data
        }
    
    def get_notifications(self) -> List[Dict[str, Any]]:
        """Get recent notifications from database"""
        notifications = self.db.query(RecentActivity).filter(
            RecentActivity.is_active == True
        ).order_by(desc(RecentActivity.timestamp)).limit(5).all()
        
        return [
            {
                "id": activity.id,
                "title": sanitize_html(activity.action or ""),
                "message": sanitize_html(activity.description or ""),
                "time": self._format_timestamp(activity.timestamp)
            }
            for activity in notifications
        ]
    
    def _format_timestamp(self, timestamp: datetime) -> str:
        """Format timestamp to relative time"""
        now = utc_now()
        timestamp = ensure_timezone_aware(timestamp)
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def _format_metric_value(self, metric_name: str, value: float) -> str:
        """Format metric value based on type"""
        if metric_name in ['total_sales', 'avg_deal_size']:
            if value >= 1000000:
                return f"{value/1000000:.1f}M"
            elif value >= 1000:
                return f"{value/1000:.0f}K"
            return str(int(value))
        elif metric_name == 'conversion_rate':
            return f"{value:.1f}%"
        else:
            return f"{int(value):,}"
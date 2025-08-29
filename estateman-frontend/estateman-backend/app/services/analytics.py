from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..core.datetime_utils import utc_now
from ..core.validation import validate_id
from ..core.exceptions import NotFoundError
from ..models.analytics import AnalyticsEvent, PerformanceMetric, Report, ReportExecution, BusinessInsight, PredictionModel, AnomalyDetection, EventType
from ..schemas.analytics import AnalyticsEventCreate, PerformanceMetricCreate, ReportCreate, ReportUpdate
import json
import csv
import io

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def track_event(self, event_data: AnalyticsEventCreate, user_id: Optional[int] = None) -> AnalyticsEvent:
        event = AnalyticsEvent(
            **event_data.dict(),
            user_id=user_id
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(self, skip: int = 0, limit: int = 100, event_type: Optional[EventType] = None, user_id: Optional[int] = None) -> List[AnalyticsEvent]:
        query = self.db.query(AnalyticsEvent)
        if event_type:
            query = query.filter(AnalyticsEvent.event_type == event_type)
        if user_id:
            query = query.filter(AnalyticsEvent.user_id == user_id)
        return query.order_by(desc(AnalyticsEvent.timestamp)).offset(skip).limit(limit).all()

    def get_dashboard_analytics(self, days: int = 30) -> Dict[str, Any]:
        start_date = utc_now() - timedelta(days=days)
        
        # Total events
        total_events = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.timestamp >= start_date).count()
        
        # Unique users
        unique_users = self.db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.user_id.isnot(None)
        ).scalar() or 0
        
        # Page views
        page_views = self.db.query(AnalyticsEvent).filter(
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.event_type == EventType.PAGE_VIEW
        ).count()
        
        # Conversion rate (form submits / page views)
        form_submits = self.db.query(AnalyticsEvent).filter(
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.event_type == EventType.FORM_SUBMIT
        ).count()
        conversion_rate = (form_submits / page_views * 100) if page_views > 0 else 0
        
        # Top pages
        top_pages = self.db.query(
            AnalyticsEvent.page_url,
            func.count(AnalyticsEvent.id).label('views')
        ).filter(
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.event_type == EventType.PAGE_VIEW,
            AnalyticsEvent.page_url.isnot(None)
        ).group_by(AnalyticsEvent.page_url).order_by(desc('views')).limit(10).all()
        
        return {
            "total_events": total_events,
            "unique_users": unique_users,
            "page_views": page_views,
            "conversion_rate": round(conversion_rate, 2),
            "top_pages": [{"url": page.page_url, "views": page.views} for page in top_pages],
            "user_engagement": self._calculate_engagement_metrics(start_date),
            "performance_trends": self._get_performance_trends(start_date)
        }

    def _calculate_engagement_metrics(self, start_date: datetime) -> Dict[str, float]:
        # Average session duration (simplified)
        sessions = self.db.query(
            AnalyticsEvent.session_id,
            func.min(AnalyticsEvent.timestamp).label('start_time'),
            func.max(AnalyticsEvent.timestamp).label('end_time')
        ).filter(
            AnalyticsEvent.timestamp >= start_date
        ).group_by(AnalyticsEvent.session_id).all()
        
        total_duration = sum([(session.end_time - session.start_time).total_seconds() for session in sessions])
        avg_session_duration = (total_duration / len(sessions)) if sessions else 0
        
        return {
            "avg_session_duration": round(avg_session_duration / 60, 2),  # in minutes
            "bounce_rate": 25.5,  # Placeholder - would need more complex calculation
            "pages_per_session": 3.2  # Placeholder
        }

    def _get_performance_trends(self, start_date: datetime) -> List[Dict[str, Any]]:
        # Daily event counts for trend analysis
        daily_events = self.db.query(
            func.date(AnalyticsEvent.timestamp).label('date'),
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            AnalyticsEvent.timestamp >= start_date
        ).group_by(func.date(AnalyticsEvent.timestamp)).order_by('date').all()
        
        return [{"date": str(day.date), "events": day.count} for day in daily_events]

    def get_revenue_vs_target(self, days: int = 30) -> List[Dict[str, Any]]:
        from ..models.realtor import Transaction, Realtor
        
        start_date = utc_now() - timedelta(days=days)
        
        # Get monthly revenue from completed transactions
        monthly_revenue = self.db.query(
            func.date_trunc('month', Transaction.closing_date).label('month'),
            func.sum(Transaction.sale_price).label('revenue')
        ).filter(
            Transaction.closing_date >= start_date,
            Transaction.status == 'completed'
        ).group_by(func.date_trunc('month', Transaction.closing_date)).all()
        
        # Get monthly targets from realtors
        monthly_targets = self.db.query(
            func.date_trunc('month', func.now()).label('month'),
            func.sum(Realtor.monthly_target).label('target')
        ).filter(
            Realtor.status == 'active'
        ).group_by(func.date_trunc('month', func.now())).all()
        
        # Combine revenue and targets
        result = []
        revenue_dict = {str(r.month.date()): float(r.revenue or 0) for r in monthly_revenue}
        target_dict = {str(t.month.date()): float(t.target or 0) for t in monthly_targets}
        
        # Get all months in the period
        current_date = start_date.replace(day=1)
        while current_date <= utc_now():
            month_key = str(current_date.date())
            result.append({
                "month": current_date.strftime("%b %Y"),
                "revenue": revenue_dict.get(month_key, 0),
                "target": target_dict.get(month_key, 0)
            })
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        return result

class PerformanceMetricsService:
    def __init__(self, db: Session):
        self.db = db

    def create_metric(self, metric_data: PerformanceMetricCreate, user_id: Optional[int] = None) -> PerformanceMetric:
        metric = PerformanceMetric(**metric_data.dict(), user_id=user_id)
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric

    def get_metrics(self, category: Optional[str] = None, days: int = 30) -> List[PerformanceMetric]:
        start_date = utc_now() - timedelta(days=days)
        query = self.db.query(PerformanceMetric).filter(PerformanceMetric.period_start >= start_date)
        if category:
            query = query.filter(PerformanceMetric.metric_category == category)
        return query.order_by(desc(PerformanceMetric.calculated_at)).all()

class ReportingService:
    def __init__(self, db: Session):
        self.db = db

    def create_report(self, report_data: ReportCreate, user_id: int) -> Report:
        report = Report(**report_data.dict(), created_by=user_id)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_reports(self, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Report]:
        query = self.db.query(Report).filter(Report.is_active == True)
        if user_id:
            query = query.filter(Report.created_by == user_id)
        return query.order_by(desc(Report.created_at)).offset(skip).limit(limit).all()

    def get_report(self, report_id: int) -> Optional[Report]:
        return self.db.query(Report).filter(Report.id == report_id).first()

    def update_report(self, report_id: int, report_data: ReportUpdate) -> Optional[Report]:
        report = self.get_report(report_id)
        if not report:
            return None
        
        for field, value in report_data.dict(exclude_unset=True).items():
            setattr(report, field, value)
        
        report.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(report)
        return report

    def execute_report(self, report_id: int, file_format: str = "csv") -> ReportExecution:
        report = self.get_report(report_id)
        if not report:
            raise NotFoundError("Report")
        
        execution = ReportExecution(
            report_id=report_id,
            file_format=file_format,
            status="running",
            started_at=utc_now()
        )
        self.db.add(execution)
        self.db.commit()
        
        try:
            # Generate report data based on report type
            data = self._generate_report_data(report)
            file_path = self._save_report_file(data, execution.id, file_format)
            
            execution.status = "completed"
            execution.file_path = file_path
            execution.completed_at = utc_now()
            
        except Exception as e:
            execution.status = "failed"
            
        self.db.commit()
        self.db.refresh(execution)
        return execution

    def _generate_report_data(self, report: Report) -> List[Dict[str, Any]]:
        # Simplified report generation - would be more complex in production
        if report.report_type == "sales":
            return [{"date": "2024-01-01", "sales": 100000, "transactions": 5}]
        elif report.report_type == "commission":
            return [{"agent": "John Doe", "commission": 5000, "transactions": 3}]
        return []

    def _save_report_file(self, data: List[Dict[str, Any]], execution_id: int, file_format: str) -> str:
        file_path = f"reports/report_{execution_id}.{file_format}"
        # In production, would save to cloud storage
        return file_path

class BusinessIntelligenceService:
    def __init__(self, db: Session):
        self.db = db

    def generate_insights(self) -> List[BusinessInsight]:
        insights = []
        
        # Analyze user engagement
        engagement_insight = self._analyze_user_engagement()
        if engagement_insight:
            insights.append(engagement_insight)
        
        # Analyze page performance
        page_insight = self._analyze_page_performance()
        if page_insight:
            insights.append(page_insight)
        
        # Analyze conversion trends
        conversion_insight = self._analyze_conversion_trends()
        if conversion_insight:
            insights.append(conversion_insight)
        
        # Save insights to database
        for insight in insights:
            self.db.add(insight)
        
        self.db.commit()
        return insights

    def get_insights(self, skip: int = 0, limit: int = 10, active_only: bool = True) -> List[BusinessInsight]:
        query = self.db.query(BusinessInsight)
        if active_only:
            query = query.filter(BusinessInsight.is_active == True, BusinessInsight.is_dismissed == False)
        return query.order_by(desc(BusinessInsight.generated_at)).offset(skip).limit(limit).all()

    def _analyze_user_engagement(self) -> Optional[BusinessInsight]:
        # Analyze user engagement from events
        last_week = utc_now() - timedelta(days=7)
        last_month = utc_now() - timedelta(days=30)
        
        week_events = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.timestamp >= last_week).count()
        month_events = self.db.query(AnalyticsEvent).filter(AnalyticsEvent.timestamp >= last_month).count()
        
        if month_events == 0:
            return None
            
        weekly_avg = (month_events - week_events) / 3  # Average of previous 3 weeks
        
        if week_events > weekly_avg * 1.2:
            return BusinessInsight(
                insight_type="trend",
                title="User Engagement Increasing",
                description=f"User activity increased by {round((week_events - weekly_avg) / weekly_avg * 100, 1)}% this week",
                confidence_score=85.0,
                impact_level="high",
                data_source="user_analytics"
            )
        elif week_events < weekly_avg * 0.8:
            return BusinessInsight(
                insight_type="anomaly",
                title="User Engagement Declining",
                description=f"User activity decreased by {round((weekly_avg - week_events) / weekly_avg * 100, 1)}% this week",
                confidence_score=80.0,
                impact_level="medium",
                data_source="user_analytics"
            )
        return None

    def _analyze_page_performance(self) -> Optional[BusinessInsight]:
        # Analyze top performing pages
        last_week = utc_now() - timedelta(days=7)
        
        top_pages = self.db.query(
            AnalyticsEvent.page_url,
            func.count(AnalyticsEvent.id).label('views')
        ).filter(
            AnalyticsEvent.timestamp >= last_week,
            AnalyticsEvent.event_type == EventType.PAGE_VIEW,
            AnalyticsEvent.page_url.isnot(None)
        ).group_by(AnalyticsEvent.page_url).order_by(desc('views')).limit(3).all()
        
        if not top_pages:
            return None
            
        top_page = top_pages[0]
        return BusinessInsight(
            insight_type="recommendation",
            title="Top Performing Page Identified",
            description=f"Page '{top_page.page_url}' received {top_page.views} views this week. Consider optimizing similar content.",
            confidence_score=75.0,
            impact_level="medium",
            data_source="page_analytics"
        )

    def _analyze_conversion_trends(self) -> Optional[BusinessInsight]:
        # Analyze conversion rates
        last_week = utc_now() - timedelta(days=7)
        
        page_views = self.db.query(AnalyticsEvent).filter(
            AnalyticsEvent.timestamp >= last_week,
            AnalyticsEvent.event_type == EventType.PAGE_VIEW
        ).count()
        
        form_submits = self.db.query(AnalyticsEvent).filter(
            AnalyticsEvent.timestamp >= last_week,
            AnalyticsEvent.event_type == EventType.FORM_SUBMIT
        ).count()
        
        if page_views == 0:
            return None
            
        conversion_rate = (form_submits / page_views) * 100
        
        if conversion_rate > 5:
            return BusinessInsight(
                insight_type="trend",
                title="High Conversion Rate Detected",
                description=f"Conversion rate of {conversion_rate:.1f}% is above average. Current strategies are working well.",
                confidence_score=90.0,
                impact_level="high",
                data_source="conversion_analytics"
            )
        elif conversion_rate < 1:
            return BusinessInsight(
                insight_type="recommendation",
                title="Low Conversion Rate Alert",
                description=f"Conversion rate of {conversion_rate:.1f}% is below optimal. Consider A/B testing forms and CTAs.",
                confidence_score=85.0,
                impact_level="medium",
                data_source="conversion_analytics"
            )
        return None

class AnomalyDetectionService:
    def __init__(self, db: Session):
        self.db = db

    def detect_anomalies(self) -> List[AnomalyDetection]:
        anomalies = []
        
        # Check for metric anomalies
        metrics = self.db.query(PerformanceMetric).filter(
            PerformanceMetric.calculated_at >= utc_now() - timedelta(days=7)
        ).all()
        
        for metric in metrics:
            if metric.target_value and abs(metric.value - metric.target_value) > (metric.target_value * 0.2):
                anomaly = AnomalyDetection(
                    metric_name=metric.metric_name,
                    expected_value=metric.target_value,
                    actual_value=metric.value,
                    deviation_score=abs(metric.value - metric.target_value) / metric.target_value * 100,
                    anomaly_type="deviation",
                    severity="medium" if abs(metric.value - metric.target_value) < (metric.target_value * 0.5) else "high"
                )
                anomalies.append(anomaly)
                self.db.add(anomaly)
        
        self.db.commit()
        return anomalies

    def get_anomalies(self, skip: int = 0, limit: int = 50, unresolved_only: bool = True) -> List[AnomalyDetection]:
        query = self.db.query(AnomalyDetection)
        if unresolved_only:
            query = query.filter(AnomalyDetection.is_resolved == False)
        return query.order_by(desc(AnomalyDetection.detected_at)).offset(skip).limit(limit).all()
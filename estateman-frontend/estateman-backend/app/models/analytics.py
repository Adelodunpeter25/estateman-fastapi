from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class EventType(str, enum.Enum):
    PAGE_VIEW = "page_view"
    BUTTON_CLICK = "button_click"
    FORM_SUBMIT = "form_submit"
    PROPERTY_VIEW = "property_view"
    LEAD_CREATED = "lead_created"
    TRANSACTION_CREATED = "transaction_created"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    SEARCH_PERFORMED = "search_performed"
    DOCUMENT_DOWNLOAD = "document_download"

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String(255), index=True)
    event_type = Column(SQLEnum(EventType), nullable=False)
    event_name = Column(String(255), nullable=False)
    
    # Event data
    properties = Column(JSON)  # Custom event properties
    page_url = Column(String(500))
    referrer = Column(String(500))
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    
    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_category = Column(String(50), nullable=False)  # sales, marketing, user_engagement
    value = Column(Float, nullable=False)
    target_value = Column(Float)
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    period_type = Column(String(20), default="daily")  # daily, weekly, monthly, yearly
    
    # Metadata
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    report_type = Column(String(50), nullable=False)  # sales, commission, property, user
    
    # Report configuration
    filters = Column(JSON)  # Report filters and parameters
    columns = Column(JSON)  # Selected columns
    schedule = Column(JSON)  # Scheduling configuration
    
    # Status
    is_active = Column(Boolean, default=True)
    is_scheduled = Column(Boolean, default=False)
    last_generated = Column(DateTime(timezone=True))
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ReportExecution(Base):
    __tablename__ = "report_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    
    # Execution details
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    file_path = Column(String(500))
    file_format = Column(String(10), default="csv")  # csv, xlsx, pdf
    file_size = Column(Integer)
    
    # Timing
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    report = relationship("Report")

class BusinessInsight(Base):
    __tablename__ = "business_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    insight_type = Column(String(50), nullable=False)  # trend, anomaly, prediction, recommendation
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Insight data
    confidence_score = Column(Float, default=0.0)  # 0-100
    impact_level = Column(String(20), default="medium")  # low, medium, high, critical
    data_source = Column(String(100))  # Source of the insight
    supporting_data = Column(JSON)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_dismissed = Column(Boolean, default=False)
    
    # Metadata
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

class PredictionModel(Base):
    __tablename__ = "prediction_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # sales_forecast, lead_scoring, churn_prediction
    
    # Model configuration
    features = Column(JSON)  # Input features
    parameters = Column(JSON)  # Model parameters
    accuracy_score = Column(Float)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_trained = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AnomalyDetection(Base):
    __tablename__ = "anomaly_detections"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    expected_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    deviation_score = Column(Float, nullable=False)  # How much it deviates from normal
    
    # Anomaly details
    anomaly_type = Column(String(50))  # spike, drop, trend_change
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    description = Column(Text)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    
    # Metadata
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
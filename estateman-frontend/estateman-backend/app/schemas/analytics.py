from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.analytics import EventType

# Analytics Event Schemas
class AnalyticsEventBase(BaseModel):
    event_type: EventType
    event_name: str = Field(..., min_length=1, max_length=255)
    properties: Optional[Dict[str, Any]] = None
    page_url: Optional[str] = Field(None, max_length=500)
    referrer: Optional[str] = Field(None, max_length=500)

class AnalyticsEventCreate(AnalyticsEventBase):
    session_id: str = Field(..., max_length=255)
    user_agent: Optional[str] = Field(None, max_length=500)
    ip_address: Optional[str] = Field(None, max_length=45)

class AnalyticsEventResponse(AnalyticsEventBase):
    id: int
    user_id: Optional[int]
    session_id: str
    timestamp: datetime
    processed: bool

    class Config:
        from_attributes = True

# Performance Metric Schemas
class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., max_length=100)
    metric_category: str = Field(..., max_length=50)
    value: float
    target_value: Optional[float] = None
    period_type: str = Field(default="daily", max_length=20)

class PerformanceMetricCreate(PerformanceMetricBase):
    period_start: datetime
    period_end: datetime

class PerformanceMetricResponse(PerformanceMetricBase):
    id: int
    period_start: datetime
    period_end: datetime
    calculated_at: datetime
    user_id: Optional[int]

    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    report_type: str = Field(..., max_length=50)
    filters: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None

class ReportCreate(ReportBase):
    schedule: Optional[Dict[str, Any]] = None
    is_scheduled: bool = False

class ReportUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None
    schedule: Optional[Dict[str, Any]] = None
    is_scheduled: Optional[bool] = None
    is_active: Optional[bool] = None

class ReportResponse(ReportBase):
    id: int
    schedule: Optional[Dict[str, Any]]
    is_active: bool
    is_scheduled: bool
    last_generated: Optional[datetime]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Report Execution Schemas
class ReportExecutionResponse(BaseModel):
    id: int
    report_id: int
    status: str
    file_path: Optional[str]
    file_format: str
    file_size: Optional[int]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Business Insight Schemas
class BusinessInsightResponse(BaseModel):
    id: int
    insight_type: str
    title: str
    description: str
    confidence_score: float
    impact_level: str
    data_source: Optional[str]
    supporting_data: Optional[Dict[str, Any]]
    is_active: bool
    is_dismissed: bool
    generated_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

# Prediction Model Schemas
class PredictionModelResponse(BaseModel):
    model_config = {"protected_namespaces": (), "from_attributes": True}
    
    id: int
    model_name: str
    model_type: str
    features: Optional[Dict[str, Any]]
    parameters: Optional[Dict[str, Any]]
    accuracy_score: Optional[float]
    is_active: bool
    last_trained: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

# Anomaly Detection Schemas
class AnomalyDetectionResponse(BaseModel):
    id: int
    metric_name: str
    expected_value: float
    actual_value: float
    deviation_score: float
    anomaly_type: Optional[str]
    severity: str
    description: Optional[str]
    is_resolved: bool
    detected_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

# Dashboard Analytics Schemas
class DashboardAnalyticsResponse(BaseModel):
    total_events: int
    unique_users: int
    page_views: int
    conversion_rate: float
    top_pages: List[Dict[str, Any]]
    user_engagement: Dict[str, float]
    performance_trends: List[Dict[str, Any]]
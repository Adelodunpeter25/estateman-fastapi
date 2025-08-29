from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Team Management Schemas
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    team_lead_id: int
    tenant_id: Optional[int] = None
    team_target: Optional[float] = 0.0

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    team_lead_id: int
    tenant_id: Optional[int] = None
    total_members: int
    team_target: float
    team_earned: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    name: str
    realtor_id: str
    level: str
    status: str
    total_commissions: float
    monthly_target: float
    monthly_earned: float
    rating: float

class TeamHierarchyResponse(BaseModel):
    team_id: int
    team_name: str
    team_lead: Optional[Dict[str, Any]] = None
    members: List[TeamMemberResponse]
    total_members: int

# Performance Review Schemas
class PerformanceReviewCreate(BaseModel):
    realtor_id: int
    review_period_start: datetime
    review_period_end: datetime
    sales_performance: float
    client_satisfaction: float
    teamwork: float
    communication: float
    professionalism: float
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    goals: Optional[List[str]] = None
    comments: Optional[str] = None

class PerformanceReviewResponse(BaseModel):
    id: int
    realtor_id: int
    reviewer_id: int
    review_period_start: datetime
    review_period_end: datetime
    sales_performance: float
    client_satisfaction: float
    teamwork: float
    communication: float
    professionalism: float
    overall_score: float
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    goals: Optional[List[str]] = None
    comments: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PerformanceTrendsResponse(BaseModel):
    trends: List[Dict[str, Any]]
    latest_score: float
    improvement: float

# Goal Management Schemas
class GoalCreate(BaseModel):
    realtor_id: int
    title: str
    description: Optional[str] = None
    goal_type: str
    target_value: float
    unit: Optional[str] = None
    start_date: datetime
    target_date: datetime
    priority: Optional[str] = "medium"

class GoalResponse(BaseModel):
    id: int
    realtor_id: int
    title: str
    description: Optional[str] = None
    goal_type: str
    target_value: float
    current_value: float
    unit: Optional[str] = None
    start_date: datetime
    target_date: datetime
    completed_date: Optional[datetime] = None
    status: str
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True

class GoalProgressUpdate(BaseModel):
    current_value: float

class GoalSummaryResponse(BaseModel):
    total_goals: int
    completed_goals: int
    completion_rate: float
    progress_by_type: Dict[str, Dict[str, int]]

# Team Activity Schemas
class TeamActivityCreate(BaseModel):
    team_id: int
    activity_type: str
    title: str
    description: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: Optional[int] = 60
    location: Optional[str] = None
    is_virtual: Optional[bool] = False
    meeting_link: Optional[str] = None
    required_attendance: Optional[bool] = False

class TeamActivityResponse(BaseModel):
    id: int
    team_id: int
    activity_type: str
    title: str
    description: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: int
    location: Optional[str] = None
    is_virtual: bool
    meeting_link: Optional[str] = None
    required_attendance: bool
    attendees: Optional[List[int]] = None
    status: str
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
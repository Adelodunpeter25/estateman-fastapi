from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user, get_admin_user
from ....models.user import User
from ....services.team_management import TeamManagementService, PerformanceManagementService, GoalManagementService, TeamActivityService
from ....schemas.team import (
    TeamCreate, TeamResponse, TeamMemberResponse, TeamHierarchyResponse,
    PerformanceReviewCreate, PerformanceReviewResponse, PerformanceTrendsResponse,
    GoalCreate, GoalResponse, GoalProgressUpdate, GoalSummaryResponse,
    TeamActivityCreate, TeamActivityResponse
)

router = APIRouter()

# Team Management Endpoints
@router.post("/teams", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new realtor team"""
    service = TeamManagementService(db)
    team = service.create_team(team_data.dict())
    return team

@router.get("/teams", response_model=List[TeamResponse])
async def get_teams(
    tenant_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all teams"""
    service = TeamManagementService(db)
    teams = service.get_teams(tenant_id)
    return teams

@router.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team by ID"""
    service = TeamManagementService(db)
    team = service.get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.get("/teams/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a team"""
    service = TeamManagementService(db)
    members = service.get_team_members(team_id)
    return members

@router.get("/teams/{team_id}/hierarchy", response_model=TeamHierarchyResponse)
async def get_team_hierarchy(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team hierarchy structure"""
    service = TeamManagementService(db)
    hierarchy = service.get_team_hierarchy(team_id)
    if not hierarchy:
        raise HTTPException(status_code=404, detail="Team not found")
    return hierarchy

@router.post("/teams/{team_id}/assign/{realtor_id}")
async def assign_realtor_to_team(
    team_id: int,
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Assign realtor to team"""
    service = TeamManagementService(db)
    success = service.assign_to_team(realtor_id, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Realtor not found")
    return {"message": "Realtor assigned to team successfully"}

@router.delete("/teams/remove/{realtor_id}")
async def remove_realtor_from_team(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Remove realtor from team"""
    service = TeamManagementService(db)
    success = service.remove_from_team(realtor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Realtor not found")
    return {"message": "Realtor removed from team successfully"}

# Performance Management Endpoints
@router.post("/performance/reviews", response_model=PerformanceReviewResponse)
async def create_performance_review(
    review_data: PerformanceReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new performance review"""
    service = PerformanceManagementService(db)
    review_dict = review_data.dict()
    review_dict['reviewer_id'] = current_user.id
    review = service.create_performance_review(review_dict)
    return review

@router.get("/performance/reviews/{realtor_id}", response_model=List[PerformanceReviewResponse])
async def get_realtor_reviews(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all performance reviews for a realtor"""
    service = PerformanceManagementService(db)
    reviews = service.get_realtor_reviews(realtor_id)
    return reviews

@router.get("/performance/trends/{realtor_id}", response_model=PerformanceTrendsResponse)
async def get_performance_trends(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get performance trends for a realtor"""
    service = PerformanceManagementService(db)
    trends = service.get_performance_trends(realtor_id)
    return trends

# Goal Management Endpoints
@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new goal for a realtor"""
    service = GoalManagementService(db)
    goal = service.create_goal(goal_data.dict())
    return goal

@router.get("/goals/{realtor_id}", response_model=List[GoalResponse])
async def get_realtor_goals(
    realtor_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get goals for a realtor"""
    service = GoalManagementService(db)
    goals = service.get_realtor_goals(realtor_id, status)
    return goals

@router.put("/goals/{goal_id}/progress")
async def update_goal_progress(
    goal_id: int,
    progress_data: GoalProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update goal progress"""
    service = GoalManagementService(db)
    goal = service.update_goal_progress(goal_id, progress_data.current_value)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.get("/goals/{realtor_id}/summary", response_model=GoalSummaryResponse)
async def get_goal_summary(
    realtor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get goal progress summary for a realtor"""
    service = GoalManagementService(db)
    summary = service.get_goal_progress_summary(realtor_id)
    return summary

# Team Activity Endpoints
@router.post("/activities", response_model=TeamActivityResponse)
async def create_team_activity(
    activity_data: TeamActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new team activity"""
    service = TeamActivityService(db)
    activity_dict = activity_data.dict()
    activity_dict['created_by'] = current_user.id
    activity = service.create_activity(activity_dict)
    return activity

@router.get("/activities/{team_id}", response_model=List[TeamActivityResponse])
async def get_team_activities(
    team_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activities for a team"""
    service = TeamActivityService(db)
    activities = service.get_team_activities(team_id, limit)
    return activities

@router.get("/activities/{team_id}/upcoming", response_model=List[TeamActivityResponse])
async def get_upcoming_activities(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming activities for a team"""
    service = TeamActivityService(db)
    activities = service.get_upcoming_activities(team_id)
    return activities

@router.put("/activities/{activity_id}/complete")
async def mark_activity_completed(
    activity_id: int,
    attendees: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark activity as completed with attendee list"""
    service = TeamActivityService(db)
    activity = service.mark_activity_completed(activity_id, attendees)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity marked as completed"}
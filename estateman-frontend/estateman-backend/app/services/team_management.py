from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.realtor import RealtorTeam, PerformanceReview, RealtorGoal, TeamActivity, Realtor
from ..models.user import User

class TeamManagementService:
    def __init__(self, db: Session):
        self.db = db

    def create_team(self, team_data: Dict[str, Any]) -> RealtorTeam:
        """Create a new realtor team"""
        team = RealtorTeam(**team_data)
        self.db.add(team)
        self.db.commit()
        self.db.refresh(team)
        
        # Update team member count
        self._update_team_metrics(team.id)
        return team

    def get_teams(self, tenant_id: Optional[int] = None) -> List[RealtorTeam]:
        """Get all teams, optionally filtered by tenant"""
        query = self.db.query(RealtorTeam).filter(RealtorTeam.is_active == True)
        if tenant_id:
            query = query.filter(RealtorTeam.tenant_id == tenant_id)
        return query.all()

    def get_team_by_id(self, team_id: int) -> Optional[RealtorTeam]:
        """Get team by ID"""
        return self.db.query(RealtorTeam).filter(RealtorTeam.id == team_id).first()

    def get_team_members(self, team_id: int) -> List[Dict[str, Any]]:
        """Get all members of a team"""
        members = self.db.query(Realtor).join(User).filter(
            Realtor.team_id == team_id
        ).all()
        
        return [
            {
                "id": member.id,
                "user_id": member.user_id,
                "name": f"{member.user.first_name} {member.user.last_name}",
                "realtor_id": member.realtor_id,
                "level": member.level.value,
                "status": member.status.value,
                "total_commissions": member.total_commissions,
                "monthly_target": member.monthly_target,
                "monthly_earned": member.monthly_earned,
                "rating": member.rating
            }
            for member in members
        ]

    def assign_to_team(self, realtor_id: int, team_id: int) -> bool:
        """Assign realtor to team"""
        realtor = self.db.query(Realtor).filter(Realtor.id == realtor_id).first()
        if not realtor:
            return False
            
        realtor.team_id = team_id
        self.db.commit()
        
        # Update team metrics
        self._update_team_metrics(team_id)
        return True

    def remove_from_team(self, realtor_id: int) -> bool:
        """Remove realtor from team"""
        realtor = self.db.query(Realtor).filter(Realtor.id == realtor_id).first()
        if not realtor:
            return False
            
        old_team_id = realtor.team_id
        realtor.team_id = None
        self.db.commit()
        
        # Update old team metrics
        if old_team_id:
            self._update_team_metrics(old_team_id)
        return True

    def get_team_hierarchy(self, team_id: int) -> Dict[str, Any]:
        """Get team hierarchy structure"""
        team = self.get_team_by_id(team_id)
        if not team:
            return {}
            
        # Get team lead
        team_lead = self.db.query(Realtor).join(User).filter(
            Realtor.id == team.team_lead_id
        ).first()
        
        # Get all team members
        members = self.get_team_members(team_id)
        
        # Build hierarchy
        hierarchy = {
            "team_id": team.id,
            "team_name": team.name,
            "team_lead": {
                "id": team_lead.id,
                "name": f"{team_lead.user.first_name} {team_lead.user.last_name}",
                "level": team_lead.level.value
            } if team_lead else None,
            "members": members,
            "total_members": len(members)
        }
        
        return hierarchy

    def _update_team_metrics(self, team_id: int):
        """Update team performance metrics"""
        team = self.get_team_by_id(team_id)
        if not team:
            return
            
        # Count members
        member_count = self.db.query(Realtor).filter(Realtor.team_id == team_id).count()
        
        # Calculate team totals
        team_stats = self.db.query(
            func.sum(Realtor.monthly_target).label('total_target'),
            func.sum(Realtor.monthly_earned).label('total_earned')
        ).filter(Realtor.team_id == team_id).first()
        
        team.total_members = member_count
        team.team_target = team_stats.total_target or 0.0
        team.team_earned = team_stats.total_earned or 0.0
        
        self.db.commit()

class PerformanceManagementService:
    def __init__(self, db: Session):
        self.db = db

    def create_performance_review(self, review_data: Dict[str, Any]) -> PerformanceReview:
        """Create a new performance review"""
        # Calculate overall score
        scores = [
            review_data.get('sales_performance', 0),
            review_data.get('client_satisfaction', 0),
            review_data.get('teamwork', 0),
            review_data.get('communication', 0),
            review_data.get('professionalism', 0)
        ]
        review_data['overall_score'] = sum(scores) / len([s for s in scores if s > 0]) if any(scores) else 0
        
        review = PerformanceReview(**review_data)
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_realtor_reviews(self, realtor_id: int) -> List[PerformanceReview]:
        """Get all performance reviews for a realtor"""
        return self.db.query(PerformanceReview).filter(
            PerformanceReview.realtor_id == realtor_id
        ).order_by(desc(PerformanceReview.review_period_end)).all()

    def get_performance_trends(self, realtor_id: int) -> Dict[str, Any]:
        """Get performance trends for a realtor"""
        reviews = self.get_realtor_reviews(realtor_id)
        
        if not reviews:
            return {"trends": [], "latest_score": 0, "improvement": 0}
            
        trends = []
        for review in reviews[-6:]:  # Last 6 reviews
            trends.append({
                "period": review.review_period_end.strftime("%Y-%m"),
                "overall_score": review.overall_score,
                "sales_performance": review.sales_performance,
                "client_satisfaction": review.client_satisfaction
            })
        
        latest_score = reviews[0].overall_score if reviews else 0
        improvement = 0
        if len(reviews) >= 2:
            improvement = reviews[0].overall_score - reviews[1].overall_score
            
        return {
            "trends": trends,
            "latest_score": latest_score,
            "improvement": improvement
        }

class GoalManagementService:
    def __init__(self, db: Session):
        self.db = db

    def create_goal(self, goal_data: Dict[str, Any]) -> RealtorGoal:
        """Create a new goal for a realtor"""
        goal = RealtorGoal(**goal_data)
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_realtor_goals(self, realtor_id: int, status: Optional[str] = None) -> List[RealtorGoal]:
        """Get goals for a realtor"""
        query = self.db.query(RealtorGoal).filter(RealtorGoal.realtor_id == realtor_id)
        if status:
            query = query.filter(RealtorGoal.status == status)
        return query.order_by(desc(RealtorGoal.created_at)).all()

    def update_goal_progress(self, goal_id: int, current_value: float) -> Optional[RealtorGoal]:
        """Update goal progress"""
        goal = self.db.query(RealtorGoal).filter(RealtorGoal.id == goal_id).first()
        if not goal:
            return None
            
        goal.current_value = current_value
        
        # Check if goal is completed
        if current_value >= goal.target_value and goal.status == "active":
            goal.status = "completed"
            goal.completed_date = datetime.utcnow()
            
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_goal_progress_summary(self, realtor_id: int) -> Dict[str, Any]:
        """Get goal progress summary for a realtor"""
        goals = self.get_realtor_goals(realtor_id, "active")
        
        total_goals = len(goals)
        completed_goals = len([g for g in goals if g.status == "completed"])
        
        progress_by_type = {}
        for goal in goals:
            if goal.goal_type not in progress_by_type:
                progress_by_type[goal.goal_type] = {"total": 0, "completed": 0}
            progress_by_type[goal.goal_type]["total"] += 1
            if goal.status == "completed":
                progress_by_type[goal.goal_type]["completed"] += 1
                
        return {
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0,
            "progress_by_type": progress_by_type
        }

class TeamActivityService:
    def __init__(self, db: Session):
        self.db = db

    def create_activity(self, activity_data: Dict[str, Any]) -> TeamActivity:
        """Create a new team activity"""
        activity = TeamActivity(**activity_data)
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def get_team_activities(self, team_id: int, limit: int = 50) -> List[TeamActivity]:
        """Get activities for a team"""
        return self.db.query(TeamActivity).filter(
            TeamActivity.team_id == team_id
        ).order_by(desc(TeamActivity.scheduled_date)).limit(limit).all()

    def get_upcoming_activities(self, team_id: int) -> List[TeamActivity]:
        """Get upcoming activities for a team"""
        return self.db.query(TeamActivity).filter(
            TeamActivity.team_id == team_id,
            TeamActivity.scheduled_date >= datetime.utcnow(),
            TeamActivity.status == "scheduled"
        ).order_by(TeamActivity.scheduled_date).all()

    def mark_activity_completed(self, activity_id: int, attendees: List[int]) -> Optional[TeamActivity]:
        """Mark activity as completed with attendee list"""
        activity = self.db.query(TeamActivity).filter(TeamActivity.id == activity_id).first()
        if not activity:
            return None
            
        activity.status = "completed"
        activity.attendees = attendees
        activity.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(activity)
        return activity
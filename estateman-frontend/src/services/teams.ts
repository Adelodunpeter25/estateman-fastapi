import { api } from './api';

export interface Team {
  id: number;
  name: string;
  description?: string;
  team_lead_id?: number;
  tenant_id: number;
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: number;
  realtor_id: number;
  team_id: number;
  name: string;
  email: string;
  level: string;
  status: string;
  join_date: string;
  performance_score?: number;
}

export interface TeamHierarchy {
  team: Team;
  team_lead?: TeamMember;
  members: TeamMember[];
  sub_teams: TeamHierarchy[];
}

export interface PerformanceReview {
  id: number;
  realtor_id: number;
  reviewer_id: number;
  review_period_start: string;
  review_period_end: string;
  sales_performance: number;
  client_satisfaction: number;
  teamwork_score: number;
  communication_score: number;
  overall_rating: number;
  strengths: string;
  areas_for_improvement: string;
  goals_for_next_period: string;
  created_at: string;
}

export interface PerformanceTrends {
  realtor_id: number;
  monthly_trends: Array<{
    month: string;
    sales_performance: number;
    client_satisfaction: number;
    overall_rating: number;
  }>;
  improvement_areas: string[];
  achievements: string[];
}

export interface Goal {
  id: number;
  realtor_id: number;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at?: string;
}

export interface GoalSummary {
  realtor_id: number;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  overdue_goals: number;
  completion_rate: number;
  average_progress: number;
}

export interface TeamActivity {
  id: number;
  team_id: number;
  title: string;
  description: string;
  activity_type: 'meeting' | 'training' | 'event' | 'deadline';
  scheduled_date: string;
  duration_minutes?: number;
  location?: string;
  is_mandatory: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: number[];
  created_by: number;
  created_at: string;
}

export interface TeamCreateData {
  name: string;
  description?: string;
  team_lead_id?: number;
}

export interface PerformanceReviewCreateData {
  realtor_id: number;
  review_period_start: string;
  review_period_end: string;
  sales_performance: number;
  client_satisfaction: number;
  teamwork_score: number;
  communication_score: number;
  overall_rating: number;
  strengths: string;
  areas_for_improvement: string;
  goals_for_next_period: string;
}

export interface GoalCreateData {
  realtor_id: number;
  title: string;
  description: string;
  target_value: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TeamActivityCreateData {
  team_id: number;
  title: string;
  description: string;
  activity_type: 'meeting' | 'training' | 'event' | 'deadline';
  scheduled_date: string;
  duration_minutes?: number;
  location?: string;
  is_mandatory: boolean;
}

class TeamsService {
  // Team Management
  async getTeams(tenantId?: number): Promise<Team[]> {
    const params = tenantId ? { tenant_id: tenantId } : {};
    const response = await api.get('/team-management/teams', { params });
    return response.data;
  }

  async getTeam(teamId: number): Promise<Team> {
    const response = await api.get(`/team-management/teams/${teamId}`);
    return response.data;
  }

  async createTeam(data: TeamCreateData): Promise<Team> {
    const response = await api.post('/team-management/teams', data);
    return response.data;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await api.get(`/team-management/teams/${teamId}/members`);
    return response.data;
  }

  async getTeamHierarchy(teamId: number): Promise<TeamHierarchy> {
    const response = await api.get(`/team-management/teams/${teamId}/hierarchy`);
    return response.data;
  }

  async assignRealtorToTeam(teamId: number, realtorId: number): Promise<void> {
    await api.post(`/team-management/teams/${teamId}/assign/${realtorId}`);
  }

  async removeRealtorFromTeam(realtorId: number): Promise<void> {
    await api.delete(`/team-management/teams/remove/${realtorId}`);
  }

  // Performance Management
  async createPerformanceReview(data: PerformanceReviewCreateData): Promise<PerformanceReview> {
    const response = await api.post('/team-management/performance/reviews', data);
    return response.data;
  }

  async getRealtorReviews(realtorId: number): Promise<PerformanceReview[]> {
    const response = await api.get(`/team-management/performance/reviews/${realtorId}`);
    return response.data;
  }

  async getPerformanceTrends(realtorId: number): Promise<PerformanceTrends> {
    const response = await api.get(`/team-management/performance/trends/${realtorId}`);
    return response.data;
  }

  // Goal Management
  async createGoal(data: GoalCreateData): Promise<Goal> {
    const response = await api.post('/team-management/goals', data);
    return response.data;
  }

  async getRealtorGoals(realtorId: number, status?: string): Promise<Goal[]> {
    const params = status ? { status } : {};
    const response = await api.get(`/team-management/goals/${realtorId}`, { params });
    return response.data;
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<Goal> {
    const response = await api.put(`/team-management/goals/${goalId}/progress`, {
      current_value: currentValue
    });
    return response.data;
  }

  async getGoalSummary(realtorId: number): Promise<GoalSummary> {
    const response = await api.get(`/team-management/goals/${realtorId}/summary`);
    return response.data;
  }

  // Team Activities
  async createTeamActivity(data: TeamActivityCreateData): Promise<TeamActivity> {
    const response = await api.post('/team-management/activities', data);
    return response.data;
  }

  async getTeamActivities(teamId: number, limit: number = 50): Promise<TeamActivity[]> {
    const response = await api.get(`/team-management/activities/${teamId}`, {
      params: { limit }
    });
    return response.data;
  }

  async getUpcomingActivities(teamId: number): Promise<TeamActivity[]> {
    const response = await api.get(`/team-management/activities/${teamId}/upcoming`);
    return response.data;
  }

  async markActivityCompleted(activityId: number, attendees: number[]): Promise<void> {
    await api.put(`/team-management/activities/${activityId}/complete`, attendees);
  }
}

export const teamsService = new TeamsService();
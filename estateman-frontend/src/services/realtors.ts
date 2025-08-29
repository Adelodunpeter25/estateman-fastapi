import { api } from './api';

export interface Realtor {
  id: number;
  realtor_id: string;
  user_id: number;
  level: 'junior' | 'senior' | 'team_lead';
  status: 'active' | 'inactive' | 'suspended';
  total_clients: number;
  active_deals: number;
  total_commissions: number;
  monthly_target: number;
  monthly_earned: number;
  rating: number;
  specialties: string[];
  location?: string;
  license_number?: string;
  license_expiry?: string;
  commission_rate: number;
  split_percentage: number;
  join_date: string;
  created_at: string;
  updated_at?: string;
  // Team management fields
  team_id?: number;
  manager_id?: number;
  // Performance tracking fields
  ytd_commissions?: number;
  avg_deal_size?: number;
  conversion_rate?: number;
  client_satisfaction?: number;
  response_time_hours?: number;
}

export interface Commission {
  id: number;
  realtor_id: number;
  sale_price: number;
  commission_rate: number;
  gross_commission: number;
  split_percentage: number;
  net_commission: number;
  status: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
}

export interface RealtorAnalytics {
  total_realtors: number;
  active_realtors: number;
  total_commissions: number;
  average_rating: number;
  top_performers: Array<{
    id: number;
    name: string;
    realtor_id: string;
    total_commissions: number;
    level: string;
  }>;
}

export interface CommissionAnalytics {
  total_commission: number;
  pending_payouts: number;
  this_month: number;
  commission_rate: number;
  recent_commissions: Array<{
    id: number;
    realtor_name: string;
    sale_price: number;
    net_commission: number;
    status: string;
    created_at: string;
  }>;
}

export interface RealtorCreateData {
  name: string;
  email: string;
  phone?: string;
  level?: Realtor['level'];
  specialties?: string[];
  location?: string;
  license_number?: string;
  license_expiry?: string;
  monthly_target?: number;
  commission_rate?: number;
  split_percentage?: number;
}

export interface RealtorUpdateData {
  level?: Realtor['level'];
  status?: Realtor['status'];
  specialties?: string[];
  location?: string;
  license_number?: string;
  license_expiry?: string;
  monthly_target?: number;
  commission_rate?: number;
  split_percentage?: number;
  team_id?: number;
  manager_id?: number;
  ytd_commissions?: number;
  avg_deal_size?: number;
  conversion_rate?: number;
  client_satisfaction?: number;
  response_time_hours?: number;
}

export interface CommissionCreateData {
  realtor_id: number;
  sale_price: number;
  commission_rate: number;
  split_percentage: number;
  transaction_id?: number;
  property_id?: number;
  client_id?: number;
}

class RealtorsService {
  // Realtor methods
  async getRealtors(params?: {
    skip?: number;
    limit?: number;
    level?: Realtor['level'];
    status?: Realtor['status'];
    search?: string;
  }): Promise<Realtor[]> {
    const response = await api.get('/realtors/', { params });
    return response.data;
  }

  async getRealtor(realtorId: number): Promise<Realtor> {
    const response = await api.get(`/realtors/${realtorId}`);
    return response.data;
  }

  async createRealtor(data: RealtorCreateData): Promise<Realtor> {
    const response = await api.post('/realtors/', data);
    return response.data;
  }

  async updateRealtor(realtorId: number, data: RealtorUpdateData): Promise<Realtor> {
    const response = await api.put(`/realtors/${realtorId}`, data);
    return response.data;
  }

  async deleteRealtor(realtorId: number): Promise<void> {
    await api.delete(`/realtors/${realtorId}`);
  }

  async getRealtorAnalytics(): Promise<RealtorAnalytics> {
    const response = await api.get('/realtors/analytics/overview');
    return response.data;
  }

  async getRealtorPerformance(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/performance/${realtorId}`);
    return response.data;
  }

  // Commission methods
  async getCommissions(params?: {
    skip?: number;
    limit?: number;
    realtor_id?: number;
    status?: string;
  }): Promise<Commission[]> {
    const response = await api.get('/realtors/commissions/', { params });
    return response.data;
  }

  async createCommission(data: CommissionCreateData): Promise<Commission> {
    const response = await api.post('/realtors/commissions/', data);
    return response.data;
  }

  async getCommissionAnalytics(): Promise<CommissionAnalytics> {
    const response = await api.get('/realtors/commissions/analytics/overview');
    return response.data;
  }

  async calculateCommission(salePrice: number, rate: number, split: number): Promise<any> {
    const response = await api.post('/realtors/commissions/calculate', null, {
      params: { sale_price: salePrice, rate, split }
    });
    return response.data;
  }

  async getRealtorsDropdown(search?: string): Promise<Array<{id: number, name: string, realtor_id: string}>> {
    try {
      console.log('Fetching realtors dropdown with search:', search);
      const response = await api.get('/realtors/dropdown', { params: search ? { search } : {} });
      console.log('Realtors dropdown response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Realtors dropdown error:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        params: error?.config?.params
      });
      throw error;
    }
  }

  // Enhanced realtor profile methods
  async getRealtorProfile(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/${realtorId}/profile`);
    return response.data;
  }

  async updateRealtorProfile(realtorId: number, data: any): Promise<Realtor> {
    const response = await api.put(`/realtors/${realtorId}/profile`, data);
    return response.data;
  }

  async getRealtorTeamInfo(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/${realtorId}/team`);
    return response.data;
  }

  async getRealtorPerformanceMetrics(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/${realtorId}/performance-metrics`);
    return response.data;
  }

  // Events methods
  async getEvents(): Promise<any[]> {
    const response = await api.get('/realtors/events');
    return response.data;
  }

  async registerForEvent(eventId: number): Promise<any> {
    const response = await api.post(`/realtors/events/${eventId}/register`);
    return response.data;
  }

  // Marketing methods
  async getMarketingMaterials(): Promise<any[]> {
    const response = await api.get('/realtors/marketing/materials');
    return response.data;
  }

  async getRealtorCampaigns(realtorId: number): Promise<any[]> {
    const response = await api.get(`/realtors/${realtorId}/marketing/campaigns`);
    return response.data;
  }

  // Leaderboard methods
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const response = await api.get('/realtors/leaderboard', { params: { limit } });
    return response.data;
  }

  async getRealtorRanking(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/${realtorId}/ranking`);
    return response.data;
  }

  // Additional methods for portal data
  async getAnnouncements(): Promise<any[]> {
    const response = await api.get('/announcements');
    return response.data;
  }

  async getRealtorLeads(realtorId: number): Promise<any[]> {
    const response = await api.get(`/realtors/${realtorId}/leads`);
    return response.data;
  }

  async getRealtorSalesData(realtorId: number): Promise<any> {
    const response = await api.get(`/realtors/${realtorId}/sales-data`);
    return response.data;
  }

  async getCommissionHistory(realtorId: number): Promise<any[]> {
    const response = await api.get(`/realtors/${realtorId}/commission-history`);
    return response.data;
  }

  async getNetworkMembers(realtorId: number): Promise<any[]> {
    const response = await api.get(`/realtors/${realtorId}/network-members`);
    return response.data;
  }

  async getNotifications(realtorId: number): Promise<any[]> {
    const response = await api.get(`/realtors/${realtorId}/notifications`);
    return response.data;
  }

  async invitePartner(realtorId: number, inviteData: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }): Promise<any> {
    const response = await api.post(`/realtors/${realtorId}/invite-partner`, inviteData);
    return response.data;
  }

  async createCampaign(realtorId: number, campaignData: {
    name: string;
    type: string;
    target_audience: string;
    message: string;
    schedule_date?: string;
  }): Promise<any> {
    const response = await api.post(`/realtors/${realtorId}/marketing/campaigns`, campaignData);
    return response.data;
  }
}

export const realtorsService = new RealtorsService();
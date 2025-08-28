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
    const response = await api.get('/realtors/dropdown', { params: { search } });
    return response.data;
  }
}

export const realtorsService = new RealtorsService();
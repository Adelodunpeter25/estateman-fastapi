import { api } from './api';

export interface Client {
  id: number;
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'lead' | 'converted';
  lead_score: number;
  engagement_level: string;
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_spent: number;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_interests?: string[];
  assigned_agent_id?: number;
  lead_source?: string;
  referral_code?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  last_contact_date?: string;
}

export interface Lead {
  id: number;
  lead_id: string;
  client_id: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  temperature: 'hot' | 'warm' | 'cold';
  score: number;
  source?: string;
  source_details?: Record<string, any>;
  campaign_id?: string;
  interested_property_id?: number;
  property_requirements?: Record<string, any>;
  qualification_date?: string;
  conversion_date?: string;
  expected_close_date?: string;
  actual_close_date?: string;
  estimated_value?: number;
  actual_value?: number;
  assigned_agent_id?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientInteraction {
  id: number;
  client_id: number;
  agent_id: number;
  type: 'email' | 'phone' | 'sms' | 'whatsapp' | 'meeting' | 'note';
  subject?: string;
  content?: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  interaction_metadata?: Record<string, any>;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  client_id: number;
  type: string;
  points: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  expires_at?: string;
  created_at: string;
}

export interface ClientAnalytics {
  total_clients: number;
  active_clients: number;
  leads_count: number;
  conversion_rate: number;
  average_lead_score: number;
  total_loyalty_points: number;
  top_lead_sources: Array<{ source: string; count: number }>;
}

export interface LeadPipeline {
  stage: string;
  count: number;
  value: number;
}

export interface ClientCreateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_interests?: string[];
  lead_source?: string;
  referral_code?: string;
  tags?: string[];
  notes?: string;
  assigned_agent_id?: number;
}

export interface ClientUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status?: Client['status'];
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_interests?: string[];
  assigned_agent_id?: number;
  tags?: string[];
  notes?: string;
}

export interface LeadCreateData {
  client_id: number;
  source?: string;
  source_details?: Record<string, any>;
  campaign_id?: string;
  interested_property_id?: number;
  property_requirements?: Record<string, any>;
  expected_close_date?: string;
  estimated_value?: number;
  notes?: string;
  assigned_agent_id?: number;
}

export interface LeadUpdateData {
  status?: Lead['status'];
  temperature?: Lead['temperature'];
  score?: number;
  source?: string;
  interested_property_id?: number;
  property_requirements?: Record<string, any>;
  expected_close_date?: string;
  estimated_value?: number;
  actual_value?: number;
  assigned_agent_id?: number;
  notes?: string;
}

export interface InteractionCreateData {
  type: ClientInteraction['type'];
  subject?: string;
  content?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  interaction_metadata?: Record<string, any>;
}

class ClientsService {
  // Client methods
  async getClients(params?: {
    skip?: number;
    limit?: number;
    status?: Client['status'];
    assigned_agent_id?: number;
    search?: string;
  }): Promise<Client[]> {
    const response = await api.get('/clients/', { params });
    return response.data;
  }

  async getClient(clientId: number): Promise<Client> {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  }

  async createClient(data: ClientCreateData): Promise<Client> {
    const response = await api.post('/clients/', data);
    return response.data;
  }

  async updateClient(clientId: number, data: ClientUpdateData): Promise<Client> {
    const response = await api.put(`/clients/${clientId}`, data);
    return response.data;
  }

  async deleteClient(clientId: number): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  }

  async getClientAnalytics(): Promise<ClientAnalytics> {
    const response = await api.get('/clients/analytics/overview');
    return response.data;
  }

  // Lead methods
  async getLeads(params?: {
    skip?: number;
    limit?: number;
    status?: Lead['status'];
    temperature?: Lead['temperature'];
    assigned_agent_id?: number;
  }): Promise<Lead[]> {
    const response = await api.get('/clients/leads/', { params });
    return response.data;
  }

  async getLead(leadId: number): Promise<Lead> {
    const response = await api.get(`/clients/leads/${leadId}`);
    return response.data;
  }

  async createLead(data: LeadCreateData): Promise<Lead> {
    const response = await api.post('/clients/leads/', data);
    return response.data;
  }

  async updateLead(leadId: number, data: LeadUpdateData): Promise<Lead> {
    const response = await api.put(`/clients/leads/${leadId}`, data);
    return response.data;
  }

  async getLeadPipeline(): Promise<LeadPipeline[]> {
    const response = await api.get('/clients/leads/analytics/pipeline');
    return response.data;
  }

  // Interaction methods
  async createInteraction(clientId: number, data: InteractionCreateData): Promise<ClientInteraction> {
    const response = await api.post(`/clients/${clientId}/interactions/`, data);
    return response.data;
  }

  async getClientInteractions(clientId: number): Promise<ClientInteraction[]> {
    const response = await api.get(`/clients/${clientId}/interactions/`);
    return response.data;
  }

  async getClientTimeline(clientId: number): Promise<any[]> {
    const response = await api.get(`/clients/${clientId}/timeline/`);
    return response.data;
  }

  // Loyalty methods
  async addLoyaltyPoints(
    clientId: number,
    points: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<void> {
    await api.post(`/clients/${clientId}/loyalty/add-points/`, null, {
      params: { points, description, reference_type: referenceType, reference_id: referenceId }
    });
  }

  async redeemLoyaltyPoints(clientId: number, points: number, description: string): Promise<void> {
    await api.post(`/clients/${clientId}/loyalty/redeem-points/`, null, {
      params: { points, description }
    });
  }

  async getLoyaltyTransactions(clientId: number): Promise<LoyaltyTransaction[]> {
    const response = await api.get(`/clients/${clientId}/loyalty/transactions/`);
    return response.data;
  }
}

export const clientsService = new ClientsService();
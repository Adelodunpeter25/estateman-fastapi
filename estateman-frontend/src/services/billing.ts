import { api } from './api';

export interface TenantBilling {
  id: number;
  tenant_id: number;
  billing_period_start: string;
  billing_period_end: string;
  subscription_fee: number;
  usage_fee: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  churn_rate: number;
  average_revenue_per_user: number;
  growth_rate: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
}

export interface CrossTenantReport {
  total_tenants: number;
  active_tenants: number;
  total_revenue: number;
  total_users: number;
  total_properties: number;
  total_transactions: number;
  platform_metrics: {
    daily_active_users: number;
    monthly_active_users: number;
    average_session_duration: number;
    feature_usage: Record<string, number>;
  };
}

class BillingService {
  // Tenant Billing
  async getTenantBilling(tenantId?: number): Promise<TenantBilling[]> {
    const params = tenantId ? { tenant_id: tenantId } : {};
    const response = await api.get('/tenant-billing/billing', { params });
    return response.data;
  }

  async createBilling(data: any): Promise<TenantBilling> {
    const response = await api.post('/tenant-billing/billing', data);
    return response.data;
  }

  async updateBillingStatus(billingId: number, status: string): Promise<TenantBilling> {
    const response = await api.put(`/tenant-billing/billing/${billingId}/status`, { status });
    return response.data;
  }

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    const response = await api.get('/tenant-billing/analytics/revenue');
    return response.data;
  }

  // Cross-Tenant Reporting
  async getCrossTenantReport(): Promise<CrossTenantReport> {
    const response = await api.get('/tenant-billing/cross-tenant/report');
    return response.data;
  }

  async getTenantComparison(): Promise<any> {
    const response = await api.get('/tenant-billing/cross-tenant/comparison');
    return response.data;
  }

  async getPlatformMetrics(): Promise<any> {
    const response = await api.get('/tenant-billing/cross-tenant/platform-metrics');
    return response.data;
  }
}

export const billingService = new BillingService();
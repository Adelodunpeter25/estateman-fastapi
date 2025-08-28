import { api } from './api'

export interface DashboardMetric {
  value: string
  change: number
  type: 'increase' | 'decrease' | 'neutral'
}

export interface DashboardOverview {
  total_sales?: DashboardMetric
  active_realtors: DashboardMetric
  properties_listed?: DashboardMetric
  conversion_rate?: DashboardMetric
  monthly_leads?: DashboardMetric
  active_clients: DashboardMetric
  avg_deal_size?: DashboardMetric
  events_scheduled?: DashboardMetric
}

export interface RecentActivity {
  id: number
  user_name: string
  action: string
  description: string
  timestamp: string
  activity_type: string
  amount?: number
}

export interface TopPerformer {
  id: number
  name: string
  sales: number
  revenue: number
  commission: number
  avatar?: string
}

export interface ChartData {
  labels: string[]
  sales: number[]
  revenue: number[]
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<DashboardOverview>('/dashboard/overview')
    return response.data
  },

  async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await api.get<{ activities: RecentActivity[] }>('/dashboard/activities')
    return response.data.activities
  },

  async getTopPerformers(): Promise<TopPerformer[]> {
    const response = await api.get<{ performers: TopPerformer[] }>('/dashboard/top-performers')
    return response.data.performers
  },

  async getChartData(): Promise<ChartData> {
    const response = await api.get<ChartData>('/dashboard/chart-data')
    return response.data
  },

  async getNotifications(): Promise<any[]> {
    const response = await api.get<{ notifications: any[] }>('/dashboard/notifications')
    return response.data.notifications
  }
}
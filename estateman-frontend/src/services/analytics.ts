import { api } from './api'

export interface AnalyticsEvent {
  id: number
  event_type: string
  event_name: string
  properties?: Record<string, any>
  page_url?: string
  referrer?: string
  timestamp: string
  user_id?: number
}

export interface PerformanceMetric {
  id: number
  metric_name: string
  metric_category: string
  value: number
  target_value?: number
  period_start: string
  period_end: string
  period_type: string
}

export interface Report {
  id: number
  name: string
  description?: string
  report_type: string
  filters?: Record<string, any>
  columns?: string[]
  is_active: boolean
  is_scheduled: boolean
  last_generated?: string
  created_at: string
}

export interface BusinessInsight {
  id: number
  insight_type: string
  title: string
  description: string
  confidence_score: number
  impact_level: string
  data_source?: string
  is_active: boolean
  is_dismissed: boolean
  generated_at: string
}

export interface DashboardAnalytics {
  total_events: number
  unique_users: number
  page_views: number
  conversion_rate: number
  top_pages: Array<{ url: string; views: number }>
  user_engagement: {
    avg_session_duration: number
    bounce_rate: number
    pages_per_session: number
  }
  performance_trends: Array<{ date: string; events: number }>
}

export interface RevenueVsTarget {
  month: string
  revenue: number
  target: number
}

export const analyticsService = {
  // Event Tracking
  trackEvent: async (eventData: {
    event_type: string
    event_name: string
    session_id: string
    properties?: Record<string, any>
    page_url?: string
    referrer?: string
    user_agent?: string
  }): Promise<AnalyticsEvent> => {
    const response = await api.post('/analytics/events', eventData)
    return response.data
  },

  getEvents: async (params?: {
    skip?: number
    limit?: number
    event_type?: string
    user_id?: number
  }): Promise<AnalyticsEvent[]> => {
    const response = await api.get('/analytics/events', { params })
    return response.data
  },

  // Dashboard Analytics
  getDashboardAnalytics: async (days: number = 30): Promise<DashboardAnalytics> => {
    const response = await api.get(`/analytics/dashboard?days=${days}`)
    return response.data
  },

  getRevenueVsTarget: async (days: number = 180): Promise<Array<{ month: string; revenue: number; target: number }>> => {
    const response = await api.get(`/analytics/revenue-vs-target?days=${days}`)
    return response.data
  },

  // Performance Metrics
  createMetric: async (metricData: {
    metric_name: string
    metric_category: string
    value: number
    target_value?: number
    period_start: string
    period_end: string
    period_type?: string
  }): Promise<PerformanceMetric> => {
    const response = await api.post('/analytics/metrics', metricData)
    return response.data
  },

  getMetrics: async (params?: {
    category?: string
    days?: number
  }): Promise<PerformanceMetric[]> => {
    const response = await api.get('/analytics/metrics', { params })
    return response.data
  },

  // Reports
  createReport: async (reportData: {
    name: string
    description?: string
    report_type: string
    filters?: Record<string, any>
    columns?: string[]
    schedule?: Record<string, any>
    is_scheduled?: boolean
  }): Promise<Report> => {
    const response = await api.post('/analytics/reports', reportData)
    return response.data
  },

  getReports: async (params?: {
    skip?: number
    limit?: number
  }): Promise<Report[]> => {
    const response = await api.get('/analytics/reports', { params })
    return response.data
  },

  executeReport: async (reportId: number, fileFormat: string = 'csv') => {
    const response = await api.post(`/analytics/reports/${reportId}/execute?file_format=${fileFormat}`)
    return response.data
  },

  // Business Intelligence
  generateInsights: async (): Promise<BusinessInsight[]> => {
    const response = await api.post('/analytics/insights/generate')
    return response.data
  },

  getInsights: async (params?: {
    skip?: number
    limit?: number
    active_only?: boolean
  }): Promise<BusinessInsight[]> => {
    const response = await api.get('/analytics/insights', { params })
    return response.data
  },

  // Anomaly Detection
  detectAnomalies: async () => {
    const response = await api.post('/analytics/anomalies/detect')
    return response.data
  },

  getAnomalies: async (params?: {
    skip?: number
    limit?: number
    unresolved_only?: boolean
  }) => {
    const response = await api.get('/analytics/anomalies', { params })
    return response.data
  }
}

// Event tracking helper
export const trackPageView = (page: string) => {
  const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7)
  sessionStorage.setItem('session_id', sessionId)
  
  analyticsService.trackEvent({
    event_type: 'page_view',
    event_name: 'Page View',
    session_id: sessionId,
    page_url: window.location.href,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    properties: { page }
  }).catch(console.error)
}

export const trackButtonClick = (buttonName: string, context?: Record<string, any>) => {
  const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7)
  
  analyticsService.trackEvent({
    event_type: 'button_click',
    event_name: 'Button Click',
    session_id: sessionId,
    page_url: window.location.href,
    properties: { button_name: buttonName, ...context }
  }).catch(console.error)
}
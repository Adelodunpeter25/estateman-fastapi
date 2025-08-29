import { api } from './api'

export interface Notification {
  id: number
  title: string
  message: string
  notification_type: 'success' | 'info' | 'warning' | 'error'
  category: 'Sales' | 'Leads' | 'Finance' | 'Events' | 'Team' | 'System'
  user_id?: number
  role_target?: string
  is_read: boolean
  is_sent: boolean
  data?: Record<string, any>
  created_at: string
  read_at?: string
}

export interface NotificationPreference {
  id: number
  user_id: number
  category: 'Sales' | 'Leads' | 'Finance' | 'Events' | 'Team' | 'System'
  channel: 'in_app' | 'email' | 'push' | 'sms'
  is_enabled: boolean
  created_at: string
  updated_at?: string
}

export const notificationService = {
  createNotification: async (notificationData: {
    title: string
    message: string
    notification_type?: string
    category: string
    user_id?: number
    role_target?: string
    data?: Record<string, any>
  }): Promise<Notification> => {
    const response = await api.post('/notifications/notifications', notificationData)
    return response.data
  },

  getNotifications: async (params?: {
    skip?: number
    limit?: number
    unread_only?: boolean
  }): Promise<Notification[]> => {
    const response = await api.get('/notifications/notifications', { params })
    return response.data
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await api.put(`/notifications/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put('/notifications/notifications/read-all')
    return response.data
  },

  getNotificationStats: async (): Promise<{
    total: number
    unread: number
    categories: Record<string, number>
  }> => {
    const response = await api.get('/notifications/notifications/stats')
    return response.data
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await api.get('/notifications/notifications/preferences')
    return response.data
  },

  updatePreference: async (
    category: string,
    channel: string,
    isEnabled: boolean
  ): Promise<NotificationPreference> => {
    const response = await api.put(
      `/notifications/notifications/preferences/${category}/${channel}`,
      { is_enabled: isEnabled }
    )
    return response.data
  },

  createDefaultPreferences: async (): Promise<{ message: string }> => {
    const response = await api.post('/notifications/notifications/preferences/defaults')
    return response.data
  }
}
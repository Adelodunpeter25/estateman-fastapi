import { api } from './api'

export interface Newsletter {
  id: number
  title: string
  subject: string
  content?: string
  html_content?: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  type: string
  scheduled_at?: string
  sent_at?: string
  total_recipients: number
  total_opens: number
  total_clicks: number
  total_bounces: number
  total_unsubscribes: number
  template_id?: number
  created_by?: number
  created_at: string
  updated_at?: string
}

export interface NewsletterCreate {
  title: string
  subject: string
  content?: string
  html_content?: string
  type?: string
  scheduled_at?: string
  template_id?: number
}

export interface EmailTemplate {
  id: number
  name: string
  description?: string
  category: string
  html_content: string
  variables?: Record<string, any>
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface EmailTemplateCreate {
  name: string
  description?: string
  category?: string
  html_content: string
  variables?: Record<string, any>
}

export interface Subscriber {
  id: number
  email: string
  first_name?: string
  last_name?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  segments?: string[]
  preferences?: Record<string, any>
  total_opens: number
  total_clicks: number
  last_activity?: string
  subscribed_at: string
  unsubscribed_at?: string
}

export interface SubscriberCreate {
  email: string
  first_name?: string
  last_name?: string
  segments?: string[]
  preferences?: Record<string, any>
}

export interface NewsletterStats {
  total_subscribers: number
  campaigns_sent: number
  avg_open_rate: number
  avg_click_rate: number
  total_bounces: number
  total_unsubscribes: number
}

export interface SubscriberSegment {
  segment: string
  count: number
  growth: number
  active: boolean
}

export const newsletterService = {
  // Newsletter methods
  async getNewsletters(params?: { skip?: number; limit?: number; status?: string }) {
    try {
      const response = await api.get('/newsletters/newsletters', { params })
      return response.data as Newsletter[]
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
      throw error
    }
  },

  async getNewsletter(id: number) {
    try {
      const response = await api.get(`/newsletters/newsletters/${id}`)
      return response.data as Newsletter
    } catch (error) {
      console.error('Failed to fetch newsletter:', error)
      throw error
    }
  },

  async createNewsletter(data: NewsletterCreate) {
    try {
      const response = await api.post('/newsletters/newsletters', data)
      return response.data as Newsletter
    } catch (error) {
      console.error('Failed to create newsletter:', error)
      throw error
    }
  },

  async updateNewsletter(id: number, data: Partial<NewsletterCreate>) {
    try {
      const response = await api.put(`/newsletters/newsletters/${id}`, data)
      return response.data as Newsletter
    } catch (error) {
      console.error('Failed to update newsletter:', error)
      throw error
    }
  },

  async deleteNewsletter(id: number) {
    try {
      await api.delete(`/newsletters/newsletters/${id}`)
    } catch (error) {
      console.error('Failed to delete newsletter:', error)
      throw error
    }
  },

  async sendNewsletter(id: number) {
    try {
      const response = await api.post(`/newsletters/newsletters/${id}/send`)
      return response.data as Newsletter
    } catch (error) {
      console.error('Failed to send newsletter:', error)
      throw error
    }
  },

  async getNewsletterStats() {
    try {
      const response = await api.get('/newsletters/newsletters/stats')
      return response.data as NewsletterStats
    } catch (error) {
      console.error('Failed to fetch newsletter stats:', error)
      throw error
    }
  },

  // Template methods
  async getTemplates(category?: string) {
    try {
      const response = await api.get('/newsletters/templates', { params: { category } })
      return response.data as EmailTemplate[]
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      throw error
    }
  },

  async getTemplate(id: number) {
    try {
      const response = await api.get(`/newsletters/templates/${id}`)
      return response.data as EmailTemplate
    } catch (error) {
      console.error('Failed to fetch template:', error)
      throw error
    }
  },

  async createTemplate(data: EmailTemplateCreate) {
    try {
      const response = await api.post('/newsletters/templates', data)
      return response.data as EmailTemplate
    } catch (error) {
      console.error('Failed to create template:', error)
      throw error
    }
  },

  async updateTemplate(id: number, data: Partial<EmailTemplateCreate>) {
    try {
      const response = await api.put(`/newsletters/templates/${id}`, data)
      return response.data as EmailTemplate
    } catch (error) {
      console.error('Failed to update template:', error)
      throw error
    }
  },

  // Subscriber methods
  async getSubscribers(params?: { skip?: number; limit?: number; status?: string; segment?: string }) {
    try {
      const response = await api.get('/newsletters/subscribers', { params })
      return response.data as Subscriber[]
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
      throw error
    }
  },

  async getSubscriber(id: number) {
    try {
      const response = await api.get(`/newsletters/subscribers/${id}`)
      return response.data as Subscriber
    } catch (error) {
      console.error('Failed to fetch subscriber:', error)
      throw error
    }
  },

  async createSubscriber(data: SubscriberCreate) {
    try {
      const response = await api.post('/newsletters/subscribers', data)
      return response.data as Subscriber
    } catch (error) {
      console.error('Failed to create subscriber:', error)
      throw error
    }
  },

  async updateSubscriber(id: number, data: Partial<SubscriberCreate>) {
    try {
      const response = await api.put(`/newsletters/subscribers/${id}`, data)
      return response.data as Subscriber
    } catch (error) {
      console.error('Failed to update subscriber:', error)
      throw error
    }
  },

  async unsubscribe(email: string) {
    try {
      await api.post('/newsletters/subscribers/unsubscribe', null, { params: { email } })
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      throw error
    }
  },

  async getSubscriberSegments() {
    try {
      const response = await api.get('/newsletters/subscribers/segments')
      return response.data as SubscriberSegment[]
    } catch (error) {
      console.error('Failed to fetch subscriber segments:', error)
      throw error
    }
  },

  async getAnalytics() {
    try {
      const response = await api.get('/newsletters/analytics')
      return response.data
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  }
}
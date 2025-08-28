import { api } from './api'

export type CampaignType = 'email' | 'sms' | 'social_media' | 'paid_ads' | 'newsletter'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
export type TargetAudience = 'luxury_buyers' | 'first_time_buyers' | 'commercial_clients' | 'investors' | 'all_clients'

export interface CampaignContent {
  subject?: string
  template?: string
  sections?: string[]
  platforms?: string[]
  post_type?: string
  hashtags?: string[]
  [key: string]: unknown
}

export interface Campaign {
  id: number
  title: string
  description?: string
  campaign_type: CampaignType
  status: CampaignStatus
  target_audience: TargetAudience
  content?: CampaignContent
  start_date?: string
  end_date?: string
  total_reach: number
  total_clicks: number
  total_opens: number
  total_conversions: number
  budget: number
  spent: number
  created_at: string
  updated_at?: string
}

export interface CampaignCreate {
  title: string
  description?: string
  campaign_type: CampaignType
  target_audience: TargetAudience
  content?: CampaignContent
  start_date?: string
  end_date?: string
  budget?: number
  template_id?: number
}

export interface CampaignStats {
  active_campaigns: number
  total_reach: number
  avg_engagement: number
  leads_generated: number
  total_budget: number
  total_spent: number
}

export interface MarketingMaterial {
  id: number
  name: string
  description?: string
  category: string
  file_type: string
  file_url: string
  file_size?: number
  download_count: number
  view_count: number
  tags?: string[]
  is_active: boolean
  created_at: string
  updated_at?: string
}

export const marketingService = {
  // Campaign methods
  async getCampaigns(params?: { skip?: number; limit?: number; status?: string }) {
    try {
      const response = await api.get('/marketing/campaigns', { params })
      return response.data as Campaign[]
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      throw error
    }
  },

  async getCampaign(id: number) {
    try {
      const response = await api.get(`/marketing/campaigns/${id}`)
      return response.data as Campaign
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      throw error
    }
  },

  async createCampaign(data: CampaignCreate) {
    try {
      const response = await api.post('/marketing/campaigns', data)
      return response.data as Campaign
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  },

  async updateCampaign(id: number, data: Partial<CampaignCreate>) {
    try {
      const response = await api.put(`/marketing/campaigns/${id}`, data)
      return response.data as Campaign
    } catch (error) {
      console.error('Failed to update campaign:', error)
      throw error
    }
  },

  async deleteCampaign(id: number) {
    try {
      await api.delete(`/marketing/campaigns/${id}`)
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      throw error
    }
  },

  async getCampaignStats() {
    try {
      const response = await api.get('/marketing/stats')
      return response.data as CampaignStats
    } catch (error) {
      console.error('Failed to fetch campaign stats:', error)
      throw error
    }
  },

  // Material methods
  async getMaterials(params?: { skip?: number; limit?: number; category?: string }) {
    try {
      const response = await api.get('/marketing/materials', { params })
      return response.data as MarketingMaterial[]
    } catch (error) {
      console.error('Failed to fetch materials:', error)
      throw error
    }
  },

  async getMaterial(id: number) {
    try {
      const response = await api.get(`/marketing/materials/${id}`)
      return response.data as MarketingMaterial
    } catch (error) {
      console.error('Failed to fetch material:', error)
      throw error
    }
  },

  async recordDownload(id: number) {
    try {
      await api.post(`/marketing/materials/${id}/download`)
    } catch (error) {
      console.error('Failed to record download:', error)
      // Don't throw for tracking operations - fail silently
    }
  },

  async recordView(id: number) {
    try {
      await api.post(`/marketing/materials/${id}/view`)
    } catch (error) {
      console.error('Failed to record view:', error)
      // Don't throw for tracking operations - fail silently
    }
  },

  async uploadMaterial(file: File, data: { name: string; description?: string; category?: string; tags?: string }) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      if (data.category) formData.append('category', data.category)
      if (data.tags) formData.append('tags', data.tags)
      
      const response = await api.post('/marketing/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data as MarketingMaterial
    } catch (error) {
      console.error('Failed to upload material:', error)
      throw error
    }
  },

  // A/B Testing methods
  async createABTest(data: { campaign_id: number; name: string; test_type: string; variant_a_content: any; variant_b_content: any; traffic_split?: number }) {
    try {
      const response = await api.post('/marketing/ab-tests', data)
      return response.data
    } catch (error) {
      console.error('Failed to create A/B test:', error)
      throw error
    }
  },

  async getABTests(campaign_id?: number) {
    try {
      const response = await api.get('/marketing/ab-tests', { params: { campaign_id } })
      return response.data
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error)
      throw error
    }
  },

  async startABTest(id: number) {
    try {
      const response = await api.post(`/marketing/ab-tests/${id}/start`)
      return response.data
    } catch (error) {
      console.error('Failed to start A/B test:', error)
      throw error
    }
  },

  async endABTest(id: number) {
    try {
      const response = await api.post(`/marketing/ab-tests/${id}/end`)
      return response.data
    } catch (error) {
      console.error('Failed to end A/B test:', error)
      throw error
    }
  },

  // Campaign Automation methods
  async createAutomation(data: { name: string; description?: string; trigger_type: string; trigger_conditions: any }) {
    try {
      const response = await api.post('/marketing/automations', data)
      return response.data
    } catch (error) {
      console.error('Failed to create automation:', error)
      throw error
    }
  },

  async getAutomations(params?: { skip?: number; limit?: number }) {
    try {
      const response = await api.get('/marketing/automations', { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch automations:', error)
      throw error
    }
  },

  async addAutomationStep(data: { automation_id: number; campaign_id: number; step_order: number; delay_days?: number; delay_hours?: number; conditions?: any }) {
    try {
      const response = await api.post('/marketing/automations/steps', data)
      return response.data
    } catch (error) {
      console.error('Failed to add automation step:', error)
      throw error
    }
  }
}
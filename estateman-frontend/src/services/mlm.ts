import { api } from './api'

export interface MLMPartner {
  id: number
  user_id: number
  referral_code: string
  sponsor_id?: number
  level: string
  join_date: string
  is_active: boolean
  total_earnings: number
  monthly_commission: number
  direct_referrals_count: number
  total_network_size: number
  network_depth: number
  name?: string
}

export interface MLMTreeNode {
  id: string
  name: string
  level: string
  referral_id: string
  direct_referrals: number
  monthly_commission: number
  children: MLMTreeNode[]
  avatar?: string
}

export interface MLMAnalytics {
  total_partners: number
  active_partners: number
  total_network_size: number
  monthly_referral_bonus: number
  conversion_rate: number
  network_depth: number
}

export interface TeamPerformance {
  partner_id: number
  partner_name: string
  level: string
  direct_referrals: number
  total_network: number
  monthly_commission: number
  total_earnings: number
  join_date: string
  downline_level: number
}

export interface ReferralActivity {
  id: string
  referrer: string
  newMember: string
  type: string
  bonus: number
  date: string
}

export interface CommissionStructure {
  level: number | string
  percentage: number
  description: string
}

class MLMService {
  // Partner management
  async createPartner(partnerData: {
    user_id: number
    sponsor_id?: number
    level?: string
  }): Promise<MLMPartner> {
    const response = await api.post('/mlm/partners/', partnerData)
    return response.data
  }

  async getPartners(skip = 0, limit = 100): Promise<MLMPartner[]> {
    const response = await api.get(`/mlm/partners/?skip=${skip}&limit=${limit}`)
    return response.data
  }

  async getPartner(partnerId: number): Promise<MLMPartner> {
    const response = await api.get(`/mlm/partners/${partnerId}`)
    return response.data
  }

  async updatePartner(partnerId: number, updateData: {
    level?: string
    is_active?: boolean
  }): Promise<MLMPartner> {
    const response = await api.put(`/mlm/partners/${partnerId}`, updateData)
    return response.data
  }

  async getPartnerDownline(partnerId: number, maxDepth = 10): Promise<MLMPartner[]> {
    const response = await api.get(`/mlm/partners/${partnerId}/downline?max_depth=${maxDepth}`)
    return response.data
  }

  async getMLMTree(partnerId: number): Promise<MLMTreeNode> {
    const response = await api.get(`/mlm/partners/${partnerId}/tree`)
    return response.data
  }

  async updateNetworkStats(partnerId: number): Promise<{ message: string }> {
    const response = await api.post(`/mlm/partners/${partnerId}/update-stats`)
    return response.data
  }

  // Analytics
  async getMLMAnalytics(): Promise<MLMAnalytics> {
    const response = await api.get('/mlm/analytics/overview')
    return response.data
  }

  async getTopPerformers(limit = 10): Promise<TeamPerformance[]> {
    const response = await api.get(`/mlm/analytics/top-performers?limit=${limit}`)
    return response.data
  }

  // Commission management
  async calculateCommission(sourcePartnerId: number, transactionAmount: number): Promise<{
    message: string
    total_amount: number
  }> {
    const response = await api.post('/mlm/commissions/calculate', null, {
      params: {
        source_partner_id: sourcePartnerId,
        transaction_amount: transactionAmount
      }
    })
    return response.data
  }

  async getRecentActivities(limit = 10): Promise<ReferralActivity[]> {
    const response = await api.get(`/mlm/activities/recent?limit=${limit}`)
    return response.data
  }

  async getCommissionStructure(): Promise<CommissionStructure[]> {
    const response = await api.get('/mlm/commission-structure')
    return response.data
  }
}

export const mlmService = new MLMService()
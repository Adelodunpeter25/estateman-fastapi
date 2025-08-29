import { api } from './api'

export interface LoyaltyMember {
  id: number
  user_id: number
  total_points: number
  available_points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tier_progress: number
  join_date: string
  last_activity?: string
  is_active: boolean
}

export interface Achievement {
  id: number
  name: string
  description?: string
  achievement_type: string
  points_reward: number
  badge_id?: number
  requirements?: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: number
  user_id: number
  achievement_id: number
  earned_at: string
  progress: number
  is_shared: boolean
  achievement: Achievement
}

export interface Reward {
  id: number
  name: string
  description?: string
  category: string
  points_cost: number
  image_url?: string
  is_active: boolean
  stock_quantity?: number
  total_claimed: number
  created_at: string
}

export interface RewardRedemption {
  id: number
  member_id: number
  reward_id: number
  points_spent: number
  status: string
  redeemed_at: string
  fulfilled_at?: string
  reward: Reward
}

export interface Challenge {
  id: number
  name: string
  description?: string
  challenge_type: string
  requirements?: Record<string, any>
  points_reward: number
  badge_reward_id?: number
  start_date: string
  end_date: string
  status: string
  max_participants?: number
  created_at: string
}

export interface GamificationStats {
  total_members: number
  active_members: number
  points_distributed: number
  rewards_claimed: number
  engagement_rate: number
}

export interface MemberTierStats {
  tier: string
  member_count: number
  percentage: number
  avg_points: number
}

export interface LeaderboardEntry {
  rank: number
  user_id: number
  score: number
  tier: string
  category: string
  period: string
}

export const gamificationService = {
  // Dashboard & Stats
  getStats: async (): Promise<GamificationStats> => {
    const response = await api.get('/gamification/stats')
    return response.data
  },

  getTierDistribution: async (): Promise<MemberTierStats[]> => {
    const response = await api.get('/gamification/tiers/distribution')
    return response.data
  },

  // Member Management
  getMemberProfile: async (): Promise<LoyaltyMember> => {
    const response = await api.get('/gamification/member/profile')
    return response.data
  },

  getMemberStats: async (): Promise<any> => {
    const response = await api.get('/gamification/member/stats')
    return response.data
  },

  awardPoints: async (userId: number, points: number, description: string, referenceId?: string, referenceType?: string): Promise<any> => {
    const response = await api.post('/gamification/points/award', null, {
      params: { user_id: userId, points, description, reference_id: referenceId, reference_type: referenceType }
    })
    return response.data
  },

  // Achievements
  createAchievement: async (achievementData: {
    name: string
    description?: string
    achievement_type: string
    points_reward?: number
    requirements?: Record<string, any>
    badge_id?: number
  }): Promise<Achievement> => {
    const response = await api.post('/gamification/achievements', achievementData)
    return response.data
  },

  getAchievements: async (params?: {
    skip?: number
    limit?: number
  }): Promise<Achievement[]> => {
    const response = await api.get('/gamification/achievements', { params })
    return response.data
  },

  awardAchievement: async (achievementId: number, userId?: number): Promise<UserAchievement> => {
    const response = await api.post(`/gamification/achievements/${achievementId}/award`, null, {
      params: userId ? { user_id: userId } : undefined
    })
    return response.data
  },

  getUserAchievements: async (userId: number): Promise<UserAchievement[]> => {
    const response = await api.get(`/gamification/achievements/user/${userId}`)
    return response.data
  },

  getMyAchievements: async (): Promise<UserAchievement[]> => {
    const response = await api.get('/gamification/achievements/my')
    return response.data
  },

  // Rewards
  createReward: async (rewardData: {
    name: string
    description?: string
    category: string
    points_cost: number
    image_url?: string
    stock_quantity?: number
  }): Promise<Reward> => {
    const response = await api.post('/gamification/rewards', rewardData)
    return response.data
  },

  getRewards: async (params?: {
    skip?: number
    limit?: number
    category?: string
  }): Promise<Reward[]> => {
    const response = await api.get('/gamification/rewards', { params })
    return response.data
  },

  redeemReward: async (rewardId: number): Promise<RewardRedemption> => {
    const response = await api.post('/gamification/rewards/redeem', { reward_id: rewardId })
    return response.data
  },

  // Leaderboards
  getLeaderboard: async (params?: {
    category?: string
    period?: string
    limit?: number
  }): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/gamification/leaderboard', { params })
    return response.data
  },

  // Challenges
  createChallenge: async (challengeData: {
    name: string
    description?: string
    challenge_type: string
    requirements?: Record<string, any>
    points_reward?: number
    start_date: string
    end_date: string
    max_participants?: number
    badge_reward_id?: number
  }): Promise<Challenge> => {
    const response = await api.post('/gamification/challenges', challengeData)
    return response.data
  },

  getActiveChallenges: async (): Promise<Challenge[]> => {
    const response = await api.get('/gamification/challenges/active')
    return response.data
  },

  joinChallenge: async (challengeId: number): Promise<any> => {
    const response = await api.post(`/gamification/challenges/${challengeId}/join`)
    return response.data
  }
}
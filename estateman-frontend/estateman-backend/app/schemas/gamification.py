from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.gamification import AchievementType, BadgeRarity, ChallengeStatus, MemberTier

# Achievement schemas
class AchievementBase(BaseModel):
    name: str
    description: Optional[str] = None
    achievement_type: AchievementType
    points_reward: int = 0
    requirements: Optional[Dict[str, Any]] = None

class AchievementCreate(AchievementBase):
    badge_id: Optional[int] = None

class AchievementResponse(AchievementBase):
    id: int
    badge_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Badge schemas
class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    rarity: BadgeRarity = BadgeRarity.COMMON
    color: Optional[str] = None

class BadgeCreate(BadgeBase):
    pass

class BadgeResponse(BadgeBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# User Achievement schemas
class UserAchievementResponse(BaseModel):
    id: int
    user_id: int
    achievement_id: int
    earned_at: datetime
    progress: float
    is_shared: bool
    achievement: AchievementResponse

    class Config:
        from_attributes = True

# Loyalty Member schemas
class LoyaltyMemberBase(BaseModel):
    total_points: int = 0
    available_points: int = 0
    tier: MemberTier = MemberTier.BRONZE

class LoyaltyMemberResponse(LoyaltyMemberBase):
    id: int
    user_id: int
    tier_progress: float
    join_date: datetime
    last_activity: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

# Point Transaction schemas
class PointTransactionCreate(BaseModel):
    member_id: int
    points: int
    transaction_type: str
    description: Optional[str] = None
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None

class PointTransactionResponse(PointTransactionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Reward schemas
class RewardBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    points_cost: int
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = None

class RewardCreate(RewardBase):
    pass

class RewardResponse(RewardBase):
    id: int
    is_active: bool
    total_claimed: int
    created_at: datetime

    class Config:
        from_attributes = True

# Reward Redemption schemas
class RewardRedemptionCreate(BaseModel):
    reward_id: int

class RewardRedemptionResponse(BaseModel):
    id: int
    member_id: int
    reward_id: int
    points_spent: int
    status: str
    redeemed_at: datetime
    fulfilled_at: Optional[datetime] = None
    reward: RewardResponse

    class Config:
        from_attributes = True

# Challenge schemas
class ChallengeBase(BaseModel):
    name: str
    description: Optional[str] = None
    challenge_type: str
    requirements: Optional[Dict[str, Any]] = None
    points_reward: int = 0
    start_date: datetime
    end_date: datetime
    max_participants: Optional[int] = None

class ChallengeCreate(ChallengeBase):
    badge_reward_id: Optional[int] = None

class ChallengeResponse(ChallengeBase):
    id: int
    badge_reward_id: Optional[int] = None
    status: ChallengeStatus
    created_at: datetime

    class Config:
        from_attributes = True

# Challenge Participation schemas
class ChallengeParticipationResponse(BaseModel):
    id: int
    challenge_id: int
    user_id: int
    progress: float
    completed_at: Optional[datetime] = None
    points_earned: int
    joined_at: datetime

    class Config:
        from_attributes = True

# Leaderboard schemas
class LeaderboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    period_type: str
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

class LeaderboardCreate(LeaderboardBase):
    pass

class LeaderboardResponse(LeaderboardBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Leaderboard Entry schemas
class LeaderboardEntryResponse(BaseModel):
    id: int
    leaderboard_id: int
    user_id: int
    score: float
    rank: int
    metadata: Optional[Dict[str, Any]] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class GamificationStatsResponse(BaseModel):
    total_members: int
    active_members: int
    points_distributed: int
    rewards_claimed: int
    engagement_rate: float

class MemberTierStatsResponse(BaseModel):
    tier: MemberTier
    member_count: int
    percentage: float
    avg_points: int

class TopPerformerResponse(BaseModel):
    user_id: int
    name: str
    points: int
    tier: MemberTier
    deals: int
    avatar: Optional[str] = None
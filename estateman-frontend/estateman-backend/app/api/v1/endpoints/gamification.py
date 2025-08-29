from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....schemas.gamification import (
    AchievementCreate, AchievementResponse, BadgeCreate, BadgeResponse,
    UserAchievementResponse, LoyaltyMemberResponse, PointTransactionResponse,
    RewardCreate, RewardResponse, RewardRedemptionCreate, RewardRedemptionResponse,
    ChallengeCreate, ChallengeResponse, ChallengeParticipationResponse,
    GamificationStatsResponse, MemberTierStatsResponse, TopPerformerResponse
)
from ....services.gamification import (
    GamificationService, AchievementService, RewardService,
    LeaderboardService, ChallengeService, GamificationAnalyticsService
)

router = APIRouter()

# Gamification Dashboard
@router.get("/stats", response_model=GamificationStatsResponse)
async def get_gamification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationAnalyticsService(db)
    return service.get_dashboard_stats()

@router.get("/tiers/distribution", response_model=List[MemberTierStatsResponse])
async def get_tier_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationAnalyticsService(db)
    return service.get_tier_distribution()

# Member Management
@router.get("/member/profile", response_model=LoyaltyMemberResponse)
async def get_member_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    member = service.get_or_create_member(current_user.id)
    return member

@router.get("/member/stats")
async def get_member_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.get_member_stats(current_user.id)

@router.post("/points/award")
async def award_points(
    user_id: int,
    points: int,
    description: str,
    reference_id: Optional[str] = None,
    reference_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    transaction = service.award_points(user_id, points, description, reference_id, reference_type)
    return transaction

# Achievements
@router.post("/achievements", response_model=AchievementResponse)
async def create_achievement(
    achievement_data: AchievementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.create_achievement(achievement_data)

@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.get_achievements(skip, limit)

@router.post("/achievements/{achievement_id}/award")
async def award_achievement(
    achievement_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    target_user_id = user_id or current_user.id
    user_achievement = service.award_achievement(target_user_id, achievement_id)
    if not user_achievement:
        raise HTTPException(status_code=400, detail="Achievement could not be awarded")
    return user_achievement

@router.get("/achievements/user/{user_id}", response_model=List[UserAchievementResponse])
async def get_user_achievements(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.get_user_achievements(user_id)

@router.get("/achievements/my", response_model=List[UserAchievementResponse])
async def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AchievementService(db)
    return service.get_user_achievements(current_user.id)

# Badges
@router.post("/badges", response_model=BadgeResponse)
async def create_badge(
    badge_data: BadgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ....models.gamification import Badge
    badge = Badge(**badge_data.dict())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge

@router.get("/badges", response_model=List[BadgeResponse])
async def get_badges(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ....models.gamification import Badge
    return db.query(Badge).filter(Badge.is_active == True).offset(skip).limit(limit).all()

# Rewards
@router.post("/rewards", response_model=RewardResponse)
async def create_reward(
    reward_data: RewardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.create_reward(reward_data)

@router.get("/rewards", response_model=List[RewardResponse])
async def get_rewards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.get_rewards(skip, limit, category)

@router.post("/rewards/redeem", response_model=RewardRedemptionResponse)
async def redeem_reward(
    redemption_data: RewardRedemptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    redemption = service.redeem_reward(current_user.id, redemption_data)
    if not redemption:
        raise HTTPException(status_code=400, detail="Reward could not be redeemed")
    return redemption

# Leaderboards
@router.get("/leaderboard")
async def get_leaderboard(
    category: str = Query("points", description="Category: points, sales, referrals"),
    period: str = Query("all_time", description="Period: daily, weekly, monthly, all_time"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = LeaderboardService(db)
    return service.get_leaderboard(category, period, limit)

# Challenges
@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChallengeService(db)
    return service.create_challenge(challenge_data)

@router.get("/challenges/active", response_model=List[ChallengeResponse])
async def get_active_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChallengeService(db)
    return service.get_active_challenges()

@router.post("/challenges/{challenge_id}/join", response_model=ChallengeParticipationResponse)
async def join_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChallengeService(db)
    participation = service.join_challenge(current_user.id, challenge_id)
    if not participation:
        raise HTTPException(status_code=400, detail="Could not join challenge")
    return participation
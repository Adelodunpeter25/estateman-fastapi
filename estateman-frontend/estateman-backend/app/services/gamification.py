from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from ..core.datetime_utils import utc_now
from ..models.gamification import (
    Achievement, Badge, UserAchievement, LoyaltyMember, PointTransaction,
    Reward, RewardRedemption, Challenge, ChallengeParticipation,
    Leaderboard, LeaderboardEntry, MemberTier, AchievementType
)
from ..schemas.gamification import (
    AchievementCreate, BadgeCreate, PointTransactionCreate,
    RewardCreate, RewardRedemptionCreate, ChallengeCreate
)

class GamificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_member(self, user_id: int) -> LoyaltyMember:
        member = self.db.query(LoyaltyMember).filter(LoyaltyMember.user_id == user_id).first()
        if not member:
            member = LoyaltyMember(user_id=user_id)
            self.db.add(member)
            self.db.commit()
            self.db.refresh(member)
        return member

    def trigger_achievement_check(self, user_id: int, event_type: str, event_data: Dict[str, Any]):
        """Automatically check and award achievements based on events"""
        achievements = self.db.query(Achievement).filter(
            Achievement.is_active == True,
            Achievement.achievement_type == event_type
        ).all()
        
        for achievement in achievements:
            if self._check_achievement_criteria(user_id, achievement, event_data):
                achievement_service = AchievementService(self.db)
                achievement_service.award_achievement(user_id, achievement.id)
    
    def _check_achievement_criteria(self, user_id: int, achievement: Achievement, event_data: Dict[str, Any]) -> bool:
        """Check if user meets achievement criteria"""
        if not achievement.requirements:
            return True
        
        requirements = achievement.requirements if isinstance(achievement.requirements, dict) else json.loads(achievement.requirements)
        
        # Example criteria checks
        if achievement.achievement_type == AchievementType.SALES:
            if 'sales_count' in requirements:
                # Check user's total sales count
                return event_data.get('total_sales', 0) >= requirements['sales_count']
        elif achievement.achievement_type == AchievementType.REFERRAL:
            if 'referral_count' in requirements:
                return event_data.get('total_referrals', 0) >= requirements['referral_count']
        
        return False
    
    def share_achievement(self, user_id: int, achievement_id: int, platform: str) -> Dict[str, Any]:
        """Share achievement on social platforms"""
        user_achievement = self.db.query(UserAchievement).filter(
            and_(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
        ).first()
        
        if not user_achievement:
            return {"success": False, "message": "Achievement not found"}
        
        # Mark as shared
        user_achievement.is_shared = True
        
        # Award bonus points for sharing
        self.award_points(user_id, 50, f"Shared achievement on {platform}", str(achievement_id), "social_share")
        
        self.db.commit()
        
        return {
            "success": True,
            "share_url": f"https://estateman.com/achievements/{achievement_id}",
            "message": f"Achievement shared on {platform}! +50 bonus points awarded."
        }
    
    def get_team_challenges(self, team_id: int) -> List[Dict[str, Any]]:
        """Get challenges for team participation"""
        # This would integrate with team/MLM structure
        team_challenges = self.db.query(Challenge).filter(
            Challenge.challenge_type == "team",
            Challenge.status == "active"
        ).all()
        
        result = []
        for challenge in team_challenges:
            # Get team participation stats
            team_participation = self.db.query(ChallengeParticipation).filter(
                ChallengeParticipation.challenge_id == challenge.id
            ).count()
            
            result.append({
                "challenge": challenge,
                "team_participants": team_participation,
                "team_progress": self._calculate_team_progress(challenge.id, team_id)
            })
        
        return result
    
    def _calculate_team_progress(self, challenge_id: int, team_id: int) -> float:
        """Calculate team progress for a challenge"""
        # Mock implementation - would integrate with actual team structure
        return 0.0

    def award_points(self, user_id: int, points: int, description: str, reference_id: Optional[str] = None, reference_type: Optional[str] = None) -> PointTransaction:
        member = self.get_or_create_member(user_id)
        
        # Create transaction
        transaction = PointTransaction(
            member_id=member.id,
            points=points,
            transaction_type="earned",
            description=description,
            reference_id=reference_id,
            reference_type=reference_type
        )
        self.db.add(transaction)
        
        # Update member points
        member.total_points += points
        member.available_points += points
        member.last_activity = utc_now()
        
        # Check for tier upgrade
        self._check_tier_upgrade(member)
        
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def _check_tier_upgrade(self, member: LoyaltyMember):
        tier_thresholds = {
            MemberTier.BRONZE: 0,
            MemberTier.SILVER: 1000,
            MemberTier.GOLD: 5000,
            MemberTier.PLATINUM: 15000
        }
        
        new_tier = MemberTier.BRONZE
        for tier, threshold in tier_thresholds.items():
            if member.total_points >= threshold:
                new_tier = tier
        
        if new_tier != member.tier:
            old_tier = member.tier
            member.tier = new_tier
            
            # Award tier upgrade points
            if new_tier != MemberTier.BRONZE:
                bonus_points = 500 * (list(tier_thresholds.keys()).index(new_tier))
                self.award_points(member.user_id, bonus_points, f"Tier upgrade bonus: {old_tier} to {new_tier}")

    def get_member_stats(self, user_id: int) -> Dict[str, Any]:
        member = self.get_or_create_member(user_id)
        
        # Get recent transactions
        recent_transactions = self.db.query(PointTransaction).filter(
            PointTransaction.member_id == member.id
        ).order_by(desc(PointTransaction.created_at)).limit(10).all()
        
        # Get achievements
        achievements = self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).count()
        
        return {
            "member": member,
            "recent_transactions": recent_transactions,
            "total_achievements": achievements
        }

class AchievementService:
    def __init__(self, db: Session):
        self.db = db

    def create_achievement(self, achievement_data: AchievementCreate) -> Achievement:
        achievement = Achievement(**achievement_data.dict())
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        return achievement

    def get_achievements(self, skip: int = 0, limit: int = 100) -> List[Achievement]:
        return self.db.query(Achievement).filter(Achievement.is_active == True).offset(skip).limit(limit).all()

    def check_and_award_achievements(self, user_id: int, event_type: str, event_data: Dict[str, Any]):
        """Check and award achievements based on user activity"""
        gamification_service = GamificationService(self.db)
        gamification_service.trigger_achievement_check(user_id, event_type, event_data)
    
    def award_achievement(self, user_id: int, achievement_id: int) -> Optional[UserAchievement]:
        # Check if already earned
        existing = self.db.query(UserAchievement).filter(
            and_(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
        ).first()
        
        if existing:
            return existing
        
        achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
        if not achievement:
            return None
        
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id
        )
        self.db.add(user_achievement)
        
        # Award points if any
        if achievement.points_reward > 0:
            gamification_service = GamificationService(self.db)
            gamification_service.award_points(
                user_id, 
                achievement.points_reward, 
                f"Achievement earned: {achievement.name}",
                str(achievement_id),
                "achievement"
            )
        
        self.db.commit()
        self.db.refresh(user_achievement)
        return user_achievement

    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        return self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).order_by(desc(UserAchievement.earned_at)).all()

class RewardService:
    def __init__(self, db: Session):
        self.db = db

    def create_reward(self, reward_data: RewardCreate) -> Reward:
        reward = Reward(**reward_data.dict())
        self.db.add(reward)
        self.db.commit()
        self.db.refresh(reward)
        return reward

    def get_rewards(self, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Reward]:
        query = self.db.query(Reward).filter(Reward.is_active == True)
        if category:
            query = query.filter(Reward.category == category)
        return query.offset(skip).limit(limit).all()

    def redeem_reward(self, user_id: int, redemption_data: RewardRedemptionCreate) -> Optional[RewardRedemption]:
        member = self.db.query(LoyaltyMember).filter(LoyaltyMember.user_id == user_id).first()
        if not member:
            return None
        
        reward = self.db.query(Reward).filter(Reward.id == redemption_data.reward_id).first()
        if not reward or not reward.is_active:
            return None
        
        # Check if user has enough points
        if member.available_points < reward.points_cost:
            return None
        
        # Check stock
        if reward.stock_quantity is not None and reward.total_claimed >= reward.stock_quantity:
            return None
        
        # Create redemption
        redemption = RewardRedemption(
            member_id=member.id,
            reward_id=reward.id,
            points_spent=reward.points_cost
        )
        self.db.add(redemption)
        
        # Deduct points
        member.available_points -= reward.points_cost
        
        # Create transaction record
        transaction = PointTransaction(
            member_id=member.id,
            points=-reward.points_cost,
            transaction_type="spent",
            description=f"Redeemed: {reward.name}",
            reference_id=str(reward.id),
            reference_type="reward"
        )
        self.db.add(transaction)
        
        # Update reward stats
        reward.total_claimed += 1
        
        self.db.commit()
        self.db.refresh(redemption)
        return redemption

class LeaderboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_leaderboard(self, category: str = "points", period_type: str = "all_time", limit: int = 50) -> List[Dict[str, Any]]:
        if category == "points":
            # Points leaderboard
            query = self.db.query(
                LoyaltyMember.user_id,
                LoyaltyMember.total_points.label('score'),
                LoyaltyMember.tier
            ).filter(LoyaltyMember.is_active == True)
            
            if period_type == "monthly":
                start_date = utc_now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                monthly_points = self.db.query(
                    PointTransaction.member_id,
                    func.sum(PointTransaction.points).label('monthly_points')
                ).filter(
                    and_(
                        PointTransaction.created_at >= start_date,
                        PointTransaction.points > 0
                    )
                ).group_by(PointTransaction.member_id).subquery()
                
                query = self.db.query(
                    LoyaltyMember.user_id,
                    func.coalesce(monthly_points.c.monthly_points, 0).label('score'),
                    LoyaltyMember.tier
                ).outerjoin(monthly_points, LoyaltyMember.id == monthly_points.c.member_id)
            
            results = query.order_by(desc('score')).limit(limit).all()
            
            # Add rank and user details
            leaderboard = []
            for rank, result in enumerate(results, 1):
                # Get user details (would need to join with users table)
                leaderboard.append({
                    "rank": rank,
                    "user_id": result.user_id,
                    "score": float(result.score),
                    "tier": result.tier,
                    "category": category,
                    "period": period_type
                })
            
            return leaderboard
        
        elif category == "sales":
            # Sales leaderboard - would integrate with transaction data
            # Mock implementation for now
            return []
        elif category == "referrals":
            # Referral leaderboard - would integrate with MLM data
            # Mock implementation for now
            return []
        
        return []

class ChallengeService:
    def __init__(self, db: Session):
        self.db = db

    def create_challenge(self, challenge_data: ChallengeCreate) -> Challenge:
        challenge = Challenge(**challenge_data.dict())
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        return challenge

    def get_active_challenges(self) -> List[Challenge]:
        now = utc_now()
        return self.db.query(Challenge).filter(
            and_(
                Challenge.status == "active",
                Challenge.start_date <= now,
                Challenge.end_date >= now
            )
        ).all()

    def join_challenge(self, user_id: int, challenge_id: int) -> Optional[ChallengeParticipation]:
        # Check if already joined
        existing = self.db.query(ChallengeParticipation).filter(
            and_(
                ChallengeParticipation.user_id == user_id,
                ChallengeParticipation.challenge_id == challenge_id
            )
        ).first()
        
        if existing:
            return existing
        
        challenge = self.db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge or challenge.status != "active":
            return None
        
        # Check max participants
        if challenge.max_participants:
            current_participants = self.db.query(ChallengeParticipation).filter(
                ChallengeParticipation.challenge_id == challenge_id
            ).count()
            
            if current_participants >= challenge.max_participants:
                return None
        
        participation = ChallengeParticipation(
            user_id=user_id,
            challenge_id=challenge_id
        )
        self.db.add(participation)
        self.db.commit()
        self.db.refresh(participation)
        return participation
    
    def update_challenge_progress(self, user_id: int, challenge_id: int, progress_data: Dict[str, Any]):
        """Update user's progress in a challenge"""
        participation = self.db.query(ChallengeParticipation).filter(
            and_(
                ChallengeParticipation.user_id == user_id,
                ChallengeParticipation.challenge_id == challenge_id
            )
        ).first()
        
        if not participation:
            return None
        
        challenge = self.db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            return None
        
        # Calculate progress based on challenge requirements
        new_progress = self._calculate_challenge_progress(challenge, progress_data)
        participation.progress = new_progress
        
        # Check if challenge is completed
        if new_progress >= 100.0 and not participation.completed_at:
            participation.completed_at = utc_now()
            
            # Award challenge points
            if challenge.points_reward > 0:
                gamification_service = GamificationService(self.db)
                gamification_service.award_points(
                    user_id,
                    challenge.points_reward,
                    f"Challenge completed: {challenge.name}",
                    str(challenge_id),
                    "challenge"
                )
                participation.points_earned = challenge.points_reward
        
        self.db.commit()
        return participation
    
    def _calculate_challenge_progress(self, challenge: Challenge, progress_data: Dict[str, Any]) -> float:
        """Calculate challenge progress percentage"""
        if not challenge.requirements:
            return 0.0
        
        requirements = challenge.requirements if isinstance(challenge.requirements, dict) else json.loads(challenge.requirements)
        
        # Example progress calculation
        if 'target_value' in requirements:
            current_value = progress_data.get('current_value', 0)
            target_value = requirements['target_value']
            return min(100.0, (current_value / target_value) * 100.0)
        
        return 0.0

class GamificationAnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> Dict[str, Any]:
        total_members = self.db.query(LoyaltyMember).count()
        active_members = self.db.query(LoyaltyMember).filter(LoyaltyMember.is_active == True).count()
        
        points_distributed = self.db.query(func.sum(PointTransaction.points)).filter(
            PointTransaction.points > 0
        ).scalar() or 0
        
        rewards_claimed = self.db.query(RewardRedemption).count()
        
        engagement_rate = (active_members / total_members * 100) if total_members > 0 else 0
        
        return {
            "total_members": total_members,
            "active_members": active_members,
            "points_distributed": int(points_distributed),
            "rewards_claimed": rewards_claimed,
            "engagement_rate": round(engagement_rate, 1)
        }

    def get_tier_distribution(self) -> List[Dict[str, Any]]:
        tier_stats = self.db.query(
            LoyaltyMember.tier,
            func.count(LoyaltyMember.id).label('count'),
            func.avg(LoyaltyMember.total_points).label('avg_points')
        ).group_by(LoyaltyMember.tier).all()
        
        total_members = sum(stat.count for stat in tier_stats)
        
        result = []
        for stat in tier_stats:
            result.append({
                "tier": stat.tier,
                "member_count": stat.count,
                "percentage": round(stat.count / total_members * 100, 1) if total_members > 0 else 0,
                "avg_points": int(stat.avg_points or 0)
            })
        
        return result
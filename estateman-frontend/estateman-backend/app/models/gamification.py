from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class AchievementType(str, enum.Enum):
    SALES = "sales"
    REFERRAL = "referral"
    ACTIVITY = "activity"
    MILESTONE = "milestone"
    SOCIAL = "social"

class BadgeRarity(str, enum.Enum):
    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class ChallengeStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    DRAFT = "draft"

class MemberTier(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    achievement_type = Column(Enum(AchievementType), nullable=False)
    points_reward = Column(Integer, default=0)
    badge_id = Column(Integer, ForeignKey("badges.id"))
    requirements = Column(JSON)  # Criteria for earning
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    badge = relationship("Badge", back_populates="achievements")
    user_achievements = relationship("UserAchievement", back_populates="achievement")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon_url = Column(String(500))
    rarity = Column(Enum(BadgeRarity), default=BadgeRarity.COMMON)
    color = Column(String(7))  # Hex color
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    achievements = relationship("Achievement", back_populates="badge")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    progress = Column(Float, default=100.0)  # Percentage completed
    is_shared = Column(Boolean, default=False)

    # Relationships
    achievement = relationship("Achievement", back_populates="user_achievements")

class LoyaltyMember(Base):
    __tablename__ = "loyalty_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_points = Column(Integer, default=0)
    available_points = Column(Integer, default=0)
    tier = Column(Enum(MemberTier), default=MemberTier.BRONZE)
    tier_progress = Column(Float, default=0.0)  # Progress to next tier
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)

    # Relationships
    point_transactions = relationship("PointTransaction", back_populates="member")
    reward_redemptions = relationship("RewardRedemption", back_populates="member")

class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("loyalty_members.id"), nullable=False)
    points = Column(Integer, nullable=False)  # Positive for earned, negative for spent
    transaction_type = Column(String(50), nullable=False)  # earned, spent, expired, adjusted
    description = Column(String(500))
    reference_id = Column(String(100))  # Reference to related entity
    reference_type = Column(String(50))  # Type of related entity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    member = relationship("LoyaltyMember", back_populates="point_transactions")

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    points_cost = Column(Integer, nullable=False)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    stock_quantity = Column(Integer)  # Null for unlimited
    total_claimed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    redemptions = relationship("RewardRedemption", back_populates="reward")

class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("loyalty_members.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending, fulfilled, cancelled
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())
    fulfilled_at = Column(DateTime(timezone=True))

    # Relationships
    member = relationship("LoyaltyMember", back_populates="reward_redemptions")
    reward = relationship("Reward", back_populates="redemptions")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    challenge_type = Column(String(50), nullable=False)
    requirements = Column(JSON)  # Challenge criteria
    points_reward = Column(Integer, default=0)
    badge_reward_id = Column(Integer, ForeignKey("badges.id"))
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(ChallengeStatus), default=ChallengeStatus.DRAFT)
    max_participants = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    participations = relationship("ChallengeParticipation", back_populates="challenge")

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    progress = Column(Float, default=0.0)  # Percentage completed
    completed_at = Column(DateTime(timezone=True))
    points_earned = Column(Integer, default=0)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    challenge = relationship("Challenge", back_populates="participations")

class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)  # points, sales, referrals, etc.
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly, all_time
    period_start = Column(DateTime(timezone=True))
    period_end = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    entries = relationship("LeaderboardEntry", back_populates="leaderboard")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    leaderboard_id = Column(Integer, ForeignKey("leaderboards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)
    entry_metadata = Column(JSON)  # Additional data like deals count, etc.
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    leaderboard = relationship("Leaderboard", back_populates="entries")
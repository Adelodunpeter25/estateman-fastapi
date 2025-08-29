from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional
from ..models.notification import Notification, NotificationPreference, NotificationCategory, NotificationChannel
from ..schemas.notification import NotificationCreate, NotificationUpdate, NotificationPreferenceCreate, NotificationPreferenceUpdate
from ..core.datetime_utils import utc_now

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, notification_data: NotificationCreate) -> Notification:
        notification = Notification(**notification_data.dict())
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 50, unread_only: bool = False) -> List[Notification]:
        query = self.db.query(Notification).filter(
            or_(
                Notification.user_id == user_id,
                Notification.user_id.is_(None)  # Broadcast notifications
            )
        )
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    def mark_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        notification = self.db.query(Notification).filter(
            and_(
                Notification.id == notification_id,
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)
                )
            )
        ).first()
        
        if not notification:
            return None
        
        notification.is_read = True
        notification.read_at = utc_now()
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: int) -> int:
        count = self.db.query(Notification).filter(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)
                ),
                Notification.is_read == False
            )
        ).update({
            "is_read": True,
            "read_at": utc_now()
        })
        
        self.db.commit()
        return count

    def get_notification_stats(self, user_id: int) -> dict:
        total = self.db.query(Notification).filter(
            or_(
                Notification.user_id == user_id,
                Notification.user_id.is_(None)
            )
        ).count()
        
        unread = self.db.query(Notification).filter(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)
                ),
                Notification.is_read == False
            )
        ).count()
        
        # Category counts
        categories = self.db.query(
            Notification.category,
            func.count(Notification.id).label('count')
        ).filter(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)
                ),
                Notification.is_read == False
            )
        ).group_by(Notification.category).all()
        
        category_counts = {cat.category: cat.count for cat in categories}
        
        return {
            "total": total,
            "unread": unread,
            "categories": category_counts
        }

class NotificationPreferenceService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_preferences(self, user_id: int) -> List[NotificationPreference]:
        return self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).all()

    def update_preference(self, user_id: int, category: NotificationCategory, channel: NotificationChannel, preference_data: NotificationPreferenceUpdate) -> NotificationPreference:
        preference = self.db.query(NotificationPreference).filter(
            and_(
                NotificationPreference.user_id == user_id,
                NotificationPreference.category == category,
                NotificationPreference.channel == channel
            )
        ).first()
        
        if not preference:
            preference = NotificationPreference(
                user_id=user_id,
                category=category,
                channel=channel,
                is_enabled=preference_data.is_enabled
            )
            self.db.add(preference)
        else:
            preference.is_enabled = preference_data.is_enabled
            preference.updated_at = utc_now()
        
        self.db.commit()
        self.db.refresh(preference)
        return preference

    def create_default_preferences(self, user_id: int):
        """Create default notification preferences for a new user"""
        defaults = [
            (NotificationCategory.SALES, NotificationChannel.EMAIL, True),
            (NotificationCategory.SALES, NotificationChannel.PUSH, True),
            (NotificationCategory.LEADS, NotificationChannel.EMAIL, True),
            (NotificationCategory.LEADS, NotificationChannel.PUSH, False),
            (NotificationCategory.FINANCE, NotificationChannel.EMAIL, True),
            (NotificationCategory.FINANCE, NotificationChannel.PUSH, True),
            (NotificationCategory.EVENTS, NotificationChannel.EMAIL, True),
            (NotificationCategory.EVENTS, NotificationChannel.PUSH, True),
            (NotificationCategory.TEAM, NotificationChannel.EMAIL, False),
            (NotificationCategory.TEAM, NotificationChannel.PUSH, True),
            (NotificationCategory.SYSTEM, NotificationChannel.EMAIL, False),
            (NotificationCategory.SYSTEM, NotificationChannel.PUSH, False),
        ]
        
        for category, channel, enabled in defaults:
            preference = NotificationPreference(
                user_id=user_id,
                category=category,
                channel=channel,
                is_enabled=enabled
            )
            self.db.add(preference)
        
        self.db.commit()
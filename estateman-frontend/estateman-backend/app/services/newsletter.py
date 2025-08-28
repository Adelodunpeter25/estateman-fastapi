from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..core.datetime_utils import utc_now
from ..core.validation import sanitize_html, validate_id
from ..core.exceptions import NotFoundError, ValidationException
from ..models.newsletter import Newsletter, EmailTemplate, Subscriber, NewsletterAnalytics, EmailSequence, SequenceEmail, NewsletterStatus, SubscriberStatus
from ..schemas.newsletter import NewsletterCreate, NewsletterUpdate, EmailTemplateCreate, EmailTemplateUpdate, SubscriberCreate, SubscriberUpdate

class NewsletterService:
    def __init__(self, db: Session):
        self.db = db

    def create_newsletter(self, newsletter_data: NewsletterCreate, user_id: int) -> Newsletter:
        newsletter = Newsletter(
            **newsletter_data.dict(exclude={'template_id'}),
            created_by=user_id,
            template_id=newsletter_data.template_id
        )
        if newsletter.html_content:
            newsletter.html_content = sanitize_html(newsletter.html_content)
        
        self.db.add(newsletter)
        self.db.commit()
        self.db.refresh(newsletter)
        return newsletter

    def get_newsletters(self, skip: int = 0, limit: int = 100, status: Optional[NewsletterStatus] = None) -> List[Newsletter]:
        query = self.db.query(Newsletter)
        if status:
            query = query.filter(Newsletter.status == status)
        return query.order_by(desc(Newsletter.created_at)).offset(skip).limit(limit).all()

    def get_newsletter(self, newsletter_id: int) -> Optional[Newsletter]:
        newsletter_id = validate_id(newsletter_id)
        return self.db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()

    def update_newsletter(self, newsletter_id: int, newsletter_data: NewsletterUpdate) -> Optional[Newsletter]:
        newsletter = self.get_newsletter(newsletter_id)
        if not newsletter:
            raise NotFoundError("Newsletter")
        
        for field, value in newsletter_data.dict(exclude_unset=True).items():
            if field == 'html_content' and value:
                value = sanitize_html(value)
            setattr(newsletter, field, value)
        
        newsletter.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(newsletter)
        return newsletter

    def delete_newsletter(self, newsletter_id: int) -> bool:
        newsletter = self.get_newsletter(newsletter_id)
        if not newsletter:
            return False
        self.db.delete(newsletter)
        self.db.commit()
        return True

    def send_newsletter(self, newsletter_id: int) -> Newsletter:
        newsletter = self.get_newsletter(newsletter_id)
        if not newsletter:
            raise NotFoundError("Newsletter")
        
        if newsletter.status != NewsletterStatus.DRAFT:
            raise ValidationException("Newsletter must be in draft status to send")
        
        # Get active subscribers
        subscribers = self.db.query(Subscriber).filter(Subscriber.status == SubscriberStatus.ACTIVE).all()
        
        newsletter.status = NewsletterStatus.SENT
        newsletter.sent_at = utc_now()
        newsletter.total_recipients = len(subscribers)
        
        # Create analytics records
        for subscriber in subscribers:
            analytics = NewsletterAnalytics(
                newsletter_id=newsletter.id,
                subscriber_id=subscriber.id,
                sent_at=utc_now()
            )
            self.db.add(analytics)
        
        self.db.commit()
        self.db.refresh(newsletter)
        return newsletter

    def get_newsletter_stats(self) -> Dict[str, Any]:
        total_subscribers = self.db.query(Subscriber).filter(Subscriber.status == SubscriberStatus.ACTIVE).count()
        campaigns_sent = self.db.query(Newsletter).filter(Newsletter.status == NewsletterStatus.SENT).count()
        
        # Calculate averages
        newsletters = self.db.query(Newsletter).filter(Newsletter.status == NewsletterStatus.SENT).all()
        total_opens = sum(n.total_opens for n in newsletters)
        total_clicks = sum(n.total_clicks for n in newsletters)
        total_recipients = sum(n.total_recipients for n in newsletters)
        
        avg_open_rate = (total_opens / total_recipients * 100) if total_recipients > 0 else 0
        avg_click_rate = (total_clicks / total_recipients * 100) if total_recipients > 0 else 0
        
        return {
            "total_subscribers": total_subscribers,
            "campaigns_sent": campaigns_sent,
            "avg_open_rate": round(avg_open_rate, 1),
            "avg_click_rate": round(avg_click_rate, 1),
            "total_bounces": sum(n.total_bounces for n in newsletters),
            "total_unsubscribes": sum(n.total_unsubscribes for n in newsletters)
        }

    def get_analytics(self) -> Dict[str, Any]:
        newsletters = self.db.query(Newsletter).filter(Newsletter.status == NewsletterStatus.SENT).order_by(desc(Newsletter.sent_at)).all()
        
        # Campaign performance data
        campaign_performance = []
        for newsletter in newsletters[:10]:  # Last 10 campaigns
            open_rate = (newsletter.total_opens / newsletter.total_recipients * 100) if newsletter.total_recipients > 0 else 0
            click_rate = (newsletter.total_clicks / newsletter.total_recipients * 100) if newsletter.total_recipients > 0 else 0
            campaign_performance.append({
                "name": newsletter.title,
                "sent_date": newsletter.sent_at.isoformat() if newsletter.sent_at else None,
                "recipients": newsletter.total_recipients,
                "opens": newsletter.total_opens,
                "clicks": newsletter.total_clicks,
                "open_rate": round(open_rate, 1),
                "click_rate": round(click_rate, 1)
            })
        
        # Monthly trends from actual data
        monthly_data = self.db.query(
            func.date_trunc('month', Newsletter.sent_at).label('month'),
            func.count(Newsletter.id).label('campaigns'),
            func.sum(Newsletter.total_opens).label('opens'),
            func.sum(Newsletter.total_clicks).label('clicks')
        ).filter(
            Newsletter.status == NewsletterStatus.SENT,
            Newsletter.sent_at.isnot(None)
        ).group_by(
            func.date_trunc('month', Newsletter.sent_at)
        ).order_by(
            func.date_trunc('month', Newsletter.sent_at)
        ).all()
        
        monthly_trends = []
        for row in monthly_data:
            month_name = row.month.strftime('%b') if row.month else 'Unknown'
            monthly_trends.append({
                "month": month_name,
                "campaigns": row.campaigns or 0,
                "opens": row.opens or 0,
                "clicks": row.clicks or 0
            })
        
        return {
            "campaign_performance": campaign_performance,
            "monthly_trends": monthly_trends,
            "top_performing_campaigns": sorted(campaign_performance, key=lambda x: x["open_rate"], reverse=True)[:5]
        }

class EmailTemplateService:
    def __init__(self, db: Session):
        self.db = db

    def create_template(self, template_data: EmailTemplateCreate) -> EmailTemplate:
        template = EmailTemplate(**template_data.dict())
        template.html_content = sanitize_html(template.html_content)
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def get_templates(self, category: Optional[str] = None) -> List[EmailTemplate]:
        query = self.db.query(EmailTemplate).filter(EmailTemplate.is_active == True)
        if category:
            query = query.filter(EmailTemplate.category == category)
        return query.order_by(EmailTemplate.name).all()

    def get_template(self, template_id: int) -> Optional[EmailTemplate]:
        template_id = validate_id(template_id)
        return self.db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()

    def update_template(self, template_id: int, template_data: EmailTemplateUpdate) -> Optional[EmailTemplate]:
        template = self.get_template(template_id)
        if not template:
            raise NotFoundError("Email Template")
        
        for field, value in template_data.dict(exclude_unset=True).items():
            if field == 'html_content' and value:
                value = sanitize_html(value)
            setattr(template, field, value)
        
        template.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(template)
        return template

    def increment_usage(self, template_id: int):
        template = self.get_template(template_id)
        if template:
            template.usage_count += 1
            self.db.commit()

class SubscriberService:
    def __init__(self, db: Session):
        self.db = db

    def create_subscriber(self, subscriber_data: SubscriberCreate) -> Subscriber:
        # Check if subscriber already exists
        existing = self.db.query(Subscriber).filter(Subscriber.email == subscriber_data.email).first()
        if existing:
            if existing.status == SubscriberStatus.UNSUBSCRIBED:
                # Reactivate subscriber
                existing.status = SubscriberStatus.ACTIVE
                existing.subscribed_at = utc_now()
                existing.unsubscribed_at = None
                self.db.commit()
                self.db.refresh(existing)
                return existing
            else:
                raise ValidationException("Subscriber already exists")
        
        subscriber = Subscriber(**subscriber_data.dict())
        self.db.add(subscriber)
        self.db.commit()
        self.db.refresh(subscriber)
        return subscriber

    def get_subscribers(self, skip: int = 0, limit: int = 100, status: Optional[SubscriberStatus] = None, segment: Optional[str] = None) -> List[Subscriber]:
        query = self.db.query(Subscriber)
        if status:
            query = query.filter(Subscriber.status == status)
        if segment:
            query = query.filter(Subscriber.segments.contains([segment]))
        return query.order_by(desc(Subscriber.subscribed_at)).offset(skip).limit(limit).all()

    def get_subscriber(self, subscriber_id: int) -> Optional[Subscriber]:
        subscriber_id = validate_id(subscriber_id)
        return self.db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()

    def update_subscriber(self, subscriber_id: int, subscriber_data: SubscriberUpdate) -> Optional[Subscriber]:
        subscriber = self.get_subscriber(subscriber_id)
        if not subscriber:
            raise NotFoundError("Subscriber")
        
        for field, value in subscriber_data.dict(exclude_unset=True).items():
            setattr(subscriber, field, value)
        
        if subscriber_data.status == SubscriberStatus.UNSUBSCRIBED:
            subscriber.unsubscribed_at = utc_now()
        
        self.db.commit()
        self.db.refresh(subscriber)
        return subscriber

    def unsubscribe(self, email: str) -> bool:
        subscriber = self.db.query(Subscriber).filter(Subscriber.email == email).first()
        if subscriber:
            subscriber.status = SubscriberStatus.UNSUBSCRIBED
            subscriber.unsubscribed_at = utc_now()
            self.db.commit()
            return True
        return False

    def get_segments(self) -> List[Dict[str, Any]]:
        # Get actual segment data from database
        total_active = self.db.query(Subscriber).filter(Subscriber.status == SubscriberStatus.ACTIVE).count()
        
        result = [{
            "segment": "All Subscribers",
            "count": total_active,
            "growth": 0,
            "active": True
        }]
        
        # If no subscribers, return just the all subscribers segment
        if total_active == 0:
            return result
        
        # Get subscribers with segments and count manually
        subscribers_with_segments = self.db.query(Subscriber).filter(
            Subscriber.status == SubscriberStatus.ACTIVE,
            Subscriber.segments.isnot(None)
        ).all()
        
        segment_counts = {}
        for subscriber in subscribers_with_segments:
            if subscriber.segments:
                for segment in subscriber.segments:
                    segment_counts[segment] = segment_counts.get(segment, 0) + 1
        
        for segment, count in segment_counts.items():
            segment_name = segment.replace('_', ' ').title()
            result.append({
                "segment": segment_name,
                "count": count,
                "growth": 0,
                "active": True
            })
        
        return result
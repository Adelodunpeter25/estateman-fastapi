from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional
from datetime import datetime
from ..models.event import Event, EventAttendee, EventStatus
from ..schemas.event import EventCreate, EventUpdate, EventAttendeeCreate
from ..core.datetime_utils import utc_now

class EventService:
    def __init__(self, db: Session):
        self.db = db

    def create_event(self, event_data: EventCreate, organizer_id: int) -> Event:
        event = Event(**event_data.dict(), organizer_id=organizer_id)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(self, skip: int = 0, limit: int = 100, event_type: Optional[str] = None, status: Optional[EventStatus] = None) -> List[Event]:
        query = self.db.query(Event)
        if event_type:
            query = query.filter(Event.event_type == event_type)
        if status:
            query = query.filter(Event.status == status)
        return query.order_by(Event.start_date).offset(skip).limit(limit).all()

    def get_event(self, event_id: int) -> Optional[Event]:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def update_event(self, event_id: int, event_data: EventUpdate) -> Optional[Event]:
        event = self.get_event(event_id)
        if not event:
            return None
        
        for field, value in event_data.dict(exclude_unset=True).items():
            setattr(event, field, value)
        
        event.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(event)
        return event

    def register_attendee(self, attendee_data: EventAttendeeCreate) -> Optional[EventAttendee]:
        # Check if already registered
        existing = self.db.query(EventAttendee).filter(
            and_(
                EventAttendee.event_id == attendee_data.event_id,
                EventAttendee.user_id == attendee_data.user_id
            )
        ).first()
        
        if existing:
            return existing
        
        # Check event capacity
        event = self.get_event(attendee_data.event_id)
        if event and event.max_attendees and event.current_attendees >= event.max_attendees:
            return None
        
        attendee = EventAttendee(**attendee_data.dict())
        self.db.add(attendee)
        
        # Update attendee count
        if event:
            event.current_attendees += 1
        
        self.db.commit()
        self.db.refresh(attendee)
        return attendee

    def get_upcoming_events(self, user_id: Optional[int] = None, days: int = 7) -> List[Event]:
        start_date = utc_now()
        end_date = start_date.replace(hour=23, minute=59, second=59)
        
        query = self.db.query(Event).filter(
            and_(
                Event.start_date >= start_date,
                Event.start_date <= end_date,
                Event.status.in_([EventStatus.SCHEDULED, EventStatus.UPCOMING])
            )
        )
        
        if user_id:
            query = query.filter(Event.organizer_id == user_id)
        
        return query.order_by(Event.start_date).all()

    def get_event_stats(self) -> dict:
        total_events = self.db.query(Event).count()
        this_month = self.db.query(Event).filter(
            func.extract('month', Event.start_date) == utc_now().month
        ).count()
        
        avg_attendance = self.db.query(func.avg(Event.current_attendees)).scalar() or 0
        
        return {
            "total_events": total_events,
            "this_month": this_month,
            "avg_attendance": round(avg_attendance, 1)
        }
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.event import Event, EventAttendee, EventStatus, Resource, ResourceBooking, UserAvailability, RecurrenceType
from ..models.user import User
from ..schemas.event import EventCreate, EventUpdate, EventAttendeeCreate
from ..core.datetime_utils import utc_now
from ..core.websocket import realtime_service
import asyncio

class EventService:
    def __init__(self, db: Session):
        self.db = db

    def create_event(self, event_data: EventCreate, organizer_id: int) -> Event:
        event = Event(**event_data.dict(), organizer_id=organizer_id)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(self, skip: int = 0, limit: int = 100, event_type: Optional[str] = None, status: Optional[EventStatus] = None) -> List[dict]:
        query = self.db.query(Event).options(joinedload(Event.organizer))
        if event_type:
            query = query.filter(Event.event_type == event_type)
        if status:
            query = query.filter(Event.status == status)
        
        events = query.order_by(Event.start_date).offset(skip).limit(limit).all()
        
        # Format for frontend
        result = []
        for event in events:
            event_dict = {
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "event_type": event.event_type.value,
                "status": event.status.value,
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat(),
                "location": event.location,
                "is_virtual": event.is_virtual,
                "meeting_url": event.meeting_url,
                "max_attendees": event.max_attendees,
                "current_attendees": event.current_attendees,
                "organizer_id": event.organizer_id,
                "created_at": event.created_at.isoformat(),
                "updated_at": event.updated_at.isoformat() if event.updated_at else None,
                # Frontend compatibility fields
                "type": event.event_type.value,
                "date": event.start_date.strftime("%Y-%m-%d"),
                "time": f"{event.start_date.strftime('%I:%M %p')} - {event.end_date.strftime('%I:%M %p')}",
                "attendees": event.current_attendees,
                "maxAttendees": event.max_attendees,
                "organizer": f"{event.organizer.first_name} {event.organizer.last_name}" if event.organizer and event.organizer.first_name and event.organizer.last_name else None,
                "organizerInitials": f"{event.organizer.first_name[0]}{event.organizer.last_name[0]}" if event.organizer and event.organizer.first_name and event.organizer.last_name else None
            }
            result.append(event_dict)
        
        return result

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
        
        # Send real-time notification
        try:
            asyncio.create_task(
                realtime_service.send_event_notification(
                    attendee.user_id,
                    {
                        "type": "event_registration",
                        "event_id": event.id,
                        "title": event.title,
                        "start_date": event.start_date.isoformat()
                    }
                )
            )
        except Exception:
            pass
        
        return attendee

    def get_upcoming_events(self, user_id: Optional[int] = None, days: int = 7) -> List[dict]:
        start_date = utc_now()
        end_date = start_date.replace(hour=23, minute=59, second=59)
        
        query = self.db.query(Event).options(joinedload(Event.organizer)).filter(
            and_(
                Event.start_date >= start_date,
                Event.start_date <= end_date,
                Event.status.in_([EventStatus.SCHEDULED, EventStatus.UPCOMING])
            )
        )
        
        if user_id:
            query = query.filter(Event.organizer_id == user_id)
        
        events = query.order_by(Event.start_date).all()
        
        # Format for frontend
        result = []
        for event in events:
            duration_minutes = int((event.end_date - event.start_date).total_seconds() / 60)
            duration_text = f"{duration_minutes} minutes" if duration_minutes < 60 else f"{duration_minutes // 60} hour{'s' if duration_minutes >= 120 else ''}"
            
            event_dict = {
                "id": str(event.id),
                "title": event.title,
                "time": event.start_date.strftime("%I:%M %p"),
                "duration": duration_text,
                "type": event.event_type.value
            }
            result.append(event_dict)
        
        return result

    def get_event_stats(self) -> dict:
        try:
            total_events = self.db.query(Event).count()
            
            # Get current month start and end dates
            now = utc_now()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if now.month == 12:
                month_end = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                month_end = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            this_month = self.db.query(Event).filter(
                and_(
                    Event.start_date >= month_start,
                    Event.start_date < month_end
                )
            ).count()
            
            avg_attendance_result = self.db.query(func.avg(Event.current_attendees)).scalar()
            avg_attendance = round(float(avg_attendance_result), 1) if avg_attendance_result else 0.0
            
            return {
                "total_events": total_events,
                "this_month": this_month,
                "avg_attendance": avg_attendance
            }
        except Exception as e:
            # Return default values if there's an error
            return {
                "total_events": 0,
                "this_month": 0,
                "avg_attendance": 0.0
            }
    
    def create_recurring_event(self, event_data: EventCreate, organizer_id: int, 
                              recurrence_type: RecurrenceType, recurrence_interval: int = 1,
                              recurrence_end_date: Optional[datetime] = None) -> List[Event]:
        """Create recurring events"""
        events = []
        base_event = Event(**event_data.dict(), organizer_id=organizer_id)
        
        # Create parent event
        base_event.recurrence_type = recurrence_type
        base_event.recurrence_interval = recurrence_interval
        base_event.recurrence_end_date = recurrence_end_date
        self.db.add(base_event)
        self.db.commit()
        self.db.refresh(base_event)
        events.append(base_event)
        
        if recurrence_type == RecurrenceType.NONE:
            return events
        
        # Generate recurring instances
        current_date = base_event.start_date
        end_limit = recurrence_end_date or (current_date + timedelta(days=365))  # Default 1 year
        
        while current_date < end_limit:
            if recurrence_type == RecurrenceType.DAILY:
                current_date += timedelta(days=recurrence_interval)
            elif recurrence_type == RecurrenceType.WEEKLY:
                current_date += timedelta(weeks=recurrence_interval)
            elif recurrence_type == RecurrenceType.MONTHLY:
                current_date += timedelta(days=30 * recurrence_interval)  # Approximate
            elif recurrence_type == RecurrenceType.YEARLY:
                current_date += timedelta(days=365 * recurrence_interval)  # Approximate
            
            if current_date >= end_limit:
                break
            
            # Create recurring instance
            duration = base_event.end_date - base_event.start_date
            recurring_event = Event(
                title=base_event.title,
                description=base_event.description,
                event_type=base_event.event_type,
                start_date=current_date,
                end_date=current_date + duration,
                location=base_event.location,
                is_virtual=base_event.is_virtual,
                meeting_url=base_event.meeting_url,
                max_attendees=base_event.max_attendees,
                organizer_id=organizer_id,
                parent_event_id=base_event.id,
                recurrence_type=RecurrenceType.NONE
            )
            self.db.add(recurring_event)
            events.append(recurring_event)
        
        self.db.commit()
        return events
    
    def book_resource(self, event_id: int, resource_id: int, user_id: int, 
                     start_time: datetime, end_time: datetime, notes: Optional[str] = None) -> Optional[ResourceBooking]:
        """Book a resource for an event"""
        # Check if resource is available
        conflicting_bookings = self.db.query(ResourceBooking).filter(
            and_(
                ResourceBooking.resource_id == resource_id,
                ResourceBooking.status == "confirmed",
                ResourceBooking.start_time < end_time,
                ResourceBooking.end_time > start_time
            )
        ).count()
        
        if conflicting_bookings > 0:
            return None
        
        booking = ResourceBooking(
            resource_id=resource_id,
            event_id=event_id,
            booked_by=user_id,
            start_time=start_time,
            end_time=end_time,
            notes=notes
        )
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def get_user_availability(self, user_id: int, date: datetime) -> List[Dict[str, Any]]:
        """Get user availability for a specific date"""
        day_of_week = date.weekday()  # 0=Monday, 6=Sunday
        
        availability = self.db.query(UserAvailability).filter(
            and_(
                UserAvailability.user_id == user_id,
                UserAvailability.day_of_week == day_of_week,
                UserAvailability.is_available == True
            )
        ).all()
        
        # Get existing events for the day
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        existing_events = self.db.query(Event).filter(
            and_(
                Event.organizer_id == user_id,
                Event.start_date >= day_start,
                Event.start_date < day_end
            )
        ).all()
        
        # Calculate available slots
        available_slots = []
        for slot in availability:
            slot_start = datetime.combine(date.date(), datetime.strptime(slot.start_time, "%H:%M").time())
            slot_end = datetime.combine(date.date(), datetime.strptime(slot.end_time, "%H:%M").time())
            
            # Check for conflicts with existing events
            is_available = True
            for event in existing_events:
                if event.start_date < slot_end and event.end_date > slot_start:
                    is_available = False
                    break
            
            if is_available:
                available_slots.append({
                    "start_time": slot.start_time,
                    "end_time": slot.end_time,
                    "timezone": slot.timezone
                })
        
        return available_slots
    
    def sync_with_external_calendar(self, user_id: int, calendar_type: str = "google") -> Dict[str, Any]:
        """Sync events with external calendar (mock implementation)"""
        # This would integrate with actual calendar APIs
        return {
            "success": True,
            "synced_events": 0,
            "message": f"Calendar sync with {calendar_type} completed"
        }
    
    async def send_event_reminders(self, event_id: int) -> Dict[str, Any]:
        """Send event reminders to attendees"""
        event = self.get_event(event_id)
        if not event:
            return {"success": False, "message": "Event not found"}
        
        attendees = self.db.query(EventAttendee).filter(
            EventAttendee.event_id == event_id
        ).all()
        
        reminder_count = 0
        for attendee in attendees:
            try:
                await realtime_service.send_event_notification(
                    attendee.user_id,
                    {
                        "event_id": event_id,
                        "title": event.title,
                        "start_date": event.start_date.isoformat(),
                        "location": event.location
                    }
                )
                reminder_count += 1
            except Exception:
                pass
        
        return {
            "success": True,
            "reminders_sent": reminder_count,
            "total_attendees": len(attendees)
        }

class ResourceService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_available_resources(self, start_time: datetime, end_time: datetime, 
                              resource_type: Optional[str] = None) -> List[Resource]:
        """Get available resources for a time period"""
        query = self.db.query(Resource).filter(Resource.is_available == True)
        
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        
        resources = query.all()
        
        # Filter out resources with conflicting bookings
        available_resources = []
        for resource in resources:
            conflicting_bookings = self.db.query(ResourceBooking).filter(
                and_(
                    ResourceBooking.resource_id == resource.id,
                    ResourceBooking.status == "confirmed",
                    ResourceBooking.start_time < end_time,
                    ResourceBooking.end_time > start_time
                )
            ).count()
            
            if conflicting_bookings == 0:
                available_resources.append(resource)
        
        return available_resources
    
    def get_resource_bookings(self, resource_id: int, start_date: Optional[datetime] = None,
                             end_date: Optional[datetime] = None) -> List[ResourceBooking]:
        """Get bookings for a resource"""
        query = self.db.query(ResourceBooking).filter(ResourceBooking.resource_id == resource_id)
        
        if start_date:
            query = query.filter(ResourceBooking.start_time >= start_date)
        if end_date:
            query = query.filter(ResourceBooking.end_time <= end_date)
        
        return query.order_by(ResourceBooking.start_time).all()
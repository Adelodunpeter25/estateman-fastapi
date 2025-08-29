from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.event import EventStatus
from ....schemas.event import (
    EventCreate, EventUpdate, EventResponse,
    EventAttendeeCreate, EventAttendeeResponse
)
from typing import Optional
from ....services.event import EventService

router = APIRouter()

@router.post("/events", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    return service.create_event(event_data, current_user.id)

@router.get("/events/stats")
async def get_event_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    return service.get_event_stats()

@router.get("/events/upcoming/today")
async def get_today_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    events = service.get_upcoming_events(current_user.id, days=1)
    return events

@router.get("/events")
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[str] = None,
    status: Optional[EventStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    return service.get_events(skip, limit, event_type, status)

@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    event = service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    event = service.update_event(event_id, event_data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/events/{event_id}/register", response_model=EventAttendeeResponse)
async def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    attendee_data = EventAttendeeCreate(event_id=event_id, user_id=current_user.id)
    attendee = service.register_attendee(attendee_data)
    if not attendee:
        raise HTTPException(status_code=400, detail="Unable to register for event")
    return attendee

# Enhanced event endpoints
@router.post("/events/recurring")
async def create_recurring_event(
    event_data: EventCreate,
    recurrence_type: str,
    recurrence_interval: int = 1,
    recurrence_end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    from ....models.event import RecurrenceType
    
    service = EventService(db)
    end_date = None
    if recurrence_end_date:
        end_date = datetime.fromisoformat(recurrence_end_date)
    
    events = service.create_recurring_event(
        event_data, current_user.id, 
        RecurrenceType(recurrence_type), recurrence_interval, end_date
    )
    
    return {"message": f"Created {len(events)} recurring events", "event_count": len(events)}

@router.get("/events/{event_id}/reminders")
async def send_event_reminders(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    result = await service.send_event_reminders(event_id)
    return result

@router.get("/users/{user_id}/availability")
async def get_user_availability(
    user_id: int,
    date: str,  # YYYY-MM-DD format
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    service = EventService(db)
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    availability = service.get_user_availability(user_id, date_obj)
    return {"availability": availability}

@router.post("/calendar/sync")
async def sync_external_calendar(
    calendar_type: str = "google",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    result = service.sync_with_external_calendar(current_user.id, calendar_type)
    return result

# Resource management endpoints
@router.get("/resources/available")
async def get_available_resources(
    start_time: str,  # ISO format
    end_time: str,    # ISO format
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    from ....services.event import ResourceService
    
    service = ResourceService(db)
    start_dt = datetime.fromisoformat(start_time)
    end_dt = datetime.fromisoformat(end_time)
    
    resources = service.get_available_resources(start_dt, end_dt, resource_type)
    return {"resources": resources}

@router.post("/events/{event_id}/resources/{resource_id}/book")
async def book_resource(
    event_id: int,
    resource_id: int,
    start_time: str,
    end_time: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    
    service = EventService(db)
    start_dt = datetime.fromisoformat(start_time)
    end_dt = datetime.fromisoformat(end_time)
    
    booking = service.book_resource(event_id, resource_id, current_user.id, start_dt, end_dt, notes)
    if not booking:
        raise HTTPException(status_code=400, detail="Resource not available for the requested time")
    
    return {"message": "Resource booked successfully", "booking_id": booking.id}


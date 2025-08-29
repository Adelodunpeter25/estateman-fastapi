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

@router.get("/events", response_model=List[EventResponse])
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

@router.get("/events/upcoming/today")
async def get_today_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    events = service.get_upcoming_events(current_user.id, days=1)
    return events

@router.get("/events/stats")
async def get_event_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EventService(db)
    return service.get_event_stats()
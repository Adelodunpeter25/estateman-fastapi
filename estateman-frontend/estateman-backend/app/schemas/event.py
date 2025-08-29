from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.event import EventType, EventStatus, AttendeeStatus

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    is_virtual: bool = False
    meeting_url: Optional[str] = None
    max_attendees: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    meeting_url: Optional[str] = None
    max_attendees: Optional[int] = None

class EventResponse(EventBase):
    id: int
    status: EventStatus
    current_attendees: int
    organizer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EventResponseExtended(EventResponse):
    organizer: Optional[str] = None
    organizerInitials: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[int] = None

class EventAttendeeCreate(BaseModel):
    event_id: int
    user_id: int

class EventAttendeeResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    status: AttendeeStatus
    registered_at: datetime

    class Config:
        from_attributes = True
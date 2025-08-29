from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class EventType(str, enum.Enum):
    OPEN_HOUSE = "Open House"
    SEMINAR = "Seminar"
    WORKSHOP = "Workshop"
    TRAINING = "Training"
    MEETING = "Meeting"
    APPOINTMENT = "Appointment"

class EventStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    UPCOMING = "Upcoming"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class ResourceType(str, enum.Enum):
    ROOM = "room"
    EQUIPMENT = "equipment"
    VEHICLE = "vehicle"
    OTHER = "other"

class AttendeeStatus(str, enum.Enum):
    REGISTERED = "registered"
    ATTENDED = "attended"
    NO_SHOW = "no_show"

class RecurrenceType(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(Enum(EventType), nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.SCHEDULED)
    
    # Date and time
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    
    # Location
    location = Column(String(500))
    is_virtual = Column(Boolean, default=False)
    meeting_url = Column(String(500))
    
    # Capacity
    max_attendees = Column(Integer)
    current_attendees = Column(Integer, default=0)
    
    # Organizer
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Recurrence
    recurrence_type = Column(Enum(RecurrenceType), default=RecurrenceType.NONE)
    recurrence_interval = Column(Integer, default=1)  # Every N days/weeks/months
    recurrence_end_date = Column(DateTime(timezone=True))
    parent_event_id = Column(Integer, ForeignKey("events.id"))  # For recurring event instances
    
    # Calendar integration
    google_calendar_id = Column(String(500))
    outlook_calendar_id = Column(String(500))
    calendar_sync_enabled = Column(Boolean, default=False)
    
    # Resources
    resources_needed = Column(JSON)  # List of resources like rooms, equipment
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    attendees = relationship("EventAttendee", back_populates="event", cascade="all, delete-orphan")
    organizer = relationship("User", foreign_keys=[organizer_id])
    recurring_instances = relationship("Event", remote_side=[id], backref="parent_event")
    resource_bookings = relationship("ResourceBooking", back_populates="event", cascade="all, delete-orphan")

class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(AttendeeStatus), default=AttendeeStatus.REGISTERED)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="attendees")
    user = relationship("User", foreign_keys=[user_id])

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    resource_type = Column(String(50), nullable=False)  # room, equipment, vehicle
    description = Column(Text)
    capacity = Column(Integer)
    location = Column(String(500))
    is_available = Column(Boolean, default=True)
    booking_rules = Column(JSON)  # Rules for booking this resource
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bookings = relationship("ResourceBooking", back_populates="resource")

class ResourceBooking(Base):
    __tablename__ = "resource_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    booked_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="confirmed")  # confirmed, cancelled, pending
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resource = relationship("Resource", back_populates="bookings")
    event = relationship("Event", back_populates="resource_bookings")
    user = relationship("User", foreign_keys=[booked_by])

class UserAvailability(Base):
    __tablename__ = "user_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM format
    end_time = Column(String(5), nullable=False)  # HH:MM format
    is_available = Column(Boolean, default=True)
    timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
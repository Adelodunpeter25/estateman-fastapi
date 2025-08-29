from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum
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
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    attendees = relationship("EventAttendee", back_populates="event", cascade="all, delete-orphan")

class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="registered")  # registered, attended, no_show
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="attendees")
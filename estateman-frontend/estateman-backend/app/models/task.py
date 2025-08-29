from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TaskStatus(str, enum.Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    PENDING = "Pending"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class ProjectStatus(str, enum.Enum):
    PLANNING = "Planning"
    ON_TRACK = "On Track"
    AT_RISK = "At Risk"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    deadline = Column(DateTime(timezone=True))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(20), unique=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    progress = Column(Integer, default=0)
    
    # Relationships
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Dates
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
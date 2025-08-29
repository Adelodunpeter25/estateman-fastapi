from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.task import TaskStatus, TaskPriority, ProjectStatus

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    deadline: Optional[datetime] = None

class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks_total: int = 0
    tasks_completed: int = 0

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None
    assigned_to: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    progress: Optional[int] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    task_id: str
    status: TaskStatus
    progress: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskResponseExtended(TaskResponse):
    assignee: Optional[str] = None
    assigneeInitials: Optional[str] = None
    project_name: Optional[str] = None
    creator_name: Optional[str] = None
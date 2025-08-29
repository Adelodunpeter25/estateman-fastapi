from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....models.task import TaskStatus
from ....schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse
)
from typing import Optional
from ....services.task import TaskService, ProjectService

router = APIRouter()

# Task stats endpoint
@router.get("/stats")
async def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    return service.get_task_stats()

# Task endpoints
@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    return service.create_task(task_data, current_user.id)

@router.get("/tasks")
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    return service.get_tasks(skip, limit, status, assigned_to)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    task = service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    task = service.update_task(task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    if not service.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# Project endpoints
@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    return service.create_project(project_data, current_user.id)

@router.get("/projects")
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    return service.get_projects(skip, limit)

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    project_stats = service.get_project_with_stats(project_id)
    if not project_stats:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project_stats)

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    project = service.update_project(project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Enhanced task management endpoints
@router.post("/tasks/{task_id}/dependencies")
async def add_task_dependency(
    task_id: int,
    depends_on_task_id: int,
    dependency_type: str = "finish_to_start",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    dependency = service.add_task_dependency(task_id, depends_on_task_id, dependency_type)
    if not dependency:
        raise HTTPException(status_code=400, detail="Could not create dependency")
    return {"message": "Dependency added successfully"}

@router.post("/tasks/{task_id}/time/start")
async def start_time_tracking(
    task_id: int,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    time_log = service.start_time_tracking(task_id, current_user.id, description)
    if not time_log:
        raise HTTPException(status_code=400, detail="Could not start time tracking")
    return {"message": "Time tracking started", "time_log_id": time_log.id}

@router.post("/tasks/{task_id}/time/stop")
async def stop_time_tracking(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    time_log = service.stop_time_tracking(task_id, current_user.id)
    if not time_log:
        raise HTTPException(status_code=400, detail="No active time tracking found")
    return {"message": "Time tracking stopped", "duration_minutes": time_log.duration_minutes}

@router.get("/kanban")
async def get_kanban_board(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    return service.get_kanban_board(project_id)

@router.get("/projects/{project_id}/gantt")
async def get_project_gantt(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    gantt_data = service.get_project_gantt_data(project_id)
    if not gantt_data:
        raise HTTPException(status_code=404, detail="Project not found")
    return gantt_data
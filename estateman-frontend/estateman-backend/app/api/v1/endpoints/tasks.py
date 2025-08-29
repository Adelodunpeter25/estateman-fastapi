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
from ....services.task import TaskService, ProjectService

router = APIRouter()

# Task endpoints
@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TaskService(db)
    return service.create_task(task_data, current_user.id)

@router.get("/tasks", response_model=List[TaskResponse])
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

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    projects = service.get_projects(skip, limit)
    
    # Add task statistics
    result = []
    for project in projects:
        project_dict = project.__dict__.copy()
        stats = service.get_project_with_stats(project.id)
        if stats:
            project_dict.update({
                "tasks_total": stats["tasks_total"],
                "tasks_completed": stats["tasks_completed"]
            })
        result.append(ProjectResponse(**project_dict))
    
    return result

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
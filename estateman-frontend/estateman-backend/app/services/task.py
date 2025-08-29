from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from ..models.task import Task, Project, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate, ProjectCreate, ProjectUpdate
from ..core.datetime_utils import utc_now
import uuid

class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, task_data: TaskCreate, user_id: int) -> Task:
        task = Task(
            **task_data.dict(),
            task_id=f"TASK-{str(uuid.uuid4())[:8].upper()}",
            created_by=user_id
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_tasks(self, skip: int = 0, limit: int = 100, status: Optional[TaskStatus] = None, assigned_to: Optional[int] = None) -> List[Task]:
        query = self.db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
        return query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()

    def get_task(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def update_task(self, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        task = self.get_task(task_id)
        if not task:
            return None
        
        for field, value in task_data.dict(exclude_unset=True).items():
            setattr(task, field, value)
        
        task.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int) -> bool:
        task = self.get_task(task_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        return True

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_data: ProjectCreate, user_id: int) -> Project:
        project = Project(**project_data.dict(), created_by=user_id)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        return self.db.query(Project).order_by(desc(Project.created_at)).offset(skip).limit(limit).all()

    def get_project(self, project_id: int) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_project_with_stats(self, project_id: int) -> Optional[dict]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        total_tasks = self.db.query(Task).filter(Task.project_id == project_id).count()
        completed_tasks = self.db.query(Task).filter(
            Task.project_id == project_id,
            Task.status == TaskStatus.COMPLETED
        ).count()
        
        return {
            **project.__dict__,
            "tasks_total": total_tasks,
            "tasks_completed": completed_tasks
        }

    def update_project(self, project_id: int, project_data: ProjectUpdate) -> Optional[Project]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        for field, value in project_data.dict(exclude_unset=True).items():
            setattr(project, field, value)
        
        project.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(project)
        return project
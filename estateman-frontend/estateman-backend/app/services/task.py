from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.task import Task, Project, TaskStatus, TaskDependency, TaskTimeLog, TaskComment, ProjectMember
from ..models.user import User
from ..schemas.task import TaskCreate, TaskUpdate, ProjectCreate, ProjectUpdate
from ..core.datetime_utils import utc_now
from ..core.websocket import realtime_service
import uuid
import asyncio

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

    def get_tasks(self, skip: int = 0, limit: int = 100, status: Optional[TaskStatus] = None, assigned_to: Optional[int] = None) -> List[dict]:
        query = self.db.query(Task).options(
            joinedload(Task.assigned_user),
            joinedload(Task.creator),
            joinedload(Task.project)
        )
        if status:
            query = query.filter(Task.status == status)
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
        
        tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
        
        # Format for frontend
        result = []
        for task in tasks:
            task_dict = {
                "id": task.id,
                "task_id": task.task_id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "progress": task.progress,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                "assignee": f"{task.assigned_user.first_name} {task.assigned_user.last_name}" if task.assigned_user and task.assigned_user.first_name and task.assigned_user.last_name else None,
                "assigneeInitials": f"{task.assigned_user.first_name[0]}{task.assigned_user.last_name[0]}" if task.assigned_user and task.assigned_user.first_name and task.assigned_user.last_name else None,
                "project": task.project.name if task.project else None,
                "tags": []  # Add tags logic if needed
            }
            result.append(task_dict)
        
        return result

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
    
    def add_task_dependency(self, task_id: int, depends_on_task_id: int, dependency_type: str = "finish_to_start") -> Optional[TaskDependency]:
        """Add dependency between tasks"""
        task = self.get_task(task_id)
        depends_on_task = self.get_task(depends_on_task_id)
        
        if not task or not depends_on_task:
            return None
        
        existing = self.db.query(TaskDependency).filter(
            and_(
                TaskDependency.task_id == task_id,
                TaskDependency.depends_on_task_id == depends_on_task_id
            )
        ).first()
        
        if existing:
            return existing
        
        dependency = TaskDependency(
            task_id=task_id,
            depends_on_task_id=depends_on_task_id,
            dependency_type=dependency_type
        )
        self.db.add(dependency)
        self.db.commit()
        self.db.refresh(dependency)
        return dependency
    
    def start_time_tracking(self, task_id: int, user_id: int, description: Optional[str] = None) -> Optional[TaskTimeLog]:
        """Start time tracking for a task"""
        active_log = self.db.query(TaskTimeLog).filter(
            and_(
                TaskTimeLog.task_id == task_id,
                TaskTimeLog.user_id == user_id,
                TaskTimeLog.end_time.is_(None)
            )
        ).first()
        
        if active_log:
            return active_log
        
        time_log = TaskTimeLog(
            task_id=task_id,
            user_id=user_id,
            start_time=utc_now(),
            description=description
        )
        self.db.add(time_log)
        self.db.commit()
        self.db.refresh(time_log)
        return time_log
    
    def stop_time_tracking(self, task_id: int, user_id: int) -> Optional[TaskTimeLog]:
        """Stop time tracking for a task"""
        active_log = self.db.query(TaskTimeLog).filter(
            and_(
                TaskTimeLog.task_id == task_id,
                TaskTimeLog.user_id == user_id,
                TaskTimeLog.end_time.is_(None)
            )
        ).first()
        
        if not active_log:
            return None
        
        active_log.end_time = utc_now()
        duration = active_log.end_time - active_log.start_time
        active_log.duration_minutes = int(duration.total_seconds() / 60)
        
        self.db.commit()
        self.db.refresh(active_log)
        return active_log
    
    def get_kanban_board(self, project_id: Optional[int] = None) -> Dict[str, List[Dict[str, Any]]]:
        """Get tasks organized by status for Kanban board"""
        query = self.db.query(Task).options(
            joinedload(Task.assigned_user),
            joinedload(Task.project)
        )
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        
        tasks = query.all()
        
        kanban_board = {
            "Not Started": [],
            "In Progress": [],
            "Pending": [],
            "Completed": [],
            "Cancelled": []
        }
        
        for task in tasks:
            task_data = {
                "id": task.id,
                "task_id": task.task_id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority.value,
                "progress": task.progress,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "assignee": {
                    "name": f"{task.assigned_user.first_name} {task.assigned_user.last_name}" if task.assigned_user else None,
                    "initials": f"{task.assigned_user.first_name[0]}{task.assigned_user.last_name[0]}" if task.assigned_user and task.assigned_user.first_name and task.assigned_user.last_name else None
                },
                "project": task.project.name if task.project else None
            }
            
            status_key = task.status.value
            if status_key in kanban_board:
                kanban_board[status_key].append(task_data)
        
        return kanban_board

    def get_task_stats(self) -> dict:
        try:
            total_tasks = self.db.query(Task).count()
            completed_tasks = self.db.query(Task).filter(Task.status == TaskStatus.COMPLETED).count()
            in_progress_tasks = self.db.query(Task).filter(Task.status == TaskStatus.IN_PROGRESS).count()
            
            # Calculate overdue tasks (due_date < now and not completed)
            from ..core.datetime_utils import utc_now
            overdue_tasks = self.db.query(Task).filter(
                and_(
                    Task.due_date < utc_now(),
                    Task.status != TaskStatus.COMPLETED
                )
            ).count()
            
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            return {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "in_progress_tasks": in_progress_tasks,
                "overdue_tasks": overdue_tasks,
                "completion_rate": round(completion_rate, 1)
            }
        except Exception:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "in_progress_tasks": 0,
                "overdue_tasks": 0,
                "completion_rate": 0.0
            }

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_data: ProjectCreate, user_id: int) -> Project:
        project = Project(**project_data.dict(), created_by=user_id)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_projects(self, skip: int = 0, limit: int = 100) -> List[dict]:
        projects = self.db.query(Project).options(joinedload(Project.creator)).order_by(desc(Project.created_at)).offset(skip).limit(limit).all()
        
        # Format for frontend with task statistics
        result = []
        for project in projects:
            total_tasks = self.db.query(Task).filter(Task.project_id == project.id).count()
            completed_tasks = self.db.query(Task).filter(
                Task.project_id == project.id,
                Task.status == TaskStatus.COMPLETED
            ).count()
            
            # Get team members (users assigned to tasks in this project)
            team_members = self.db.query(User).join(Task, User.id == Task.assigned_to).filter(
                Task.project_id == project.id
            ).distinct().all()
            
            project_dict = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "deadline": project.deadline.isoformat() if project.deadline else None,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat() if project.updated_at else None,
                "tasks_total": total_tasks,
                "tasks_completed": completed_tasks,
                "team": [f"{member.first_name[0]}{member.last_name[0]}" for member in team_members[:5] if member.first_name and member.last_name]  # Limit to 5 members
            }
            result.append(project_dict)
        
        return result

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
    
    def get_project_gantt_data(self, project_id: int) -> Dict[str, Any]:
        """Get project data formatted for Gantt chart"""
        project = self.get_project(project_id)
        if not project:
            return {}
        
        tasks = self.db.query(Task).filter(Task.project_id == project_id).all()
        
        gantt_tasks = []
        for task in tasks:
            gantt_task = {
                "id": task.id,
                "name": task.title,
                "start": task.created_at.isoformat(),
                "end": task.due_date.isoformat() if task.due_date else (task.created_at + timedelta(days=7)).isoformat(),
                "progress": task.progress,
                "dependencies": [dep.depends_on_task_id for dep in task.dependencies],
                "assignee": f"{task.assigned_user.first_name} {task.assigned_user.last_name}" if task.assigned_user else None,
                "status": task.status.value
            }
            gantt_tasks.append(gantt_task)
        
        return {
            "project": {
                "id": project.id,
                "name": project.name,
                "start": project.created_at.isoformat(),
                "end": project.deadline.isoformat() if project.deadline else None
            },
            "tasks": gantt_tasks
        }
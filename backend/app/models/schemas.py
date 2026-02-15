from pydantic import BaseModel
from typing import Optional
from datetime import date

class SystemStatus(BaseModel):
    is_git_initialized: bool
    has_default_project: bool
    current_project: Optional[str] = None

class ProjectCreateInput(BaseModel):
    project_name: str

class ProjectSettings(BaseModel):
    project_name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class TaskInput(BaseModel):
    title: str
    status: str
    assignee_id: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    parent_id: Optional[str] = None

class Task(TaskInput):
    id: str

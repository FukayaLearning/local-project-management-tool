from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from backend.app.domain.entities.settings import ProjectSettings, BasicSettings

class TaskCreateDTO(BaseModel):
    title: str
    status: str
    assignee_id: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    parent_id: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    planned_hours: Optional[float] = None
    display_order: int = 0
    
class TaskUpdateDTO(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    parent_id: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    planned_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: Optional[int] = None
    display_order: Optional[int] = None

class TaskOrderUpdateDTO(BaseModel):
    id: str
    display_order: int

class SettingsUpdateDTO(BaseModel):
    # Depending on requirements, we might update full project settings or just parts
    project_name: Optional[str] = None
    basic_settings_override: Optional[BasicSettings] = None

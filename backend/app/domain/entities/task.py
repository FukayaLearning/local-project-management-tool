from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import date

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    status: str
    assignee_id: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    parent_id: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    planned_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: int = 0  # 0-100
    display_order: int = 0
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None

from pydantic import BaseModel, Field
from typing import List, Optional
import uuid


class TaskStatus(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    is_completed_state: bool = False


class TaskType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str


class Assignee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    productivity_ratio: float = 1.0
    commitment_ratio: float = 1.0


class HolidayDefinition(BaseModel):
    holiday_csv_url: str = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv"
    weekend_days: List[int] = [5, 6]
    extra_holidays: List[str] = []
    extra_workdays: List[str] = []


class BasicSettings(BaseModel):
    task_statuses: List[TaskStatus] = [
        TaskStatus(name="New"),
        TaskStatus(name="Todo"),
        TaskStatus(name="Doing"),
        TaskStatus(name="Done", is_completed_state=True),
        TaskStatus(name="Postponed")
    ]
    task_types: List[TaskType] = [
        TaskType(name="Idea"),
        TaskType(name="Task"),
        TaskType(name="Story"),
        TaskType(name="Bug")
    ]
    assignees: List[Assignee] = []
    daily_work_hours: float = 8.0
    holiday_definition: HolidayDefinition = HolidayDefinition()


class ProjectSettings(BaseModel):
    project_name: str = ""
    basic_settings_override: Optional[BasicSettings] = None

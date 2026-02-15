from pydantic import BaseModel
from typing import Optional


class SystemStatusDTO(BaseModel):
    is_git_initialized: bool
    has_default_project: bool
    current_project: Optional[str] = None


class ProjectCreateDTO(BaseModel):
    project_name: str

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.settings import ProjectSettings, SettingsUpdateDTO
from ..schemas.system import ProjectCreateDTO
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.infrastructure.file_system.settings_repository import SettingsFileRepository
from backend.app.infrastructure.git.git_service import GitService

router = APIRouter()


def get_settings_usecase():
    repo = SettingsFileRepository()
    git = GitService()
    return SettingsUseCase(repo, git)


def get_project_usecase():
    git = GitService()
    return ProjectUseCase(git)


@router.get("/settings", response_model=ProjectSettings)
def get_project_settings(usecase: SettingsUseCase = Depends(get_settings_usecase)):
    return usecase.get_project_settings()


@router.put("/settings", response_model=ProjectSettings)
def update_project_settings(dto: SettingsUpdateDTO, usecase: SettingsUseCase = Depends(get_settings_usecase)):
    return usecase.update_project_settings(dto)


@router.post("/")
def create_project(dto: ProjectCreateDTO, usecase: ProjectUseCase = Depends(get_project_usecase)):
    try:
        return usecase.create_project(dto.project_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[str])
def list_projects(usecase: ProjectUseCase = Depends(get_project_usecase)):
    return usecase.list_projects()


@router.post("/{project_name}/switch")
def switch_project(project_name: str, usecase: ProjectUseCase = Depends(get_project_usecase)):
    try:
        usecase.switch_project(project_name)
        return {"message": f"Switched to project {project_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

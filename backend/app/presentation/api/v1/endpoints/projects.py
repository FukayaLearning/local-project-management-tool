from fastapi import APIRouter, Depends
from ..schemas.settings import ProjectSettings, SettingsUpdateDTO
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.infrastructure.file_system.settings_repository import SettingsFileRepository
from backend.app.infrastructure.git.git_service import GitService

router = APIRouter()

def get_settings_usecase():
    repo = SettingsFileRepository()
    git = GitService()
    return SettingsUseCase(repo, git)

@router.get("/settings", response_model=ProjectSettings)
def get_project_settings(usecase: SettingsUseCase = Depends(get_settings_usecase)):
    return usecase.get_project_settings()

@router.put("/settings", response_model=ProjectSettings)
def update_project_settings(dto: SettingsUpdateDTO, usecase: SettingsUseCase = Depends(get_settings_usecase)):
    return usecase.update_project_settings(dto)

from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.entities.settings import Settings, ProjectSettings
from backend.app.infrastructure.git.git_service import GitService
from backend.app.application.dtos.task_dto import SettingsUpdateDTO # Reuse for now

class SettingsUseCase:
    def __init__(self, settings_repo: ISettingsRepository, git_service: GitService):
        self.settings_repo = settings_repo
        self.git_service = git_service

    def get_settings(self) -> Settings:
        if self.git_service.has_uncommitted_changes():
            self.git_service.commit("Manual change detected during runtime (settings)")
        return self.settings_repo.get_settings()
    
    def get_project_settings(self) -> ProjectSettings:
        settings = self.settings_repo.get_settings()
        return settings.project

    def update_project_settings(self, dto: SettingsUpdateDTO) -> ProjectSettings:
        current_settings = self.settings_repo.get_settings()
        
        # Update logic
        if dto.project_name is not None:
             current_settings.project.project_name = dto.project_name
        if dto.basic_settings_override is not None:
             current_settings.project.basic_settings_override = dto.basic_settings_override
             
        # Save
        self.settings_repo.save_settings(current_settings)
        
        # Commit
        self.git_service.commit("Update project settings")
        
        return current_settings.project

from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.entities.settings import Settings, ProjectSettings
from backend.app.application.dtos.task_dto import SettingsUpdateDTO


class SettingsUseCase:
    def __init__(self, settings_repository: ISettingsRepository, git_repository: IGitRepository):
        self.settings_repository = settings_repository
        self.git_repository = git_repository

    def get_settings(self) -> Settings:
        if self.git_repository.has_uncommitted_changes():
            self.git_repository.commit("Manual change detected during runtime (settings)")
        return self.settings_repository.get_settings()

    def get_project_settings(self) -> ProjectSettings:
        settings = self.settings_repository.get_settings()
        return settings.project

    def update_project_settings(self, dto: SettingsUpdateDTO) -> ProjectSettings:
        current_settings = self.settings_repository.get_settings()

        if dto.project_name is not None:
            current_settings.project.project_name = dto.project_name
        if dto.basic_settings_override is not None:
            current_settings.project.basic_settings_override = dto.basic_settings_override

        self.settings_repository.save_settings(current_settings)
        self.git_repository.commit("Update project settings")

        return current_settings.project

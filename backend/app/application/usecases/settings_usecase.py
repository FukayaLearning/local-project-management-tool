import os
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings
from backend.app.application.dtos.task_dto import SettingsUpdateDTO


class SettingsUseCase:
    def __init__(self, settings_repository: ISettingsRepository, git_repository: IGitRepository):
        self.settings_repository = settings_repository
        self.git_repository = git_repository

    def _get_project_dir(self, project_name: str) -> str:
        data_dir = self.settings_repository.get_data_dir()
        return os.path.join(data_dir, project_name)

    def get_global_settings(self) -> BasicSettings:
        return self.settings_repository.get_global_settings()

    def update_global_settings(self, settings: BasicSettings) -> BasicSettings:
        return self.settings_repository.save_global_settings(settings)

    def get_project_settings(self, project_name: str) -> ProjectSettings:
        project_dir = self._get_project_dir(project_name)
        return self.settings_repository.get_project_settings(project_dir)

    def update_project_settings(self, project_name: str, dto: SettingsUpdateDTO) -> ProjectSettings:
        project_dir = self._get_project_dir(project_name)
        current_settings = self.settings_repository.get_project_settings(project_dir)

        if dto.project_name is not None:
            current_settings.project_name = dto.project_name
        if dto.basic_settings_override is not None:
            current_settings.basic_settings_override = dto.basic_settings_override

        self.settings_repository.save_project_settings(project_dir, current_settings)
        self.git_repository.commit("Update project settings", project_dir)

        return current_settings

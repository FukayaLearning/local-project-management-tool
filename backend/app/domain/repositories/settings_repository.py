from abc import ABC, abstractmethod
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings


class ISettingsRepository(ABC):
    @abstractmethod
    def get_global_settings(self) -> BasicSettings:
        pass

    @abstractmethod
    def save_global_settings(self, settings: BasicSettings) -> BasicSettings:
        pass

    @abstractmethod
    def get_project_settings(self, project_dir: str) -> ProjectSettings:
        pass

    @abstractmethod
    def save_project_settings(self, project_dir: str, settings: ProjectSettings) -> ProjectSettings:
        pass

    @abstractmethod
    def initialize_project_settings(self, project_dir: str, project_name: str) -> None:
        pass

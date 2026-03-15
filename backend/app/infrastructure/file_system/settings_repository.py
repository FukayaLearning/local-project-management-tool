import json
import os
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings
from backend.app.domain.repositories.settings_repository import ISettingsRepository


DEFAULT_DATA_DIR = "data"


class SettingsFileRepository(ISettingsRepository):
    def __init__(self):
        project_root = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__))
                )
            )
        )
        self.data_dir = os.path.join(project_root, DEFAULT_DATA_DIR)
        self.global_settings_file = os.path.join(self.data_dir, "setting.json")
        os.makedirs(self.data_dir, exist_ok=True)

    def get_global_settings(self) -> BasicSettings:
        if not os.path.exists(self.global_settings_file):
            return BasicSettings()
        try:
            with open(self.global_settings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return BasicSettings(**data)
        except (json.JSONDecodeError, FileNotFoundError):
            return BasicSettings()

    def save_global_settings(self, settings: BasicSettings) -> BasicSettings:
        with open(self.global_settings_file, "w", encoding="utf-8") as f:
            json.dump(settings.model_dump(), f, ensure_ascii=False, indent=2)
        return settings

    def get_project_settings(self, project_dir: str) -> ProjectSettings:
        settings_file = os.path.join(project_dir, "setting.json")
        if not os.path.exists(settings_file):
            project_name = os.path.basename(project_dir)
            return ProjectSettings(project_name=project_name)
        try:
            with open(settings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return ProjectSettings(**data)
        except (json.JSONDecodeError, FileNotFoundError):
            project_name = os.path.basename(project_dir)
            return ProjectSettings(project_name=project_name)

    def save_project_settings(self, project_dir: str, settings: ProjectSettings) -> ProjectSettings:
        settings_file = os.path.join(project_dir, "setting.json")
        os.makedirs(project_dir, exist_ok=True)
        with open(settings_file, "w", encoding="utf-8") as f:
            json.dump(settings.model_dump(), f, ensure_ascii=False, indent=2)
        return settings

    def initialize_project_settings(self, project_dir: str, project_name: str) -> None:
        settings = ProjectSettings(project_name=project_name)
        self.save_project_settings(project_dir, settings)

    def get_data_dir(self) -> str:
        return self.data_dir

import json
import os
from backend.app.domain.entities.settings import Settings
from backend.app.domain.repositories.settings_repository import ISettingsRepository

class SettingsFileRepository(ISettingsRepository):
    def __init__(self, data_dir: str = "data"):
        # Go up 3 levels from here: infrastructure/file_system -> app -> backend -> root
        # But data_dir is relative to execution context (usually backend root)
        # Better to make it absolute based on file location
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.data_dir = os.path.join(base_dir, data_dir)
        self.settings_file = os.path.join(self.data_dir, "settings.json")
        os.makedirs(self.data_dir, exist_ok=True)

    def get_settings(self) -> Settings:
        if not os.path.exists(self.settings_file):
            return Settings()
        
        try:
            with open(self.settings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return Settings(**data)
        except (json.JSONDecodeError, FileNotFoundError):
            return Settings()

    def save_settings(self, settings: Settings) -> Settings:
        with open(self.settings_file, "w", encoding="utf-8") as f:
            json.dump(settings.model_dump(), f, ensure_ascii=False, indent=2)
        return settings

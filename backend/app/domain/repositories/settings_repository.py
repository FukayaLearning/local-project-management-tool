from abc import ABC, abstractmethod
from backend.app.domain.entities.settings import Settings

class ISettingsRepository(ABC):
    @abstractmethod
    def get_settings(self) -> Settings:
        pass

    @abstractmethod
    def save_settings(self, settings: Settings) -> Settings:
        pass

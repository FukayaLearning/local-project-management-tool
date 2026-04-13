from abc import ABC, abstractmethod


class IGitRepository(ABC):
    @abstractmethod
    def is_initialized(self, project_dir: str) -> bool:
        pass

    @abstractmethod
    def initialize(self, project_dir: str) -> None:
        pass

    @abstractmethod
    def commit(self, message: str, project_dir: str) -> None:
        pass

    @abstractmethod
    def undo(self, project_dir: str) -> str:
        pass

    @abstractmethod
    def redo(self, project_dir: str) -> str:
        pass

    @abstractmethod
    def has_uncommitted_changes(self, project_dir: str) -> bool:
        pass

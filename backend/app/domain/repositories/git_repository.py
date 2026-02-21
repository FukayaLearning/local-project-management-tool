from abc import ABC, abstractmethod
from typing import List


class IGitRepository(ABC):
    @abstractmethod
    def is_initialized(self) -> bool:
        pass

    @abstractmethod
    def initialize(self) -> None:
        pass

    @abstractmethod
    def get_current_branch(self) -> str:
        pass

    @abstractmethod
    def create_branch(self, branch_name: str) -> None:
        pass

    @abstractmethod
    def checkout_branch(self, branch_name: str) -> None:
        pass

    @abstractmethod
    def get_branches(self) -> List[str]:
        pass

    @abstractmethod
    def commit(self, message: str) -> None:
        pass

    @abstractmethod
    def undo(self) -> str:
        pass

    @abstractmethod
    def redo(self) -> str:
        pass

    @abstractmethod
    def restore(self, commit_hash: str) -> None:
        pass

    @abstractmethod
    def has_uncommitted_changes(self) -> bool:
        pass

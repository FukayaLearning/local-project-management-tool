from abc import ABC, abstractmethod
from typing import List, Optional
from backend.app.domain.entities.task import Task

class ITaskRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Task]:
        pass

    @abstractmethod
    def get_by_id(self, task_id: str) -> Optional[Task]:
        pass

    @abstractmethod
    def save(self, task: Task) -> Task:
        pass

    @abstractmethod
    def update(self, task: Task) -> Task:
        pass

    @abstractmethod
    def delete(self, task_id: str) -> bool:
        pass

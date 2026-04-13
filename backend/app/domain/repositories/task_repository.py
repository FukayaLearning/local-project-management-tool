from abc import ABC, abstractmethod
from typing import List, Optional, Dict
from backend.app.domain.entities.task import Task


class ITaskRepository(ABC):
    @abstractmethod
    def get_all(self, project_dir: str) -> List[Task]:
        pass

    @abstractmethod
    def get_by_id(self, project_dir: str, task_id: str) -> Optional[Task]:
        pass

    @abstractmethod
    def save(self, project_dir: str, task: Task) -> Task:
        pass

    @abstractmethod
    def update(self, project_dir: str, task: Task) -> Task:
        pass

    @abstractmethod
    def delete(self, project_dir: str, task_id: str) -> bool:
        pass

    @abstractmethod
    def update_orders(self, project_dir: str, task_orders: List[Dict]) -> bool:
        pass

    @abstractmethod
    def initialize_empty_csv(self, project_dir: str) -> None:
        pass

import os
from typing import List, Optional
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.entities.task import Task
from backend.app.application.dtos.task_dto import TaskCreateDTO, TaskUpdateDTO, TaskOrderUpdateDTO, TaskBulkUpdateDTO


class TaskUseCase:
    def __init__(
        self,
        task_repository: ITaskRepository,
        git_repository: IGitRepository,
        settings_repository: ISettingsRepository,
    ):
        self.task_repository = task_repository
        self.git_repository = git_repository
        self.settings_repository = settings_repository

    def _get_project_dir(self, project_name: str) -> str:
        data_dir = self.settings_repository.get_data_dir()
        return os.path.join(data_dir, project_name)

    def _ensure_git_initialized(self, project_dir: str) -> None:
        if not self.git_repository.is_initialized(project_dir):
            self.git_repository.initialize(project_dir)
            self.git_repository.commit("Initial commit (auto-initialized)", project_dir)

    def _sync_external_changes(self, project_dir: str) -> None:
        if self.git_repository.is_initialized(project_dir):
            if self.git_repository.has_uncommitted_changes(project_dir):
                self.git_repository.commit(
                    "Manual change detected during runtime", project_dir
                )

    def list_tasks(self, project_name: str) -> List[Task]:
        project_dir = self._get_project_dir(project_name)
        self._sync_external_changes(project_dir)
        return self.task_repository.get_all(project_dir)

    def get_task(self, project_name: str, task_id: str) -> Optional[Task]:
        project_dir = self._get_project_dir(project_name)
        return self.task_repository.get_by_id(project_dir, task_id)

    def create_task(self, project_name: str, dto: TaskCreateDTO) -> Task:
        project_dir = self._get_project_dir(project_name)
        data = dto.model_dump()
        # Ensure dependencies and progress_history are at least empty lists 
        # (they might be None if not provided in DTO but Task entity expects them)
        if data.get("dependencies") is None:
            data["dependencies"] = []
        if data.get("progress_history") is None:
            data["progress_history"] = []
            
        task = Task(**data)

        saved_task = self.task_repository.save(project_dir, task)
        self._ensure_git_initialized(project_dir)
        self.git_repository.commit(f"Add task {saved_task.title}", project_dir)
        return saved_task

    def update_task(self, project_name: str, task_id: str, dto: TaskUpdateDTO) -> Optional[Task]:
        project_dir = self._get_project_dir(project_name)
        task = self.task_repository.get_by_id(project_dir, task_id)
        if not task:
            return None

        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        updated_task = self.task_repository.update(project_dir, task)
        self.git_repository.commit(f"Update task {updated_task.title}", project_dir)
        return updated_task

    def reorder_tasks(self, project_name: str, orders: List[TaskOrderUpdateDTO]) -> bool:
        project_dir = self._get_project_dir(project_name)
        task_orders = [{"id": order.id, "display_order": order.display_order} for order in orders]
        success = self.task_repository.update_orders(project_dir, task_orders)
        if success:
            self.git_repository.commit("Reorder tasks", project_dir)
        return success

    def delete_task(self, project_name: str, task_id: str) -> bool:
        project_dir = self._get_project_dir(project_name)
        result = self.task_repository.delete(project_dir, task_id)
        if result:
            self.git_repository.commit(f"Delete task {task_id}", project_dir)
        return result

    def bulk_update_tasks(self, project_name: str, updates: List[TaskBulkUpdateDTO]) -> bool:
        project_dir = self._get_project_dir(project_name)
        all_tasks = self.task_repository.get_all(project_dir)
        task_map = {t.id: t for t in all_tasks}
        
        updated_any = False
        for update in updates:
            if update.id in task_map:
                task = task_map[update.id]
                task.start_date = update.start_date
                task.due_date = update.due_date
                self.task_repository.update(project_dir, task)
                updated_any = True
        
        if updated_any:
            self.git_repository.commit("Apply schedule to tasks", project_dir)
        return updated_any

    def get_task_file_path(self, project_name: str) -> str:
        project_dir = self._get_project_dir(project_name)
        return os.path.join(project_dir, "tasks.csv")

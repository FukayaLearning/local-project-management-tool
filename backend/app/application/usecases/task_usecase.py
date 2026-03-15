from typing import List, Optional
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.entities.task import Task
from backend.app.application.dtos.task_dto import TaskCreateDTO, TaskUpdateDTO, TaskOrderUpdateDTO


class TaskUseCase:
    def __init__(self, task_repository: ITaskRepository, git_repository: IGitRepository):
        self.task_repository = task_repository
        self.git_repository = git_repository

    def list_tasks(self) -> List[Task]:
        if self.git_repository.has_uncommitted_changes():
            self.git_repository.commit("Manual change detected during runtime (tasks)")
        return self.task_repository.get_all()

    def get_task(self, task_id: str) -> Optional[Task]:
        return self.task_repository.get_by_id(task_id)

    def create_task(self, dto: TaskCreateDTO) -> Task:
        task = Task(
            title=dto.title,
            status=dto.status,
            assignee_id=dto.assignee_id,
            start_date=dto.start_date,
            due_date=dto.due_date,
            parent_id=dto.parent_id,
            description=dto.description,
            task_type=dto.task_type,
            planned_hours=dto.planned_hours
        )

        saved_task = self.task_repository.save(task)
        self.git_repository.commit(f"Add task {saved_task.title}")
        return saved_task

    def update_task(self, task_id: str, dto: TaskUpdateDTO) -> Optional[Task]:
        task = self.task_repository.get_by_id(task_id)
        if not task:
            return None

        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        updated_task = self.task_repository.update(task)
        self.git_repository.commit(f"Update task {updated_task.title}")
        return updated_task

    def reorder_tasks(self, orders: List[TaskOrderUpdateDTO]) -> bool:
        task_orders = [{"id": order.id, "display_order": order.display_order} for order in orders]
        success = self.task_repository.update_orders(task_orders)
        if success:
            self.git_repository.commit("Reorder tasks")
        return success

    def delete_task(self, task_id: str) -> bool:
        result = self.task_repository.delete(task_id)
        if result:
            self.git_repository.commit(f"Delete task {task_id}")
        return result

    def undo(self) -> str:
        return self.git_repository.undo()

    def redo(self) -> str:
        return self.git_repository.redo()

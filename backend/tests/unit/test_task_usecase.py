import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.task_usecase import TaskUseCase
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.infrastructure.git.git_service import GitService
from backend.app.domain.entities.task import Task
from backend.app.application.dtos.task_dto import TaskCreateDTO, TaskUpdateDTO

@pytest.fixture
def mock_repo():
    return MagicMock(spec=ITaskRepository)

@pytest.fixture
def mock_git():
    return MagicMock(spec=GitService)

@pytest.fixture
def usecase(mock_repo, mock_git):
    return TaskUseCase(mock_repo, mock_git)

def test_list_tasks(usecase, mock_repo, mock_git):
    # Arrange
    mock_git.has_uncommitted_changes.return_value = False
    mock_tasks = [Task(title="T1", status="New"), Task(title="T2", status="Done")]
    mock_repo.get_all.return_value = mock_tasks

    # Act
    tasks = usecase.list_tasks()

    # Assert
    assert len(tasks) == 2
    assert tasks[0].title == "T1"
    mock_repo.get_all.assert_called_once()
    mock_git.has_uncommitted_changes.assert_called_once()
    mock_git.commit.assert_not_called()

def test_list_tasks_with_manual_change(usecase, mock_repo, mock_git):
    # Arrange
    mock_git.has_uncommitted_changes.return_value = True
    mock_tasks = [Task(title="T1", status="New")]
    mock_repo.get_all.return_value = mock_tasks

    # Act
    tasks = usecase.list_tasks()

    # Assert
    assert len(tasks) == 1
    mock_git.commit.assert_called_with("Manual change detected during runtime (tasks)")
    mock_repo.get_all.assert_called_once()

def test_create_task(usecase, mock_repo, mock_git):
    # Arrange
    dto = TaskCreateDTO(title="New Task", status="New")
    # Simulate repo.save returning the task passed to it (or similar)
    def save_side_effect(task):
        return task
    mock_repo.save.side_effect = save_side_effect

    # Act
    created_task = usecase.create_task(dto)

    # Assert
    assert created_task.title == "New Task"
    assert created_task.id is not None
    mock_repo.save.assert_called_once()
    mock_git.commit.assert_called_once()

def test_update_task(usecase, mock_repo, mock_git):
    # Arrange
    task_id = "task-1"
    existing_task = Task(id=task_id, title="Old Title", status="New")
    mock_repo.get_by_id.return_value = existing_task
    
    # Simulate update returning the modified task
    def update_side_effect(task):
        return task
    mock_repo.update.side_effect = update_side_effect

    dto = TaskUpdateDTO(title="New Title", status="Doing")

    # Act
    updated_task = usecase.update_task(task_id, dto)

    # Assert
    assert updated_task.title == "New Title"
    assert updated_task.status == "Doing"
    mock_repo.get_by_id.assert_called_with(task_id)
    mock_repo.update.assert_called_once()
    mock_git.commit.assert_called_once()

def test_update_task_not_found(usecase, mock_repo, mock_git):
    # Arrange
    mock_repo.get_by_id.return_value = None
    dto = TaskUpdateDTO(title="Title")

    # Act
    result = usecase.update_task("invalid-id", dto)

    # Assert
    assert result is None
    mock_repo.update.assert_not_called()
    mock_git.commit.assert_not_called()

def test_delete_task(usecase, mock_repo, mock_git):
    # Arrange
    mock_repo.delete.return_value = True

    # Act
    result = usecase.delete_task("task-1")

    # Assert
    assert result is True
    mock_repo.delete.assert_called_with("task-1")
    mock_git.commit.assert_called_once()

def test_undo(usecase, mock_git):
    # Arrange
    mock_git.undo.return_value = "Undo successful"

    # Act
    result = usecase.undo()

    # Assert
    assert result == "Undo successful"
    mock_git.undo.assert_called_once()

def test_redo(usecase, mock_git):
    # Arrange
    mock_git.redo.return_value = "Redo successful"

    # Act
    result = usecase.redo()

    # Assert
    assert result == "Redo successful"
    mock_git.redo.assert_called_once()


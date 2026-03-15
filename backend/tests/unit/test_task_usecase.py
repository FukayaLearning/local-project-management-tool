import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.task_usecase import TaskUseCase
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.entities.task import Task
from backend.app.application.dtos.task_dto import TaskCreateDTO, TaskUpdateDTO, TaskOrderUpdateDTO
from backend.app.domain.entities.settings import BasicSettings

@pytest.fixture
def mock_repo():
    return MagicMock(spec=ITaskRepository)

@pytest.fixture
def mock_git():
    return MagicMock(spec=IGitRepository)

@pytest.fixture
def mock_settings_repo():
    mock = MagicMock(spec=ISettingsRepository)
    mock.get_global_settings.return_value = BasicSettings()
    return mock

@pytest.fixture
def usecase(mock_repo, mock_git, mock_settings_repo):
    return TaskUseCase(mock_repo, mock_git, mock_settings_repo)

def test_list_tasks(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_tasks = [Task(title="T1", status="New"), Task(title="T2", status="Done")]
    mock_repo.get_all.return_value = mock_tasks

    # Act
    tasks = usecase.list_tasks("proj1")

    # Assert
    assert len(tasks) == 2
    assert tasks[0].title == "T1"
    mock_repo.get_all.assert_called_once_with("/mock/dir/proj1")
    # In new specification, has_uncommitted_changes is removed from this flow

def test_create_task(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    dto = TaskCreateDTO(title="New Task", status="New")
    def save_side_effect(proj, task):
        return task
    mock_repo.save.side_effect = save_side_effect

    # Act
    created_task = usecase.create_task("proj1", dto)

    # Assert
    assert created_task.title == "New Task"
    assert created_task.id is not None
    mock_repo.save.assert_called_once()
    mock_git.commit.assert_called_once_with("Add task New Task", "/mock/dir/proj1")

def test_create_task_with_parent_id(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    dto = TaskCreateDTO(title="Sub Task", status="New", parent_id="parent-1")
    def save_side_effect(proj, task):
        return task
    mock_repo.save.side_effect = save_side_effect

    # Act
    created_task = usecase.create_task("proj1", dto)

    # Assert
    assert created_task.title == "Sub Task"
    assert created_task.parent_id == "parent-1"
    assert created_task.id is not None
    mock_repo.save.assert_called_once()
    mock_git.commit.assert_called_once_with("Add task Sub Task", "/mock/dir/proj1")

def test_update_task(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    task_id = "task-1"
    existing_task = Task(id=task_id, title="Old Title", status="New")
    mock_repo.get_by_id.return_value = existing_task
    
    def update_side_effect(proj, task):
        return task
    mock_repo.update.side_effect = update_side_effect

    dto = TaskUpdateDTO(title="New Title", status="Doing")

    # Act
    updated_task = usecase.update_task("proj1", task_id, dto)

    # Assert
    assert updated_task.title == "New Title"
    assert updated_task.status == "Doing"
    mock_repo.get_by_id.assert_called_with("/mock/dir/proj1", task_id)
    mock_repo.update.assert_called_once()
    mock_git.commit.assert_called_once_with("Update task New Title", "/mock/dir/proj1")

def test_update_task_not_found(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_repo.get_by_id.return_value = None
    dto = TaskUpdateDTO(title="Title")

    # Act
    result = usecase.update_task("proj1", "invalid-id", dto)

    # Assert
    assert result is None
    mock_repo.update.assert_not_called()
    mock_git.commit.assert_not_called()

def test_delete_task(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_repo.delete.return_value = True

    # Act
    result = usecase.delete_task("proj1", "task-1")

    # Assert
    assert result is True
    mock_repo.delete.assert_called_with("/mock/dir/proj1", "task-1")
    mock_git.commit.assert_called_once_with("Delete task task-1", "/mock/dir/proj1")

def test_reorder_tasks(usecase, mock_repo, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_repo.update_orders.return_value = True
    orders = [
        TaskOrderUpdateDTO(id="t1", display_order=2),
        TaskOrderUpdateDTO(id="t2", display_order=1)
    ]

    # Act
    result = usecase.reorder_tasks("proj1", orders)

    # Assert
    assert result is True
    # The use case constructs a list of dicts to pass to the repo:
    expected_task_orders = [
        {"id": "t1", "display_order": 2},
        {"id": "t2", "display_order": 1}
    ]
    mock_repo.update_orders.assert_called_with("/mock/dir/proj1", expected_task_orders)
    mock_git.commit.assert_called_once_with("Reorder tasks", "/mock/dir/proj1")

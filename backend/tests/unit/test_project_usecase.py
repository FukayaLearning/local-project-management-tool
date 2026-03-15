import pytest
from unittest.mock import MagicMock, patch
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.domain.helpers.string_helper import validate_project_name
import os

@pytest.fixture
def mock_git():
    return MagicMock(spec=IGitRepository)

@pytest.fixture
def mock_settings_repo():
    return MagicMock(spec=ISettingsRepository)

@pytest.fixture
def mock_task_repo():
    return MagicMock(spec=ITaskRepository)

@pytest.fixture
def usecase(mock_git, mock_settings_repo, mock_task_repo):
    return ProjectUseCase(mock_git, mock_settings_repo, mock_task_repo)


@patch("os.path.isdir")
@patch("os.listdir")
@patch("os.path.exists")
def test_list_projects(mock_exists, mock_listdir, mock_isdir, usecase, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_exists.return_value = True
    mock_listdir.return_value = ["main", "project-a", ".hidden"]
    mock_isdir.side_effect = lambda x: ".hidden" not in x

    # Act
    projects = usecase.list_projects()

    # Assert
    assert projects == ["main", "project-a"]
    mock_settings_repo.get_data_dir.assert_called_once()


@patch("os.makedirs")
@patch("os.path.exists")
def test_create_project(mock_exists, mock_makedirs, usecase, mock_git, mock_settings_repo, mock_task_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_exists.return_value = False

    # Act
    result = usecase.create_project("new-proj")

    # Assert
    assert result == {"project_name": "new-proj"}
    mock_settings_repo.initialize_project_settings.assert_called_once_with("/mock/dir/new-proj", "new-proj")
    mock_task_repo.initialize_empty_csv.assert_called_once_with("/mock/dir/new-proj")
    mock_git.initialize.assert_called_once_with("/mock/dir/new-proj")
    mock_git.commit.assert_called_once_with("Initial commit", "/mock/dir/new-proj")

def test_create_project_validation_failure(usecase, mock_settings_repo):
    # Arrange
    # empty project name validation error simulated
    
    # Act & Assert
    with pytest.raises(ValueError):
        usecase.create_project("")


def test_undo(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_git.undo.return_value = "Undo successful"

    # Act
    result = usecase.undo("project-a")

    # Assert
    assert result == "Undo successful"
    mock_git.undo.assert_called_once_with("/mock/dir/project-a")

def test_redo(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_settings_repo.get_data_dir.return_value = "/mock/dir"
    mock_git.redo.return_value = "Redo successful"

    # Act
    result = usecase.redo("project-a")

    # Assert
    assert result == "Redo successful"
    mock_git.redo.assert_called_once_with("/mock/dir/project-a")


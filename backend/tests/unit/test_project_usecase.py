import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.infrastructure.git.git_service import GitService


@pytest.fixture
def mock_git():
    return MagicMock(spec=GitService)


@pytest.fixture
def usecase(mock_git):
    return ProjectUseCase(mock_git)


def test_list_projects(usecase, mock_git):
    # Arrange
    mock_git.get_branches.return_value = ["main", "project-a"]

    # Act
    projects = usecase.list_projects()

    # Assert
    assert projects == ["main", "project-a"]
    mock_git.get_branches.assert_called_once()


def test_create_project(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = True

    # Act
    result = usecase.create_project("new-proj")

    # Assert
    assert result == {"project_name": "new-proj"}
    mock_git.create_branch.assert_called_once_with("new-proj")
    mock_git.commit.assert_called_once_with("Initialize project new-proj")


def test_create_project_auto_initialize(usecase, mock_git):
    # Arrange: not initialized yet
    mock_git.is_initialized.return_value = False

    # Act
    result = usecase.create_project("first-project")

    # Assert
    mock_git.initialize.assert_called_once()
    mock_git.create_branch.assert_called_once_with("first-project")
    mock_git.commit.assert_called_once()
    assert result["project_name"] == "first-project"


def test_switch_project(usecase, mock_git):
    # Act
    usecase.switch_project("project-a")

    # Assert
    mock_git.checkout_branch.assert_called_once_with("project-a")

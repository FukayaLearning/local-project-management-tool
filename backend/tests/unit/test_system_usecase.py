import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.system_usecase import SystemUseCase
from backend.app.infrastructure.git.git_service import GitService


@pytest.fixture
def mock_git():
    return MagicMock(spec=GitService)


@pytest.fixture
def usecase(mock_git):
    return SystemUseCase(mock_git)


def test_get_system_status_not_initialized(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = False

    # Act
    status = usecase.get_system_status()

    # Assert
    assert status["is_git_initialized"] is False
    assert status["has_default_project"] is False
    assert status["current_project"] is None
    mock_git.is_initialized.assert_called_once()


def test_get_system_status_initialized(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.get_current_branch.return_value = "my-project"

    # Act
    status = usecase.get_system_status()

    # Assert
    assert status["is_git_initialized"] is True
    assert status["has_default_project"] is True
    assert status["current_project"] == "my-project"
    mock_git.get_current_branch.assert_called_once()


def test_get_system_status_initialized_on_main(usecase, mock_git):
    # Arrange: initialized but on main branch means no default project
    mock_git.is_initialized.return_value = True
    mock_git.get_current_branch.return_value = "main"

    # Act
    status = usecase.get_system_status()

    # Assert
    assert status["is_git_initialized"] is True
    assert status["has_default_project"] is False
    assert status["current_project"] == "main"


def test_initialize_system(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = False

    # Act
    usecase.initialize_system()

    # Assert
    mock_git.initialize.assert_called_once()


def test_initialize_system_already_initialized(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = True

    # Act
    usecase.initialize_system()

    # Assert
    mock_git.initialize.assert_not_called()

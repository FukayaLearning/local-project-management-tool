import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.infrastructure.git.git_service import GitService
from backend.app.domain.entities.settings import Settings
from backend.app.application.dtos.task_dto import SettingsUpdateDTO

@pytest.fixture
def mock_repo():
    return MagicMock(spec=ISettingsRepository)

@pytest.fixture
def mock_git():
    return MagicMock(spec=GitService)

@pytest.fixture
def usecase(mock_repo, mock_git):
    return SettingsUseCase(mock_repo, mock_git)

def test_get_project_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_git.has_uncommitted_changes.return_value = False
    mock_settings = Settings()
    mock_settings.project.project_name = "Mock Project"
    mock_repo.get_settings.return_value = mock_settings

    # Act
    project_settings = usecase.get_project_settings()

    # Assert
    assert project_settings.project_name == "Mock Project"
    mock_repo.get_settings.assert_called_once()


def test_get_settings_with_manual_change(usecase, mock_repo, mock_git):
    # Arrange
    mock_git.has_uncommitted_changes.return_value = True
    mock_settings = Settings()
    mock_repo.get_settings.return_value = mock_settings

    # Act
    settings = usecase.get_settings()

    # Assert
    mock_git.commit.assert_called_with("Manual change detected during runtime (settings)")
    mock_repo.get_settings.assert_called_once()

def test_update_project_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_settings = Settings()
    mock_repo.get_settings.return_value = mock_settings
    dto = SettingsUpdateDTO(project_name="Updated Project")

    # Act
    updated_project = usecase.update_project_settings(dto)

    # Assert
    assert updated_project.project_name == "Updated Project"
    # Verify save was called with updated name
    saved_settings = mock_repo.save_settings.call_args[0][0]
    assert saved_settings.project.project_name == "Updated Project"
    # Verify commit
    mock_git.commit.assert_called_once()

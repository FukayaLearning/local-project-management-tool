import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings
from backend.app.application.dtos.task_dto import SettingsUpdateDTO

@pytest.fixture
def mock_repo():
    return MagicMock(spec=ISettingsRepository)

@pytest.fixture
def mock_git():
    return MagicMock(spec=IGitRepository)

@pytest.fixture
def usecase(mock_repo, mock_git):
    return SettingsUseCase(mock_repo, mock_git)

def test_get_global_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_settings = BasicSettings()
    mock_repo.get_global_settings.return_value = mock_settings

    # Act
    global_settings = usecase.get_global_settings()

    # Assert
    assert global_settings.daily_work_hours == 8.0
    mock_repo.get_global_settings.assert_called_once()


def test_update_global_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_settings = BasicSettings()
    mock_repo.get_global_settings.return_value = mock_settings
    dto = BasicSettings(daily_work_hours=7.5)

    def save_side_effect(settings):
        return settings
    mock_repo.save_global_settings.side_effect = save_side_effect

    # Act
    updated_global = usecase.update_global_settings(dto)

    # Assert
    assert updated_global.daily_work_hours == 7.5
    mock_repo.save_global_settings.assert_called_once()
    saved_settings = mock_repo.save_global_settings.call_args[0][0]
    assert saved_settings.daily_work_hours == 7.5


def test_get_project_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_repo.get_data_dir.return_value = "/mock/dir"
    mock_settings = ProjectSettings(project_name="Mock Project")
    mock_repo.get_project_settings.return_value = mock_settings

    # Act
    project_settings = usecase.get_project_settings("Mock Project")

    # Assert
    assert project_settings.project_name == "Mock Project"
    mock_repo.get_project_settings.assert_called_once_with("/mock/dir/Mock Project")


def test_update_project_settings(usecase, mock_repo, mock_git):
    # Arrange
    mock_repo.get_data_dir.return_value = "/mock/dir"
    mock_settings = ProjectSettings(project_name="Old Project")
    mock_repo.get_project_settings.return_value = mock_settings
    dto = SettingsUpdateDTO(project_name="Updated Project")

    # Act
    updated_project = usecase.update_project_settings("Old Project", dto)

    # Assert
    assert updated_project.project_name == "Updated Project"
    saved_settings = mock_repo.save_project_settings.call_args[0][1]
    assert saved_settings.project_name == "Updated Project"
    mock_git.commit.assert_called_once()

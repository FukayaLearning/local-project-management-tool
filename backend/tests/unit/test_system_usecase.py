import pytest
from unittest.mock import MagicMock
from backend.app.application.usecases.system_usecase import SystemUseCase
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.entities.settings import Settings


@pytest.fixture
def mock_git():
    return MagicMock(spec=IGitRepository)


@pytest.fixture
def mock_settings_repo():
    return MagicMock(spec=ISettingsRepository)


@pytest.fixture
def usecase(mock_git, mock_settings_repo):
    return SystemUseCase(mock_git, mock_settings_repo)


def test_get_system_status_not_initialized(usecase, mock_git):
    # Arrange
    mock_git.is_initialized.return_value = False

    # Act
    status = usecase.get_system_status()

    # Assert
    assert status["is_git_initialized"] is False
    assert status["has_default_project"] is False
    assert status["current_project"] is None


def test_get_system_status_initialized(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.return_value = False
    mock_git.get_current_branch.return_value = "my-project"
    settings = Settings()
    settings.project.project_name = "my-project"
    mock_settings_repo.get_settings.return_value = settings

    # Act
    status = usecase.get_system_status()

    # Assert
    assert status["is_git_initialized"] is True
    assert status["has_default_project"] is True
    assert status["current_project"] == "my-project"


def test_get_system_status_initialized_on_main(usecase, mock_git, mock_settings_repo):
    # Arrange: initialized but on main branch means no default project
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.return_value = False
    mock_git.get_current_branch.return_value = "main"
    mock_settings_repo.get_settings.return_value = Settings()

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


def test_initialize_system_already_initialized(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.return_value = False
    mock_settings_repo.get_settings.return_value = Settings()

    # Act
    usecase.initialize_system()

    # Assert
    mock_git.initialize.assert_not_called()


def test_sync_manual_changes_no_git(usecase, mock_git):
    mock_git.is_initialized.return_value = False
    usecase.sync_manual_changes()
    mock_git.has_uncommitted_changes.assert_not_called()


def test_sync_manual_changes_with_uncommitted(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.side_effect = [True, False, False]
    mock_settings_repo.get_settings.return_value = Settings()
    mock_git.get_current_branch.return_value = "DefaultProject"

    # Act
    usecase.sync_manual_changes()

    # Assert
    mock_git.commit.assert_called_with("Manual change detected at startup")


def test_sync_manual_changes_branch_switch(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.return_value = False
    
    settings = Settings()
    settings.project.project_name = "new-project"
    mock_settings_repo.get_settings.return_value = settings
    
    mock_git.get_current_branch.return_value = "old-project"
    mock_git.get_branches.return_value = ["old-project", "new-project"]

    # Act
    usecase.sync_manual_changes()

    # Assert
    mock_git.checkout_branch.assert_called_with("new-project")


def test_sync_manual_changes_branch_create(usecase, mock_git, mock_settings_repo):
    # Arrange
    mock_git.is_initialized.return_value = True
    mock_git.has_uncommitted_changes.return_value = False
    
    settings = Settings()
    settings.project.project_name = "brand-new-project"
    mock_settings_repo.get_settings.return_value = settings
    
    mock_git.get_current_branch.return_value = "main"
    mock_git.get_branches.return_value = ["main"]

    # Act
    usecase.sync_manual_changes()

    # Assert
    mock_git.create_branch.assert_called_with("brand-new-project")

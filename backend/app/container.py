from dependency_injector import containers, providers
from backend.app.infrastructure.git.git_service import GitService
from backend.app.infrastructure.file_system.task_repository import TaskFileRepository
from backend.app.infrastructure.file_system.settings_repository import SettingsFileRepository
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.application.usecases.system_usecase import SystemUseCase
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.application.usecases.task_usecase import TaskUseCase


class Container(containers.DeclarativeContainer):
    """DI コンテナ: Infrastructure 層の実装を UseCase に注入する。"""

    wiring_config = containers.WiringConfiguration(
        modules=[
            "backend.app.presentation.api.v1.endpoints.projects",
            "backend.app.presentation.api.v1.endpoints.tasks",
            "backend.app.presentation.api.v1.endpoints.system",
            "backend.app.main",
        ]
    )

    # --- Infrastructure (Singleton) ---
    git_repository = providers.Singleton(GitService)
    task_repository = providers.Singleton(TaskFileRepository)
    settings_repository = providers.Singleton(SettingsFileRepository)

    # --- Application (Factory) ---
    project_usecase = providers.Factory(
        ProjectUseCase,
        git_repository=git_repository,
    )

    system_usecase = providers.Factory(
        SystemUseCase,
        git_repository=git_repository,
        settings_repository=settings_repository,
    )

    settings_usecase = providers.Factory(
        SettingsUseCase,
        settings_repository=settings_repository,
        git_repository=git_repository,
    )

    task_usecase = providers.Factory(
        TaskUseCase,
        task_repository=task_repository,
        git_repository=git_repository,
    )

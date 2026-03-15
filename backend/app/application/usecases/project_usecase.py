import os
from typing import List
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.repositories.task_repository import ITaskRepository
from backend.app.domain.helpers.string_helper import validate_project_name


class ProjectUseCase:
    def __init__(
        self,
        git_repository: IGitRepository,
        settings_repository: ISettingsRepository,
        task_repository: ITaskRepository,
    ):
        self.git_repository = git_repository
        self.settings_repository = settings_repository
        self.task_repository = task_repository

    def _get_data_dir(self) -> str:
        return self.settings_repository.get_data_dir()

    def _get_project_dir(self, project_name: str) -> str:
        return os.path.join(self._get_data_dir(), project_name)

    def list_projects(self) -> List[str]:
        data_dir = self._get_data_dir()
        if not os.path.exists(data_dir):
            return []
        return sorted([
            entry for entry in os.listdir(data_dir)
            if os.path.isdir(os.path.join(data_dir, entry))
            and not entry.startswith(".")
        ])

    def create_project(self, project_name: str) -> dict:
        validated_name = validate_project_name(project_name)

        project_dir = self._get_project_dir(validated_name)
        if os.path.exists(project_dir):
            raise ValueError(f"Project already exists: {validated_name}")

        os.makedirs(project_dir)

        self.settings_repository.initialize_project_settings(project_dir, validated_name)
        self.task_repository.initialize_empty_csv(project_dir)

        self.git_repository.initialize(project_dir)
        self.git_repository.commit("Initial commit", project_dir)

        return {"project_name": validated_name}

    def undo(self, project_name: str) -> str:
        project_dir = self._get_project_dir(project_name)
        return self.git_repository.undo(project_dir)

    def redo(self, project_name: str) -> str:
        project_dir = self._get_project_dir(project_name)
        return self.git_repository.redo(project_dir)

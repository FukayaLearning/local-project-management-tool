from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.helpers.string_helper import sanitize_branch_name


class SystemUseCase:
    def __init__(self, git_repository: IGitRepository, settings_repository: ISettingsRepository):
        self.git_repository = git_repository
        self.settings_repository = settings_repository

    def get_system_status(self) -> dict:
        self.sync_manual_changes()
        is_initialized = self.git_repository.is_initialized()
        current_project = None
        if is_initialized:
            try:
                current_project = self.git_repository.get_current_branch()
            except RuntimeError:
                pass
        return {
            "is_git_initialized": is_initialized,
            "has_default_project": is_initialized and current_project is not None and current_project != "main",
            "current_project": current_project,
        }

    def initialize_system(self) -> None:
        if not self.git_repository.is_initialized():
            self.git_repository.initialize()
        self.sync_manual_changes()

    def sync_manual_changes(self) -> None:
        """起動時や必要時に手動変更を検知して同期する。"""
        if not self.git_repository.is_initialized():
            return

        if self.git_repository.has_uncommitted_changes():
            self.git_repository.commit("Manual change detected at startup")

        settings = self.settings_repository.get_settings()
        if settings.project.project_name:
            current_branch = self.git_repository.get_current_branch()
            expected_branch = sanitize_branch_name(settings.project.project_name)

            if current_branch != expected_branch:
                branches = self.git_repository.get_branches()
                if expected_branch in branches:
                    self.git_repository.checkout_branch(expected_branch)
                else:
                    self.git_repository.create_branch(expected_branch)

                if self.git_repository.has_uncommitted_changes():
                    self.git_repository.commit("Manual change detected after branch switch")

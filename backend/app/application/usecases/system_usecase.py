from backend.app.infrastructure.git.git_service import GitService
from backend.app.domain.repositories.settings_repository import ISettingsRepository
from backend.app.domain.helpers.string_helper import sanitize_branch_name


class SystemUseCase:
    def __init__(self, git_service: GitService, settings_repo: ISettingsRepository):
        self.git_service = git_service
        self.settings_repo = settings_repo

    def get_system_status(self) -> dict:
        is_initialized = self.git_service.is_initialized()
        current_project = None
        if is_initialized:
            try:
                current_project = self.git_service.get_current_branch()
            except RuntimeError:
                pass
        return {
            "is_git_initialized": is_initialized,
            "has_default_project": is_initialized and current_project is not None and current_project != "main",
            "current_project": current_project,
        }

    def initialize_system(self) -> None:
        if not self.git_service.is_initialized():
            self.git_service.initialize()
        self.sync_manual_changes()

    def sync_manual_changes(self) -> None:
        """起動時や必要時に手動変更を検知して同期する。"""
        if not self.git_service.is_initialized():
            return

        # 1. 未コミットの変更があればコミット
        if self.git_service.has_uncommitted_changes():
            self.git_service.commit("Manual change detected at startup")

        # 2. プロジェクト設定とGitブランチの同期
        settings = self.settings_repo.get_settings()
        if settings.project.project_name:
            current_branch = self.git_service.get_current_branch()
            expected_branch = sanitize_branch_name(settings.project.project_name)
            
            if current_branch != expected_branch:
                branches = self.git_service.get_branches()
                if expected_branch in branches:
                    self.git_service.checkout_branch(expected_branch)
                else:
                    self.git_service.create_branch(expected_branch)
                
                # ブランチ切り替え後、もし切り替え先で未コミットの変更があればコミット（基本はないはずだが）
                if self.git_service.has_uncommitted_changes():
                    self.git_service.commit("Manual change detected after branch switch")

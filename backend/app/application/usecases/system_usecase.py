from backend.app.infrastructure.git.git_service import GitService


class SystemUseCase:
    def __init__(self, git_service: GitService):
        self.git_service = git_service

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

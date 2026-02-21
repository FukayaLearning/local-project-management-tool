from typing import List
from backend.app.infrastructure.git.git_service import GitService
from backend.app.domain.helpers.string_helper import sanitize_branch_name


class ProjectUseCase:
    def __init__(self, git_service: GitService):
        self.git_service = git_service

    def create_project(self, project_name: str) -> dict:
        if not self.git_service.is_initialized():
            self.git_service.initialize()
        branch_name = sanitize_branch_name(project_name)
        self.git_service.create_branch(branch_name)
        self.git_service.commit(f"Initialize project {project_name}")
        return {"project_name": project_name}

    def switch_project(self, project_name: str) -> None:
        branch_name = sanitize_branch_name(project_name)
        self.git_service.checkout_branch(branch_name)

    def list_projects(self) -> List[str]:
        return self.git_service.get_branches()

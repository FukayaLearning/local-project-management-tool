from typing import List
from backend.app.domain.repositories.git_repository import IGitRepository
from backend.app.domain.helpers.string_helper import sanitize_branch_name


class ProjectUseCase:
    def __init__(self, git_repository: IGitRepository):
        self.git_repository = git_repository

    def create_project(self, project_name: str) -> dict:
        if not self.git_repository.is_initialized():
            self.git_repository.initialize()
        branch_name = sanitize_branch_name(project_name)
        self.git_repository.create_branch(branch_name)
        self.git_repository.commit(f"Initialize project {project_name}")
        return {"project_name": project_name}

    def switch_project(self, project_name: str) -> None:
        branch_name = sanitize_branch_name(project_name)
        self.git_repository.checkout_branch(branch_name)

    def list_projects(self) -> List[str]:
        return self.git_repository.get_branches()

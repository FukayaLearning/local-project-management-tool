from fastapi import APIRouter, Depends
from ..schemas.system import SystemStatusDTO
from backend.app.application.usecases.system_usecase import SystemUseCase
from backend.app.infrastructure.git.git_service import GitService

router = APIRouter()


def get_system_usecase():
    git = GitService()
    return SystemUseCase(git)


@router.get("/status", response_model=SystemStatusDTO)
def get_system_status(usecase: SystemUseCase = Depends(get_system_usecase)):
    return usecase.get_system_status()

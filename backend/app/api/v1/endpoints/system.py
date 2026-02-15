from fastapi import APIRouter, Depends
from ...services.git_service import GitService
from ...models.schemas import SystemStatus

router = APIRouter()

def get_git_service():
    # TODO: dependency injection via main or dependencies.py
    return GitService("./data") # Temporary path

@router.get("/status", response_model=SystemStatus)
async def get_system_status(git_service: GitService = Depends(get_git_service)):
    is_init = git_service.is_initialized()
    current_project = None
    if is_init:
        try:
            current_project = git_service.get_current_branch()
        except:
            pass # Git initialized but no commits/branches yet

    # TODO: Check for default project settings file
    has_default = False 
    
    return SystemStatus(
        is_git_initialized=is_init,
        has_default_project=has_default,
        current_project=current_project
    )

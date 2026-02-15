from fastapi import APIRouter, Depends, HTTPException
from ...services.git_service import GitService
from ...models.schemas import ProjectSettings, ProjectCreateInput

router = APIRouter()

def get_git_service():
    return GitService("./data")

@router.post("/", response_model=ProjectSettings)
async def create_project(project_data: ProjectCreateInput, git_service: GitService = Depends(get_git_service)):
    try:
        if not git_service.is_initialized():
            git_service.initialize()
            
        git_service.create_branch(project_data.project_name)
        
        # TODO: Create project settings file
        
        git_service.commit(f"Initialize project {project_data.project_name}")
        
        return ProjectSettings(
            project_name=project_data.project_name,
            # temporary dummy dates
            start_date="2024-01-01",
            end_date="2024-12-31"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/switch")
async def switch_project(project_id: str, git_service: GitService = Depends(get_git_service)):
    try:
        git_service.checkout_branch(project_id)
        return {"message": f"Switched to project {project_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

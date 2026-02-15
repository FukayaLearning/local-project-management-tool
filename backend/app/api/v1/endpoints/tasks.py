from fastapi import APIRouter, Depends, HTTPException
from ...services.git_service import GitService

router = APIRouter()

def get_git_service():
    return GitService("./data")

@router.post("/undo")
async def undo(git_service: GitService = Depends(get_git_service)):
    try:
        if not git_service.is_initialized():
            raise HTTPException(status_code=400, detail="Git not initialized")
        
        result = git_service.undo()
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/redo")
async def redo(git_service: GitService = Depends(get_git_service)):
    try:
        if not git_service.is_initialized():
             raise HTTPException(status_code=400, detail="Git not initialized")
             
        result = git_service.redo()
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

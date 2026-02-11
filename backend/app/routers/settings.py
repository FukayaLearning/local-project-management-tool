from fastapi import APIRouter, HTTPException
from ..schemas import Settings
from .. import crud

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Settings)
async def read_settings():
    return crud.get_settings()

@router.put("/", response_model=Settings)
async def update_settings(settings: Settings):
    try:
        return crud.save_settings(settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

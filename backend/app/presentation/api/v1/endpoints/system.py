from fastapi import APIRouter, Depends
from dependency_injector.wiring import inject, Provide
from ..schemas.system import SystemStatusDTO
from backend.app.application.usecases.system_usecase import SystemUseCase
from backend.app.container import Container

router = APIRouter()


@router.get("/status", response_model=SystemStatusDTO)
@inject
def get_system_status(
    usecase: SystemUseCase = Depends(Provide[Container.system_usecase]),
):
    return usecase.get_system_status()

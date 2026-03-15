from fastapi import APIRouter, Depends
from dependency_injector.wiring import inject, Provide
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.domain.entities.settings import BasicSettings
from backend.app.container import Container

router = APIRouter()


@router.get("/", response_model=BasicSettings)
@inject
def get_global_settings(
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.get_global_settings()


@router.put("/", response_model=BasicSettings)
@inject
def update_global_settings(
    settings: BasicSettings,
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.update_global_settings(settings)

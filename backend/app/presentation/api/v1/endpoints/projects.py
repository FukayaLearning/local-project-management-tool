from fastapi import APIRouter, Depends, HTTPException
from typing import List
from dependency_injector.wiring import inject, Provide
from ..schemas.settings import ProjectSettings, SettingsUpdateDTO
from ..schemas.system import ProjectCreateDTO
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.container import Container

router = APIRouter()


@router.get("/settings", response_model=ProjectSettings)
@inject
def get_project_settings(
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.get_project_settings()


@router.put("/settings", response_model=ProjectSettings)
@inject
def update_project_settings(
    dto: SettingsUpdateDTO,
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.update_project_settings(dto)


@router.post("/")
@inject
def create_project(
    dto: ProjectCreateDTO,
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    try:
        return usecase.create_project(dto.project_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[str])
@inject
def list_projects(
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    return usecase.list_projects()


@router.post("/{project_name}/switch")
@inject
def switch_project(
    project_name: str,
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    try:
        usecase.switch_project(project_name)
        return {"message": f"Switched to project {project_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

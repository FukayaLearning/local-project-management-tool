from fastapi import APIRouter, Depends, HTTPException
from typing import List
from dependency_injector.wiring import inject, Provide
from ..schemas.settings import SettingsUpdateDTO
from backend.app.application.usecases.settings_usecase import SettingsUseCase
from backend.app.application.usecases.project_usecase import ProjectUseCase
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings
from backend.app.container import Container
from pydantic import BaseModel

router = APIRouter()


class ProjectCreateRequest(BaseModel):
    project_name: str


@router.get("/", response_model=List[str])
@inject
def list_projects(
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    return usecase.list_projects()


@router.post("/", status_code=201)
@inject
def create_project(
    dto: ProjectCreateRequest,
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    try:
        return usecase.create_project(dto.project_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_name}/settings", response_model=ProjectSettings)
@inject
def get_project_settings(
    project_name: str,
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.get_project_settings(project_name)


@router.put("/{project_name}/settings", response_model=ProjectSettings)
@inject
def update_project_settings(
    project_name: str,
    dto: SettingsUpdateDTO,
    usecase: SettingsUseCase = Depends(Provide[Container.settings_usecase]),
):
    return usecase.update_project_settings(project_name, dto)


@router.post("/{project_name}/undo")
@inject
def undo_project(
    project_name: str,
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    try:
        result = usecase.undo(project_name)
        return {"message": result}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{project_name}/redo")
@inject
def redo_project(
    project_name: str,
    usecase: ProjectUseCase = Depends(Provide[Container.project_usecase]),
):
    try:
        result = usecase.redo(project_name)
        return {"message": result}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

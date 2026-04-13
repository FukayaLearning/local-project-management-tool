import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from typing import List
from dependency_injector.wiring import inject, Provide
from ..schemas.task import Task, TaskCreateDTO, TaskUpdateDTO, TaskOrderUpdateDTO, TaskBulkUpdateDTO
from backend.app.application.usecases.task_usecase import TaskUseCase
from backend.app.container import Container

router = APIRouter()


@router.get("/{project_name}/tasks", response_model=List[Task])
@inject
def list_tasks(
    project_name: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    return usecase.list_tasks(project_name)


@router.get("/{project_name}/tasks/export")
@inject
def export_tasks(
    project_name: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    file_path = usecase.get_task_file_path(project_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Task file not found")
    return FileResponse(
        path=file_path,
        filename=f"{project_name}_tasks.csv",
        media_type="text/csv",
    )


@router.get("/{project_name}/tasks/{task_id}", response_model=Task)
@inject
def get_task(
    project_name: str,
    task_id: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    task = usecase.get_task(project_name, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{project_name}/tasks", response_model=Task, status_code=201)
@inject
def create_task(
    project_name: str,
    dto: TaskCreateDTO,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    return usecase.create_task(project_name, dto)


@router.put("/{project_name}/tasks/reorder")
@inject
def reorder_tasks(
    project_name: str,
    orders: List[TaskOrderUpdateDTO],
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    success = usecase.reorder_tasks(project_name, orders)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder tasks")
    return {"message": "Tasks reordered successfully"}


@router.put("/{project_name}/tasks/bulk-update")
@inject
def bulk_update_tasks(
    project_name: str,
    updates: List[TaskBulkUpdateDTO],
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    success = usecase.bulk_update_tasks(project_name, updates)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update tasks")
    return {"message": "Tasks updated successfully"}


@router.put("/{project_name}/tasks/{task_id}", response_model=Task)
@inject
def update_task(
    project_name: str,
    task_id: str,
    dto: TaskUpdateDTO,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    task = usecase.update_task(project_name, task_id, dto)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{project_name}/tasks/{task_id}", status_code=204)
@inject
def delete_task(
    project_name: str,
    task_id: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    if not usecase.delete_task(project_name, task_id):
        raise HTTPException(status_code=404, detail="Task not found")

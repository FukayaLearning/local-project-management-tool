from fastapi import APIRouter, Depends, HTTPException
from typing import List
from dependency_injector.wiring import inject, Provide
from ..schemas.task import Task, TaskCreateDTO, TaskUpdateDTO
from backend.app.application.usecases.task_usecase import TaskUseCase
from backend.app.container import Container

router = APIRouter()


@router.get("/", response_model=List[Task])
@inject
def list_tasks(
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    return usecase.list_tasks()


@router.get("/{task_id}", response_model=Task)
@inject
def get_task(
    task_id: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    task = usecase.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=Task, status_code=201)
@inject
def create_task(
    dto: TaskCreateDTO,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    return usecase.create_task(dto)


@router.put("/{task_id}", response_model=Task)
@inject
def update_task(
    task_id: str,
    dto: TaskUpdateDTO,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    task = usecase.update_task(task_id, dto)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=204)
@inject
def delete_task(
    task_id: str,
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    if not usecase.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")


@router.post("/undo")
@inject
def undo_task_change(
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    try:
        result = usecase.undo()
        return {"message": result}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/redo")
@inject
def redo_task_change(
    usecase: TaskUseCase = Depends(Provide[Container.task_usecase]),
):
    try:
        result = usecase.redo()
        return {"message": result}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

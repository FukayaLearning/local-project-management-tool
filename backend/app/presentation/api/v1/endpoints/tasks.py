from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.task import Task, TaskCreateDTO, TaskUpdateDTO
from backend.app.application.usecases.task_usecase import TaskUseCase
from backend.app.infrastructure.file_system.task_repository import TaskFileRepository
from backend.app.infrastructure.git.git_service import GitService

router = APIRouter()

# Simple Dependency Injection (Manual for now, can be moved to dependencies.py)
def get_task_usecase():
    repo = TaskFileRepository()
    git = GitService()
    return TaskUseCase(repo, git)

@router.get("/", response_model=List[Task])
def list_tasks(usecase: TaskUseCase = Depends(get_task_usecase)):
    return usecase.list_tasks()

@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str, usecase: TaskUseCase = Depends(get_task_usecase)):
    task = usecase.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=Task, status_code=201)
def create_task(dto: TaskCreateDTO, usecase: TaskUseCase = Depends(get_task_usecase)):
    return usecase.create_task(dto)

@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, dto: TaskUpdateDTO, usecase: TaskUseCase = Depends(get_task_usecase)):
    task = usecase.update_task(task_id, dto)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, usecase: TaskUseCase = Depends(get_task_usecase)):
    if not usecase.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")

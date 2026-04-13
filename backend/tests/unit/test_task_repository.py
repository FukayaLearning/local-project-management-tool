import os
import pytest
import pandas as pd
from backend.app.infrastructure.file_system.task_repository import TaskFileRepository
from backend.app.domain.entities.task import Task

def test_task_repository_json_serialization(tmp_path):
    # Arrange
    project_dir = str(tmp_path)
    repo = TaskFileRepository()
    task = Task(
        title="Test Task",
        status="New",
        dependencies=["task-1", "task-2"],
        progress_history=[{"date": "2026-03-01", "progress": 10}, {"date": "2026-03-02", "progress": 20}]
    )

    # Act
    repo.save(project_dir, task)
    loaded_tasks = repo.get_all(project_dir)

    # Assert
    assert len(loaded_tasks) == 1
    loaded_task = loaded_tasks[0]
    assert loaded_task.title == "Test Task"
    assert loaded_task.dependencies == ["task-1", "task-2"]
    assert len(loaded_task.progress_history) == 2
    assert loaded_task.progress_history[0]["date"] == "2026-03-01"
    assert loaded_task.progress_history[0]["progress"] == 10

def test_task_repository_empty_history(tmp_path):
    # Arrange
    project_dir = str(tmp_path)
    repo = TaskFileRepository()
    task = Task(title="Simple Task", status="New")

    # Act
    repo.save(project_dir, task)
    loaded_task = repo.get_by_id(project_dir, task.id)

    # Assert
    assert loaded_task.dependencies == []
    assert loaded_task.progress_history == []

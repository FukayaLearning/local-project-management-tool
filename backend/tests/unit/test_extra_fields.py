import os
import pandas as pd
import pytest
from backend.app.infrastructure.file_system.task_repository import TaskFileRepository
from backend.app.domain.entities.task import Task

def test_task_repository_preserves_extra_fields(tmp_path):
    # Arrange: Create a CSV with an extra column
    project_dir = str(tmp_path)
    task_file = os.path.join(project_dir, "tasks.csv")
    os.makedirs(project_dir, exist_ok=True)
    
    df = pd.DataFrame([
        {
            "id": "task-1",
            "title": "Task with Extra",
            "status": "New",
            "extra_col": "extra_value",
            "display_order": 1
        }
    ])
    df.to_csv(task_file, index=False)
    
    repo = TaskFileRepository()
    
    # Act: Read and then update the task
    tasks = repo.get_all(project_dir)
    assert len(tasks) == 1
    task = tasks[0]
    
    # Verify extra field is captured
    # In Pydantic v2 with extra='allow', it's in model_extra
    assert hasattr(task, "extra_col") or (task.model_extra and "extra_col" in task.model_extra)
    
    # Update title and save
    task.title = "Updated Title"
    repo.update(project_dir, task)
    
    # Assert: Check CSV content
    new_df = pd.read_csv(task_file)
    assert "extra_col" in new_df.columns
    assert new_df.loc[new_df["id"] == "task-1", "extra_col"].iloc[0] == "extra_value"
    assert new_df.loc[new_df["id"] == "task-1", "title"].iloc[0] == "Updated Title"

def test_task_repository_save_new_task_with_existing_extra_cols(tmp_path):
    # Arrange: Existing CSV has extra columns
    project_dir = str(tmp_path)
    task_file = os.path.join(project_dir, "tasks.csv")
    os.makedirs(project_dir, exist_ok=True)
    pd.DataFrame([{"id": "t1", "title": "T1", "status": "S", "extra": "v"}]).to_csv(task_file, index=False)
    
    repo = TaskFileRepository()
    new_task = Task(title="T2", status="S2")
    
    # Act
    repo.save(project_dir, new_task)
    
    # Assert: Extra col should still exist in CSV
    df = pd.read_csv(task_file)
    assert "extra" in df.columns
    assert df[df["id"] == "t1"]["extra"].iloc[0] == "v"
    # T2 should have NaN or empty for extra col
    assert pd.isna(df[df["id"] == new_task.id]["extra"].iloc[0]) or df[df["id"] == new_task.id]["extra"].iloc[0] == ""

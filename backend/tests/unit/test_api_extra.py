from fastapi.testclient import TestClient
import pandas as pd
import os
from backend.app.main import app

client = TestClient(app)

def test_api_preserves_extra_fields():
    # Use real dependency to get data_dir so we look at the right place
    from backend.app.container import Container
    container = Container()
    data_dir = container.settings_repository().get_data_dir()
    
    project_name = "ApiTestProj"
    
    # 1. Create Project
    response = client.post("/api/v1/projects/", json={"project_name": project_name})
    assert response.status_code == 201

    # 2. Create Task with Extra Field
    task_data = {
        "title": "Extra Test Task",
        "status": "New",
        "External System ID": "EXT-1001",
        "Category": "Bug"
    }
    response = client.post(f"/api/v1/projects/{project_name}/tasks", json=task_data)
    assert response.status_code == 201
    
    # Optional: the response JSON might not include the extra field if response_model strictly filters it,
    # but the CSV MUST include it!
    
    # 3. Verify CSV Content after Create
    task_file = os.path.join(data_dir, project_name, "tasks.csv")
    assert os.path.exists(task_file)
    
    df = pd.read_csv(task_file, dtype=str)
    assert "External System ID" in df.columns, "Create: Extra field 'External System ID' was lost"
    
    row = df[df["title"] == "Extra Test Task"]
    task_id = row["id"].iloc[0]
    assert row["External System ID"].iloc[0] == "EXT-1001"
    
    # 4. Update the Task (Standard fields only)
    update_data = {
        "status": "Done"
    }
    response = client.put(f"/api/v1/projects/{project_name}/tasks/{task_id}", json=update_data)
    assert response.status_code == 200
    
    # 5. Verify CSV Content after Update
    df2 = pd.read_csv(task_file, dtype=str)
    assert "External System ID" in df2.columns, "Update: Extra field 'External System ID' was lost"
    
    row2 = df2[df2["id"] == task_id]
    assert row2["status"].iloc[0] == "Done"
    assert row2["External System ID"].iloc[0] == "EXT-1001", "Update: Extra field value was wiped"

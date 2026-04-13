from backend.app.domain.entities.task import Task
from backend.app.domain.entities.settings import BasicSettings, ProjectSettings

def test_task_initialization():
    task = Task(title="Test Task", status="New")
    assert task.title == "Test Task"
    assert task.status == "New"
    assert task.id is not None
    assert task.progress == 0
    assert task.assignee_id is None

def test_basic_settings_defaults():
    basic = BasicSettings()
    assert len(basic.task_statuses) > 0
    assert basic.daily_work_hours == 8.0

def test_project_settings_initialization():
    project = ProjectSettings(project_name="New Project")
    assert project.project_name == "New Project"
    assert project.basic_settings_override is None

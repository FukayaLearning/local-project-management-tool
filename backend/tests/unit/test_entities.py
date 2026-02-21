from backend.app.domain.entities.task import Task
from backend.app.domain.entities.settings import Settings, ProjectSettings, BasicSettings

def test_task_initialization():
    task = Task(title="Test Task", status="New")
    assert task.title == "Test Task"
    assert task.status == "New"
    assert task.id is not None
    assert task.progress == 0
    assert task.assignee_id is None

def test_settings_initialization():
    settings = Settings()
    assert isinstance(settings.basic, BasicSettings)
    assert isinstance(settings.project, ProjectSettings)
    assert settings.project.project_name == "DefaultProject"

def test_basic_settings_defaults():
    basic = BasicSettings()
    assert len(basic.task_statuses) > 0
    assert basic.daily_work_hours == 8.0

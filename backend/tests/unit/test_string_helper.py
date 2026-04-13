from backend.app.domain.helpers.string_helper import validate_project_name

def test_validate_project_name_no_change():
    assert validate_project_name("MyProject") == "MyProject"

def test_validate_project_name_with_spaces():
    assert validate_project_name("My Project Name") == "My_Project_Name"
    assert validate_project_name("  Space  Around  ") == "Space_Around"

def test_validate_project_name_with_forbidden_chars():
    import pytest
    with pytest.raises(ValueError):
        validate_project_name("Project:A*B?C")

def test_validate_project_name_japanese():
    assert validate_project_name("プロジェクト A") == "プロジェクト_A"
    assert validate_project_name("日本語プロジェクト") == "日本語プロジェクト"

def test_validate_project_name_empty():
    import pytest
    with pytest.raises(ValueError):
        validate_project_name("")
    with pytest.raises(ValueError):
        validate_project_name("   ")

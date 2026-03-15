from backend.app.domain.helpers.string_helper import sanitize_branch_name

def test_sanitize_branch_name_no_change():
    assert sanitize_branch_name("MyProject") == "MyProject"

def test_sanitize_branch_name_with_spaces():
    assert sanitize_branch_name("My Project Name") == "My_Project_Name"
    assert sanitize_branch_name("  Space  Around  ") == "Space_Around"

def test_sanitize_branch_name_with_forbidden_chars():
    assert sanitize_branch_name("Project:A*B?C") == "Project_A_B_C"
    assert sanitize_branch_name("v1..v2") == "v1_v2"

def test_sanitize_branch_name_japanese():
    assert sanitize_branch_name("プロジェクト A") == "プロジェクト_A"
    assert sanitize_branch_name("日本語プロジェクト") == "日本語プロジェクト"

def test_sanitize_branch_name_empty():
    assert sanitize_branch_name("") == "default"
    assert sanitize_branch_name("   ") == "default"

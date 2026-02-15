# Backend Unit Test Specification

## 1. Testing Strategy
*   **Tool**: `pytest`
*   **Targets**:
    *   **Domain Layer** (Entities): Validation logic, etc.
    *   **Application Layer** (UseCases): Business logic, repository calls, Git integration.
    *   **Presentation Layer** (Schemas): Input data type checking.
*   **Mocking**:
    *   `Infrastructure Layer` (Repository, GitService, FileSystem) will be mocked to ensure test independence and speed.
    *   Infrastructure layer testing itself is covered in integration tests (or separate structural tests).

## 2. Test Specifications by Logic

### 2.1 SettingsUseCase
*   **Target Class**: `backend.app.application.usecases.settings_usecase.SettingsUseCase`
*   **Related Spec-ID**: `SPEC-CNFG-***`

| Test-ID | Summary | Input Data | Mock Behavior | Expected Result/Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-BE-SETTINGS-001** | Get Project Settings | None | Repo.get_settings() -> Default Settings | Default Project Name is returned. |
| **UNIT-BE-SETTINGS-002** | Update Project Settings | `SettingsUpdateDTO(project_name="New Name")` | Repo.save_settings() -> Success, Git.commit() -> Success | Repo.save and Git.commit are called once each. |

### 2.2 TaskUseCase
*   **Target Class**: `backend.app.application.usecases.task_usecase.TaskUseCase`
*   **Related Spec-ID**: `SPEC-TASK-***`, `SPEC-HIST-***`

| Test-ID | Summary | Input Data | Mock Behavior | Expected Result/Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-BE-TASK-001** | Get Task List | None | Repo.get_all() -> [Task1, Task2] | List of Task entities is returned. |
| **UNIT-BE-TASK-002** | Create Task | `TaskCreateDTO(title="Task 1", status="New")` | Repo.save() -> Task(id=uuid), Git.commit() -> Success | Repo.save and Git.commit are called; generated Task is returned with ID assigned. |
| **UNIT-BE-TASK-003** | Update Task | `task_id`, `TaskUpdateDTO(status="Doing")` | Repo.get_by_id() -> Task, Repo.update() -> Task, Git.commit() -> Success | Repo.update and Git.commit are called; status is updated. |
| **UNIT-BE-TASK-004** | Update Task (Invalid ID) | `invalid_id`, `DTO` | Repo.get_by_id() -> None | Returns `None`; Repo.update and Git.commit are NOT called. |
| **UNIT-BE-TASK-005** | Delete Task | `task_id` | Repo.delete() -> True, Git.commit() -> Success | Repo.delete and Git.commit are called; returns True. |

### 2.3 Domain Entities
*   **Target Class**: `backend.app.domain.entities.task.Task`

| Test-ID | Summary | Input Data | Expected Result/Behavior |
| :--- | :--- | :--- | :--- |
| **UNIT-BE-ENTITY-001** | Task Initialization | Mandatory fields only | ID is auto-generated; Optional fields are None or default values. |

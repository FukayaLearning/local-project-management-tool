# Backend Unit Test Specification

## 1. Testing Strategy

- **Tool**: `pytest`
- **Targets**:
  - **Domain Layer** (Entities): Validation logic, etc.
  - **Application Layer** (UseCases): Business logic, repository calls, Git integration.
  - **Presentation Layer** (Schemas): Input data type checking.
- **Mocking**:
  - `Infrastructure Layer` (Repository, GitService, FileSystem) will be mocked to ensure test independence and speed.
  - Infrastructure layer testing itself is covered in integration tests (or separate structural tests).

## 2. Test Specifications by Logic

### 2.1 SettingsUseCase

- **Target Class**: `backend.app.application.usecases.settings_usecase.SettingsUseCase`
- **Related Spec-ID**: `SPEC-CNFG-***`

| Test-ID                  | Summary                 | Input Data                          | Mock Behavior                                                    | Expected Result/Behavior                              | Result |
| :----------------------- | :---------------------- | :---------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------- | :----- |
| **UNIT-BE-SETTINGS-001** | Get Global Settings     | None                                | Repo.get_global_settings() -> GlobalSettings                     | Global Settings returned                              | PASS   |
| **UNIT-BE-SETTINGS-002** | Update Global Settings  | `SettingsUpdateDTO`                 | Repo.save_global_settings() -> Success                           | Repo.save_global_settings called once                 | PASS   |
| **UNIT-BE-SETTINGS-003** | Get Project Settings    | `project_name`                      | Repo.get_project_settings() -> ProjectSettings                   | Project Settings returned                             | PASS   |
| **UNIT-BE-SETTINGS-004** | Update Project Settings | `project_name`, `SettingsUpdateDTO` | Repo.save_project_settings() -> Success, Git.commit() -> Success | Repo.save_project_settings and Git.commit called once | PASS   |

### 2.2 TaskUseCase

- **Target Class**: `backend.app.application.usecases.task_usecase.TaskUseCase`
- **Related Spec-ID**: `SPEC-TASK-***`, `SPEC-HIST-***`

| Test-ID              | Summary                   | Input Data                                      | Mock Behavior                                                            | Expected Result/Behavior                                                          | Result |
| :------------------- | :------------------------ | :---------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :----- |
| **UNIT-BE-TASK-001** | Get Task List             | `project_name`                                  | Repo.get_all() -> [Task1, Task2]                                         | List of Task entities is returned.                                                | PASS   |
| **UNIT-BE-TASK-002** | Create Task               | `project_name`, `TaskCreateDTO`                 | Repo.save() -> Task(id=uuid), Git.commit() -> Success                    | Repo.save and Git.commit are called; generated Task is returned with ID assigned. | PASS   |
| **UNIT-BE-TASK-003** | Update Task               | `project_name`, `task_id`, `TaskUpdateDTO`      | Repo.get_by_id() -> Task, Repo.update() -> Task, Git.commit() -> Success | Repo.update and Git.commit are called; status is updated.                         | PASS   |
| **UNIT-BE-TASK-004** | Update Task (Invalid ID)  | `project_name`, `invalid_id`, `DTO`             | Repo.get_by_id() -> None                                                 | Returns `None`; Repo.update and Git.commit are NOT called.                        | PASS   |
| **UNIT-BE-TASK-005** | Delete Task               | `project_name`, `task_id`                       | Repo.delete() -> True, Git.commit() -> Success                           | Repo.delete and Git.commit are called; returns True.                              | PASS   |
| **UNIT-BE-TASK-006** | Create Task (with parent) | `project_name`, `TaskCreateDTO(parent_id="P1")` | Repo.save() -> Task, Git.commit() -> Success                             | Task is created with parent_id assigned.                                          | PASS   |
| **UNIT-BE-TASK-007** | Reorder Tasks             | `project_name`, `List[TaskOrderUpdateDTO]`      | Repo.update_orders() -> True, Git.commit() -> Success                    | Repo.update_orders and Git.commit are called; returns True.                       | PASS   |

### 2.3 ProjectUseCase

- **Target Class**: `backend.app.application.usecases.project_usecase.ProjectUseCase`
- **Related Spec-ID**: `SPEC-INIT-***`

| Test-ID                 | Summary        | Input Data                 | Mock Behavior                                 | Expected Result/Behavior                                                  | Result |
| :---------------------- | :------------- | :------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------ | :----- |
| **UNIT-BE-PROJECT-001** | List Projects  | None                       | FileSystem.list_directories() -> ["p1", "p2"] | List of project names is returned.                                        | PASS   |
| **UNIT-BE-PROJECT-002** | Create Project | `project_name="new-proj"`  | Git.is_repo() -> False                        | Git.init, settings_repo.save_project_settings, and Git.commit are called. | PASS   |
| **UNIT-BE-PROJECT-003** | Undo           | `project_name="project-a"` | Git.undo() -> "Undo successful"               | Git.undo called once, returns result string.                              | PASS   |
| **UNIT-BE-PROJECT-004** | Redo           | `project_name="project-a"` | Git.redo() -> "Redo successful"               | Git.redo called once, returns result string.                              | PASS   |

### 2.4 Domain Entities

- **Target Class**: `backend.app.domain.entities.task.Task`

| Test-ID                | Summary             | Input Data            | Expected Result/Behavior                                          | Result |
| :--------------------- | :------------------ | :-------------------- | :---------------------------------------------------------------- | :----- |
| **UNIT-BE-ENTITY-001** | Task Initialization | Mandatory fields only | ID is auto-generated; Optional fields are None or default values. | PASS   |

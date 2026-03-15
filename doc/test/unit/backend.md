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

| Test-ID                  | Summary                            | Input Data                                   | Mock Behavior                                            | Expected Result/Behavior             |
| :----------------------- | :--------------------------------- | :------------------------------------------- | :------------------------------------------------------- | :----------------------------------- |
| **UNIT-BE-SETTINGS-001** | Project Settings Get               | None                                         | Repo.get_settings() -> Default Settings                  | Default Project Name returned        |
| **UNIT-BE-SETTINGS-002** | Project Settings Update            | `SettingsUpdateDTO(project_name="New Name")` | Repo.save_settings() -> Success, Git.commit() -> Success | Repo.save and Git.commit called once |
| **UNIT-BE-SETTINGS-003** | Project Settings Get (Manual Sync) | None                                         | Git.has_uncommitted_changes() -> True                    | Auto commit executed                 |

### 2.2 TaskUseCase

- **Target Class**: `backend.app.application.usecases.task_usecase.TaskUseCase`
- **Related Spec-ID**: `SPEC-TASK-***`, `SPEC-HIST-***`

| Test-ID              | Summary                     | Input Data                                    | Mock Behavior                                                            | Expected Result/Behavior                                                          |
| :------------------- | :-------------------------- | :-------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **UNIT-BE-TASK-001** | Get Task List               | None                                          | Repo.get_all() -> [Task1, Task2]                                         | List of Task entities is returned.                                                |
| **UNIT-BE-TASK-002** | Create Task                 | `TaskCreateDTO(title="Task 1", status="New")` | Repo.save() -> Task(id=uuid), Git.commit() -> Success                    | Repo.save and Git.commit are called; generated Task is returned with ID assigned. |
| **UNIT-BE-TASK-003** | Update Task                 | `task_id`, `TaskUpdateDTO(status="Doing")`    | Repo.get_by_id() -> Task, Repo.update() -> Task, Git.commit() -> Success | Repo.update and Git.commit are called; status is updated.                         |
| **UNIT-BE-TASK-004** | Update Task (Invalid ID)    | `invalid_id`, `DTO`                           | Repo.get_by_id() -> None                                                 | Returns `None`; Repo.update and Git.commit are NOT called.                        |
| **UNIT-BE-TASK-005** | Delete Task                 | `task_id`                                     | Repo.delete() -> True, Git.commit() -> Success                           | Repo.delete and Git.commit are called; returns True.                              |
| **UNIT-BE-TASK-006** | Undo                        | None                                          | Git.undo() -> "Undo successful"                                          | Git.undo called once, returns result string.                                      |
| **UNIT-BE-TASK-007** | Redo                        | None                                          | Git.redo() -> "Redo successful"                                          | Git.redo called once, returns result string.                                      |
| **UNIT-BE-TASK-008** | Task List Get (Manual Sync) | None                                          | Git.has_uncommitted_changes() -> True                                    | Auto commit executed                                                              |
| **UNIT-BE-TASK-009** | Create Task (with parent)   | `TaskCreateDTO(title="Sub", parent_id="P1")`  | Repo.save() -> Task, Git.commit() -> Success                             | Task is created with parent_id assigned.                                          |

### 2.3 SystemUseCase

- **Target Class**: `backend.app.application.usecases.system_usecase.SystemUseCase`
- **Related Spec-ID**: `SPEC-INIT-001-001`

| Test-ID                | Summary                      | Input Data | Mock Behavior                                                          | Expected Result/Behavior                                                                       |
| :--------------------- | :--------------------------- | :--------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **UNIT-BE-SYSTEM-001** | Get Status (Not Initialized) | None       | Git.is_initialized() -> False                                          | `is_git_initialized=False`, `has_default_project=False` returned.                              |
| **UNIT-BE-SYSTEM-002** | Get Status (Initialized)     | None       | Git.is_initialized() -> True, Git.get_current_branch() -> "my-project" | `is_git_initialized=True`, `has_default_project=True`, `current_project="my-project"` returned |
| **UNIT-BE-SYSTEM-003** | Run Initialization           | None       | Git.is_initialized() -> False                                          | Git.initialize() called once                                                                   |
| **UNIT-BE-SYSTEM-004** | Manual Sync (Startup)        | None       | Git.has_uncommitted_changes() -> True                                  | Manual change detected and committed                                                           |
| **UNIT-BE-SYSTEM-005** | Branch Sync (Startup)        | None       | Settings.project.project_name != Git.current_branch                    | Switches to the expected branch                                                                |

### 2.4 ProjectUseCase

- **Target Class**: `backend.app.application.usecases.project_usecase.ProjectUseCase`
- **Related Spec-ID**: `SPEC-INIT-002-001`, `SPEC-INIT-003-001`

| Test-ID                 | Summary        | Input Data                 | Mock Behavior                               | Expected Result/Behavior                     |
| :---------------------- | :------------- | :------------------------- | :------------------------------------------ | :------------------------------------------- |
| **UNIT-BE-PROJECT-001** | List Projects  | None                       | Git.get_branches() -> ["main", "project-a"] | List of branch names is returned.            |
| **UNIT-BE-PROJECT-002** | Create Project | `project_name="new-proj"`  | Git.is_initialized() -> True                | Git.create_branch and Git.commit are called. |
| **UNIT-BE-PROJECT-003** | Switch Project | `project_name="project-a"` | Git.checkout_branch() -> Success            | Git.checkout_branch is called once.          |

### 2.5 Domain Entities

- **Target Class**: `backend.app.domain.entities.task.Task`

| Test-ID                | Summary             | Input Data            | Expected Result/Behavior                                          |
| :--------------------- | :------------------ | :-------------------- | :---------------------------------------------------------------- |
| **UNIT-BE-ENTITY-001** | Task Initialization | Mandatory fields only | ID is auto-generated; Optional fields are None or default values. |

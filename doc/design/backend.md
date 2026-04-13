# Backend Design

## 1. Overview

This document is the backend design for the "Local Project Management Tool".
It describes the internal design of the API server using FastAPI, specifically the architecture based on DDD (Domain-Driven Design), and the processing flow of each API.

## 2. General Strategy

### 2.1 Architecture

Adopt Layered Architecture (UI/Application/Domain/Infrastructure) to separate concerns.

```
backend/app/
├── domain/                  # [Domain Layer] Core business logic (no external dependencies)
│   ├── entities/            # [Entity] Task, Settings, ProjectSettings, etc.
│   ├── repositories/        # [Repository Interface] ITaskRepository, ISettingsRepository, IGitRepository
│   └── services/            # [Domain Service] Logic spanning multiple entities
│
├── application/             # [Application Layer] Use Cases
│   └── usecases/            # [UseCase] TaskUseCase, SettingsUseCase, ProjectUseCase
│
├── infrastructure/          # [Infrastructure Layer] Technical Implementation
│   ├── file_system/         # JSON/CSV Read/Write (TaskFileRepository, SettingsFileRepository)
│   └── git/                 # Git Operations (GitService)
│
├── presentation/            # [Presentation Layer] API Endpoints
│   └── api/
│       └── v1/
│           ├── endpoints/   # Router definitions (projects.py, tasks.py, settings.py)
│           └── schemas/     # [Schema] Pydantic models (Request/Response)
│
├── container.py             # DI setup
└── main.py                  # App bootstrap
```

### 2.2 Common Processing

- **Error Handling**: Global exception handlers convert domain exceptions into appropriate HTTP status codes and JSON responses.
- **DI (Dependency Injection)**: Inject Repository implementation classes into UseCases in `container.py`. Git repository operations target different data directories per project, so each UseCase call receives the project name and dynamically determines the target directory.
- **Thread Safety**: Git operations use `threading.Lock` for exclusive control to prevent data inconsistency during concurrent access.

## 3. Data Model Design

### 3.1 Entities/Value Objects (Domain)

- `Task`: Holds ID, Title, Status, Dates, ParentID, display_order, planned_hours, actual_hours, progress, etc. Specified with `ConfigDict(extra='allow')` to dynamically retain unknown CSV columns.
- `BasicSettings`: Holds task status definitions, task type definitions, assignee definitions, daily work hours, holiday definitions. Global settings.
- `ProjectSettings`: Holds project name and override values for basic settings.

### 3.2 Data Store (Infrastructure)

- `data/setting.json`: Global basic settings. Not under Git management.
- `data/<project-name>/setting.json`: Project-specific settings. Under Git management.
- `data/<project-name>/tasks.csv`: Project-specific task data. Read/Write using Pandas DataFrame. Under Git management.

### 3.3 Directory Management

- `data/` is the root, and each project is managed as a subdirectory.
- Project list is obtained from directories under `data/` (excluding those starting with `.`).
- Each project directory has its own independent Git repository (`.git/`).

## 4. API Logic Details

### 4.1 Global Basic Settings (Settings)

#### `GET /api/v1/settings`

- **Related Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-001-003`
- **Flow**:
  1. Call `SettingsUseCase.get_global_settings()`.
  2. Read `data/setting.json` via `SettingsFileRepository`.
  3. Return `BasicSettings` entity.

#### `PUT /api/v1/settings`

- **Related Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-001-003`
- **Flow**:
  1. Call `SettingsUseCase.update_global_settings(dto)`.
  2. Update `data/setting.json` via `SettingsFileRepository`.
  3. _No Git commit_ — not under Git management.

### 4.2 Project Management (Projects)

#### `GET /api/v1/projects`

- **Related Spec-ID**: `SPEC-PROJ-001-001`
- **Flow**:
  1. Call `ProjectUseCase.list_projects()`.
  2. Get list of child directories under `data/` (excluding `.`-prefixed).
  3. Return project name list `List[str]`.

#### `POST /api/v1/projects`

- **Related Spec-ID**: `SPEC-PROJ-002-001`, `SPEC-PROJ-002-002`, `SPEC-PROJ-003-001`
- **Flow**:
  1. Call `ProjectUseCase.create_project(project_name)`.
  2. **Validation**:
     - Project name is empty (after trim) → HTTP 400
     - Contains OS-prohibited characters → HTTP 400
     - Duplicates existing project → HTTP 400
  3. Create `data/<project_name>/` directory.
  4. Write initial project settings to `data/<project_name>/setting.json`.
  5. Write empty CSV header to `data/<project_name>/tasks.csv`.
  6. `GitService.initialize(data/<project_name>/)` to initialize Git repository.
  7. **Git Commit**: Execute `GitService.commit("Initial commit")`.

#### `GET /api/v1/projects/{project_name}/settings`

- **Related Spec-ID**: `SPEC-CNFG-002-001`, `SPEC-CNFG-002-003`
- **Flow**:
  1. Call `SettingsUseCase.get_project_settings(project_name)`.
  2. Read `data/<project_name>/setting.json`.
  3. Return `ProjectSettings` entity.

#### `PUT /api/v1/projects/{project_name}/settings`

- **Related Spec-ID**: `SPEC-CNFG-002-002`, `SPEC-CNFG-002-003`, `SPEC-HIST-001-001`
- **Flow**:
  1. Call `SettingsUseCase.update_project_settings(project_name, dto)`.
  2. Update `data/<project_name>/setting.json`.
  3. **Git Commit**: Execute `GitService.commit("Update project settings", data/<project_name>/)`.

#### `POST /api/v1/projects/{project_name}/undo`

- **Related Spec-ID**: `SPEC-HIST-003-001`, `SPEC-HIST-003-002`
- **Flow**:
  1. Call `ProjectUseCase.undo(project_name)`.
  2. Execute `git reset --hard HEAD^` via `GitService.undo(data/<project_name>/)`.
  3. Return HTTP 400 if only initial commit exists.

#### `POST /api/v1/projects/{project_name}/redo`

- **Related Spec-ID**: `SPEC-HIST-003-001`, `SPEC-HIST-003-003`
- **Flow**:
  1. Call `ProjectUseCase.redo(project_name)`.
  2. Execute redo via `GitService.redo(data/<project_name>/)` using reflog.
  3. Return HTTP 400 if no redo-able commits exist.

### 4.3 Task Management (Tasks)

#### `GET /api/v1/projects/{project_name}/tasks`

- **Related Spec-ID**: `SPEC-TASK-001-001`, `SPEC-PROJ-005-001`, `SPEC-HIST-002-001`
- **Flow**:
  1. Call `TaskUseCase.list_tasks(project_name)`.
  2. **External Change Detection**: If there are uncommitted changes in the project's Git repository, execute `GitService.commit("Manual change detected during runtime")`.
  3. **Auto Git Init**: If Git repository doesn't exist, initialize and create initial commit.
  4. `TaskRepository` reads CSV `data/<project_name>/tasks.csv` and returns `List[Task]`.
  5. Hierarchy construction is delegated to the frontend; returns as a flat list.

#### `POST /api/v1/projects/{project_name}/tasks`

- **Related Spec-ID**: `SPEC-TASK-002-002`, `SPEC-TASK-002-003`, `SPEC-HIST-001-001`
- **Flow**:
  1. Call `TaskUseCase.create_task(project_name, dto)`.
  2. **ID Generation**: Generate UUID v4.
  3. Create `Task` entity and save (append) to `data/<project_name>/tasks.csv` via `TaskRepository`.
  4. **Auto Git Init**: Initialize repository if it doesn't exist.
  5. **Git Commit**: Execute `GitService.commit(f"Add task {title}")`.

#### `PUT /api/v1/projects/{project_name}/tasks/{task_id}`

- **Related Spec-ID**: `SPEC-TASK-002-004`, `SPEC-HIST-001-001`
- **Flow**:
  1. Call `TaskUseCase.update_task(project_name, task_id, dto)`.
  2. Update record with corresponding ID via `TaskRepository`.
  3. **Git Commit**: Execute `GitService.commit(f"Update task {title}")`.

| **SPEC-TASK-004-001** | Task | Task Reordering | API | `PUT /api/v1/projects/{project_name}/tasks/reorder` updates the `display_order` of multiple tasks at once. Git commit after update. | REQ-TASK-005, REQ-HIST-001 |
| **SPEC-TASK-004-002** | Task | Task Export | API | `GET /api/v1/projects/{project_name}/tasks/export` to download all tasks of the project as CSV. Includes retained custom fields. | REQ-TASK-004 |

#### `PUT /api/v1/projects/{project_name}/tasks/bulk-update`

- **Related Spec-ID**: `SPEC-VIEW-004-002`, `SPEC-HIST-001-001`
- **Flow**:
  1. Call `TaskUseCase.bulk_update_tasks(project_name, updates)`.
  2. Batch update `start_date` and `due_date` for each task based on the provided IDs.
  3. Ensure extra fields are preserved during save via repository.
  4. **Git Commit**: Execute `GitService.commit("Apply schedule to tasks")`.

#### `DELETE /api/v1/projects/{project_name}/tasks/{task_id}`

- **Related Spec-ID**: `SPEC-TASK-002-005`, `SPEC-HIST-001-001`
- **Flow**:
  1. Call `TaskUseCase.delete_task(project_name, task_id)`.
  2. Physically delete record via `TaskRepository`.
  3. **Git Commit**: Execute `GitService.commit(f"Delete task {id}")`.

## 5. External Integration (Git Management)

### 5.1 Git Integration

- **Component**: `infrastructure/git/GitService`
- **Feature**: Operates independent Git repositories per project. Receives `data_dir` parameter for project directory and performs operations within it.
- **Thread Safety**: Uses `threading.Lock` for exclusive control during concurrent access.
- **Methods**:
  - `initialize(project_dir: str)`: Initialize Git repository with `git init -b main`
  - `is_initialized(project_dir: str) -> bool`: Check for `.git` directory existence
  - `commit(message: str, project_dir: str)`: `git add .` && `git commit -m message`
  - `has_uncommitted_changes(project_dir: str) -> bool`: Check if `git status --porcelain` is non-empty
  - `undo(project_dir: str)`: `git reset --hard HEAD^`
  - `redo(project_dir: str)`: Redo operation using `git reflog`

### 5.2 External Change Sync Logic

- **Detection Timing**: During data retrieval API execution (e.g., `GET /api/v1/projects/{project_name}/tasks`).
- **Processing**: Automatically commit if there are uncommitted changes in the project's Git repository.
- **Auto Git Init**: When task data changes and no repository exists, initialize Git and create initial commit on pre-change state, then commit the change.

## 6. Security & Non-functional Requirements

- **CORS Configuration**: Configure CORS to allow requests from the frontend.
- **Performance**: Use Pandas for CSV read/write; be mindful of performance degradation with large file sizes.
- **Error Recovery**: Log appropriate error messages on Git operation failure and notify via API response.

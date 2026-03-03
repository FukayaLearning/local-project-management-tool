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
│   ├── entities/            # [Entity] Task, Settings, etc.
│   ├── repositories/        # [Repository Interface] ITaskRepository, ISettingsRepository
│   └── services/            # [Domain Service] Logic spanning multiple entities
│
├── application/             # [Application Layer] Use Cases
│   ├── usecases/            # [UseCase] TaskUseCase, SettingsUseCase (includes Git commit control)
│   └── dtos/                # [DTO] Data Transfer Objects
│
├── infrastructure/          # [Infrastructure Layer] Technical Implementation
│   ├── file_system/         # JSON/CSV Read/Write (TaskFileRepository, SettingsFileRepository)
│   └── git/                 # Git Operations (GitService)
│
├── presentation/            # [Presentation Layer] API Endpoints
│   └── api/
│       └── v1/
│           ├── endpoints/   # Router definitions
│           └── schemas/     # [Schema] Pydantic models (Request/Response)
│
└── main.py                  # DI setup & App bootstrap
```

### 2.2 Common Processing

- **Error Handling**: Global exception handlers convert domain exceptions into appropriate HTTP status codes and JSON responses.
- **DI (Dependency Injection)**: Inject Repository implementation classes into UseCases in `main.py` or `dependencies.py`.

## 3. Data Model Design

### 3.1 Entities/Value Objects (Domain)

- `Task`: Holds ID, Title, Status, Dates, ParentID, display_order, etc.
- `ProjectSettings`: Holds project name, duration, etc.
- `BasicSettings`: Holds status definitions, assignee definitions, etc.

### 3.2 Data Store (Infrastructure)

- `data/settings.json`: Merges and saves/loads System Setting and Project Setting.
- `data/tasks.csv`: Read/Write using Pandas DataFrame. CSV headers follow definition in System Setting.

## 4. API Logic Details

### 4.1 Project Settings (Projects)

#### `GET /projects/settings`

- **Related Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-002-001`
- **Flow**:
  1.  Call `SettingsUseCase.get_settings()`.
  2.  Read JSON file via `SettingsFileRepository`.
  3.  Return `ProjectSettings` entity.

#### `PUT /projects/settings`

- **Related Spec-ID**: `SPEC-CNFG-002-002`, `SPEC-HIST-001-001`
- **Flow**:
  1.  Call `SettingsUseCase.update_settings(dto)`.
  2.  Update JSON file via `SettingsFileRepository`.
  3.  **Git Commit**: Execute `GitService.commit("Update project settings")`.

### 4.2 Task Management (Tasks)

#### `GET /tasks`

- **Related Spec-ID**: `SPEC-TASK-001-001`
- **Flow**:
  1.  Call `TaskUseCase.list_tasks(filter)`.
  2.  **Runtime Sync**: `TaskUseCase` checks the hash of the task CSV file. If it has changed since the last read, it executes `GitService.commit("Manual change detected during runtime")`.
  3.  `TaskRepository` (Pandas) reads CSV and returns `List[Task]`.
  4.  Hierarchy construction is delegated to the frontend; returns as a flat list.

#### `POST /tasks`

- **Related Spec-ID**: `SPEC-TASK-002-002`, `SPEC-HIST-001-001`
- **Flow**:
  1.  Call `TaskUseCase.create_task(dto)`.
  2.  **ID Generation**: Generate UUID v4.
  3.  Create `Task` entity and save (append) via `TaskRepository`.
  4.  **Git Commit**: Execute `GitService.commit(f"Add task {title}")`.

#### `PUT /tasks/{id}`

- **Related Spec-ID**: `SPEC-TASK-002-001`, `SPEC-HIST-001-001`
- **Flow**:
  1.  Call `TaskUseCase.update_task(id, dto)`.
  2.  Update record with corresponding ID via `TaskRepository`.
  3.  **Git Commit**: Execute `GitService.commit(f"Update task {title}")`.

#### `PUT /tasks/reorder`

- **Related Spec-ID**: `SPEC-TASK-004-001`, `SPEC-HIST-001-001`
- **Flow**:
  1.  Call `TaskUseCase.reorder_tasks(orders)`.
  2.  Update and save multiple task orders at once via `TaskRepository.update_orders(orders)`.
  3.  **Git Commit**: Execute `GitService.commit("Reorder tasks")`.

#### `DELETE /tasks/{id}`

- **Flow**:
  1.  Call `TaskUseCase.delete_task(id)`.
  2.  Physically delete (or update logical delete flag) record via `TaskRepository`.
  3.  **Git Commit**: Execute `GitService.commit(f"Delete task {id}")`.

### 4.3 System Management (System)

#### `GET /system/status`

- **Related Spec-ID**: `SPEC-INIT-001-001`
- **Flow**:
  1.  **Startup Sync**: Call `SystemUseCase.sync_manual_changes()`.
      - Read current project settings and compare expected Git branch with actual branch. Checkout if mismatch.
      - Commit any uncommitted changes in config or task data with "Manual change detected at startup".
  2.  Call `GitService.is_initialized()` to check for `.git` directory existence.
  3.  Call `SettingsUseCase.has_default_project()` to check for configuration file existence.
  4.  Call `GitService.get_current_branch()` to get the current project name (branch name).

### 4.4 Project Management (Projects)

#### `POST /projects`

- **Related Spec-ID**: `SPEC-INIT-002-001`
- **Flow**:
  1.  Call `GitService.create_branch(name)` to create and checkout a new branch from `main`.
  2.  Call `SettingsUseCase.create_project_settings(name)` to create and save initial settings file.
  3.  **Git Commit**: `GitService.commit(f"Initialize project {name}")`.

#### `POST /projects/{project_id}/switch`

- **Related Spec-ID**: `SPEC-INIT-003-001`
- **Flow**:
  1.  Call `GitService.checkout_branch(project_id)`.
  2.  Since working directory files change, clear any necessary caches (FastAPI is stateless, but be aware of in-memory data).

## 5. External Integration (History Management)

### Git Integration

- **Component**: `infrastructure/git/GitService`
- **Function**: Use Python `subprocess` or `GitPython` library.
- **Methods**:
  - `commit(message: str)`: `git add .` && `git commit -m message`
  - `restore(commit_hash: str)`: `git restore --source commit_hash .`
  - `create_branch(name: str)`: `git checkout -b name`
  - `checkout_branch(name: str)`: `git checkout name`
  - `get_current_branch() -> str`: `git branch --show-current`
  - `has_uncommitted_changes() -> bool`: Returns true if `git status --porcelain` is not empty.

### 5.2 Manual Change Sync Logic

- **Hash Management**: Use a component like `infrastructure/file_system/FileHashManager` to store SHA-256 hashes of files at the time of last commit or read.
- **Detection Timing**:
  - Backend startup (`startup` event in `main.py`).
  - Data retrieval APIs (e.g., `GET /tasks`).
- **Branch Switching**:
  - If `current_project` in `projects.json` differs from Git's `current_branch`, it indicates a project change made outside the tool, and the branch is switched accordingly.

# System Design

## 1. System Overview
### 1.1 Background & Purpose
*   **Background**: Addressing the need for offline availability and history management via Git.
*   **Purpose**: To realize a robust and simple project management tool combining file-based (JSON/CSV) data management with Git-based history management.

### 1.2 Scope
*   **In Scope**: This system (Frontend, Backend) and local data store.
*   **Out of Scope**: Remote repository integration (Git is used functionally, but remote synchronization is up to user operation).

### 1.3 System Configuration

```mermaid
graph TD
    User[User] -->|Browser Operation| FE[Frontend (React/Vite)]
    FE -->|HTTP API| BE[Backend (Python/FastAPI)]
    BE -->|Read/Write| FS[File System (JSON/CSV)]
    BE -->|Commit/Restore| Git[Git Repository]
```

## 2. Environment
*   **Language**: TypeScript (Frontend), Python 3.12+ (Backend)
*   **Framework**: React (Frontend), FastAPI (Backend)
*   **Database**: None (Uses JSON/CSV files)
*   **Infrastructure**: Supports Docker container execution or direct execution on local PC.

## 3. Functional Requirements

### 3.1 Configuration Management (CNFG)

*   **Implementation Strategy**
    *   Configuration files are saved in JSON format in directories like `data/`.
    *   Use Pydantic models for validation to prevent invalid configuration values.

*   **Requirement List**
| Spec-ID | Category | Name | Item | Detail | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SPEC-CNFG-001-001** | Config | Basic Settings | File | Store in `data/settings.json` in JSON format. | REQ-CNFG-001 |
| **SPEC-CNFG-001-002** | Config | Basic Settings | Model | Define `BasicSettings` class to manage task statuses, types, assignees etc. | REQ-CNFG-001 |
| **SPEC-CNFG-002-001** | Config | Project Settings | File | Store in `data/projects.json` (or individual files). | REQ-CNFG-002 |
| **SPEC-CNFG-002-002** | Config | Project Settings | Override | Allow overriding basic settings on a per-project basis. | REQ-CNFG-002 |

### 3.2 Task Management (TASK)

*   **Implementation Strategy**
    *   Task data is processed using `pandas` DataFrame and saved as CSV files.
    *   Task IDs use UUID v4 to ensure uniqueness.
    *   Hierarchical structure is represented by `ParentID` in each task data, and reconstructed into a tree structure on the frontend.

*   **Requirement List**
| Spec-ID | Category | Name | Item | Detail | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SPEC-TASK-001-001** | Task | Task List | API | `GET /api/v1/tasks` reads from CSV and returns all task data. | REQ-TASK-001 |
| **SPEC-TASK-001-002** | Task | Task List | Filter | Filter by status, assignee etc. via query params or frontend. | REQ-TASK-001 |
| **SPEC-TASK-002-001** | Task | Task Data | Data Format | Tasks are saved in `data/tasks.csv`. | REQ-TASK-004 |
| **SPEC-TASK-002-002** | Task | Task Create | ID Gen | Automatically generate UUID v4 for ID on creation. | REQ-TASK-002 |
| **SPEC-TASK-003-001** | Task | Hierarchy | Data Structure | Has `parent_id` column to hold parent task ID. | REQ-TASK-003 |

### 3.3 Visualization & Charts (VIEW)

*   **Implementation Strategy**
    *   Render using frontend libraries.
    *   Data aggregation is performed in Backend or Frontend Service layer.

*   **Requirement List**
| Spec-ID | Category | Name | Item | Detail | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SPEC-VIEW-001-001** | View | Gantt Chart | Logic | Render bars based on planned start/end dates. Parent covers child duration. | REQ-VIEW-001 |
| **SPEC-VIEW-002-001** | View | Progress Line | Logic | Calculate delay/advance coordinates based on progress rate at base date. | REQ-VIEW-002 |

### 3.4 History Management (HIST)

*   **Implementation Strategy**
    *   Issue `git add .`, `git commit` commands from the backend immediately after data save operations.
    *   Restore files to specific commit hash state for Undo/Redo.

*   **Requirement List**
| Spec-ID | Category | Name | Item | Detail | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SPEC-HIST-001-001** | History | Auto Commit | Trigger | Execute on successful completion of Task Add/Update/Delete APIs. | REQ-HIST-001 |
| **SPEC-HIST-001-002** | History | Auto Commit | Log | Include operation details (e.g., "Update Task A") in commit message. | REQ-HIST-001 |
| **SPEC-HIST-002-001** | History | Undo/Redo | Restore Logic | `git restore` (or checkout) to the file state of the specified commit. | REQ-HIST-002 |

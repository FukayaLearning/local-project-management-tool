# Requirements Definition

## 1. System Overview

### 1.1 Background and Purpose

- **Background**: There is a need for a project management tool that operates in offline environments without requiring complex infrastructure such as database servers. Additionally, there is a need to reliably manage change history using a version control system (Git).
- **Purpose**: To provide a project management tool that operates fully offline, manages data in universal formats such as JSON/CSV, and features powerful history management through Git. This enables users to perform project management with confidence regardless of location.

### 1.2 Scope

- **In Scope**:
  - Multiple project creation, listing, and selection functionality
  - Per-project settings management (JSON), global basic settings management (JSON)
  - CRUD operations for task data (CSV)
  - Visual display of task data (list, Gantt chart)
  - History management through independent Git repositories per project (Undo/Redo)
- **Out of Scope**:
  - Multi-user simultaneous editing/real-time synchronization (asynchronous sharing via Git is possible but outside the scope of this system)
  - Direct integration with cloud storage
  - Migration functionality from existing data structures

### 1.3 User Definition

| User Type | Description                                                            |
| :-------- | :--------------------------------------------------------------------- |
| User      | An individual or team member who uses this tool for project management |

---

## 2. Functional Requirements

### 2.1 Settings Management (CNFG)

| Req-ID           | Category      | Feature Name          | Details / Behavior                                                                                                                                                                                                          | Priority | Notes |
| :--------------- | :------------ | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| **REQ-CNFG-001** | Settings Mgmt | Global Basic Settings | Task statuses, task types, assignees, daily work hours, and holiday definitions shall be managed in a global settings file (`data/setting.json`). This file shall not be under Git management.                              | High     |       |
| **REQ-CNFG-002** | Settings Mgmt | Project Settings      | Project-specific settings (override values for basic settings and metadata) shall be managed in a settings file within the project directory (`data/<project-name>/setting.json`). This file shall be under Git management. | High     |       |

### 2.2 Task Management (TASK)

| Req-ID           | Category        | Feature Name      | Details / Behavior                                                                                             | Priority | Notes |
| :--------------- | :-------------- | :---------------- | :------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| **REQ-TASK-001** | Task Management | Task List Display | Registered tasks shall be displayed in a list format. Deletion, search, filter, and sort shall be available.   | High     |       |
| **REQ-TASK-002** | Task Management | Task Create/Edit  | New task creation and editing of existing tasks shall be possible. IDs shall be auto-generated (uuid4).        | High     |       |
| **REQ-TASK-003** | Task Management | Hierarchy Display | Hierarchical tree display based on parent-child relationships of tasks shall be possible.                      | Medium   |       |
| **REQ-TASK-004** | Task Management | CSV I/O           | Task data shall be saved and loaded in CSV format. The save location shall be `data/<project-name>/tasks.csv`. | High     |       |
| **REQ-TASK-005** | Task Management | Task Reordering   | Tasks shall be reorderable via drag-and-drop in the task list and Gantt chart.                                 | High     |       |

### 2.3 Visualization / Charts (VIEW)

| Req-ID           | Category      | Feature Name        | Details / Behavior                                                                                                              | Priority | Notes |
| :--------------- | :------------ | :------------------ | :------------------------------------------------------------------------------------------------------------------------------ | :------- | :---- |
| **REQ-VIEW-001** | Visualization | Gantt Chart Display | Task schedules (planned start/end) shall be displayed in Gantt chart format. Parent task period aggregation shall be performed. | High     |       |
| **REQ-VIEW-002** | Visualization | Inazuma Line        | Progress status shall be displayed as an Inazuma line based on actual dates and progress rates.                                 | Medium   |       |

### 2.4 History Management (HIST)

| Req-ID           | Category     | Feature Name         | Details / Behavior                                                                                                                                                                 | Priority | Notes |
| :--------------- | :----------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| **REQ-HIST-001** | History Mgmt | Auto Commit          | When data is changed through tool operations (task create/edit/delete), a commit shall be automatically created in the project's Git repository.                                   | High     |       |
| **REQ-HIST-002** | History Mgmt | Manual Change Commit | When task data is directly modified externally while the tool is running, changes shall be detected at data load time and automatically committed to the project's Git repository. | High     |       |
| **REQ-HIST-003** | History Mgmt | Undo/Redo            | Using the project's Git history, it shall be possible to revert task data to a previous state (Undo) or cancel a revert (Redo).                                                    | High     |       |

### 2.5 Project Management (PROJ)

| Req-ID           | Category           | Feature Name              | Details / Behavior                                                                                                                                                                                                                  | Priority | Notes |
| :--------------- | :----------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| **REQ-PROJ-001** | Project Management | Project List Display      | Existing projects shall be displayed in a list. Selecting a project shall navigate to its task list page.                                                                                                                           | High     |       |
| **REQ-PROJ-002** | Project Management | New Project Creation      | A new project shall be created by entering a project name. Upon creation, the project directory, Git initialization, settings/task file initialization, and initial commit shall be performed, then navigate to the task list page. | High     |       |
| **REQ-PROJ-003** | Project Management | Project Name Validation   | Project names shall be validated as follows: (1) not empty after trimming, (2) no OS-prohibited directory name characters (Windows/Linux), (3) no duplicate with existing project names. Errors shall be displayed on violation.    | High     |       |
| **REQ-PROJ-004** | Project Management | Auto Git Repository Init  | When a project's task is changed and No Git repository exists, `git init` shall be performed on the pre-change state, an initial commit created, then the change committed.                                                         | High     |       |
| **REQ-PROJ-005** | Project Management | External Change Detection | At tool startup or data load, if project settings or task data have been directly modified externally, they shall be loaded and the tool shall operate correctly.                                                                   | High     |       |

### 2.6 UI Common (UI)

| Req-ID         | Category | Feature Name            | Details / Behavior                                                                                                                                                           | Priority | Notes |
| :------------- | :------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| **REQ-UI-001** | UI       | Global Menu Display     | On global context screens (project management, basic settings), links to "Project Management" and "Basic Settings" shall be displayed.                                       | High     |       |
| **REQ-UI-002** | UI       | Project Menu Display    | On project context screens (task list, Gantt chart, project settings), links to "Project Management", "Task List", "Gantt Chart", and "Project Settings" shall be displayed. | High     |       |
| **REQ-UI-003** | UI       | Project Switch Dropdown | On project context screens, a project list dropdown shall be displayed to enable switching between projects.                                                                 | High     |       |
| **REQ-UI-004** | UI       | Undo/Redo Buttons       | On project context screens, "Undo" and "Redo" buttons shall be displayed to allow canceling or redoing task change operations.                                               | High     |       |

### 2.7 Routing (ROUTE)

| Req-ID            | Category | Feature Name            | Details / Behavior                                                                                            | Priority | Notes |
| :---------------- | :------- | :---------------------- | :------------------------------------------------------------------------------------------------------------ | :------- | :---- |
| **REQ-ROUTE-001** | Routing  | Project Management Page | The project management page (project list + new creation) shall be displayed at `/projects` or `/`.           | High     |       |
| **REQ-ROUTE-002** | Routing  | Basic Settings Page     | The basic settings page shall be displayed at `/settings`.                                                    | High     |       |
| **REQ-ROUTE-003** | Routing  | Task List Page          | The task list page for the selected project shall be displayed at `/projects/<encoded-name>`.                 | High     |       |
| **REQ-ROUTE-004** | Routing  | Gantt Chart Page        | The Gantt chart page for the selected project shall be displayed at `/projects/<encoded-name>/gantts`.        | High     |       |
| **REQ-ROUTE-005** | Routing  | Project Settings Page   | The project settings page for the selected project shall be displayed at `/projects/<encoded-name>/settings`. | High     |       |

---

## 3. Non-Functional Requirements

### 3.1 Operating Environment / Constraints (ENV)

- **REQ-ENV-001**: All features shall function in offline environments without internet connectivity.
- **REQ-ENV-002**: Data storage shall use the local file system (JSON/CSV).
- **REQ-ENV-003**: No external database servers (MySQL, PostgreSQL, etc.) shall be required.
- **REQ-ENV-004**: Change history shall be preserved and carried over during version upgrades (Docker build replacement) or tool restarts.

### 3.2 Performance (PERF)

- **REQ-PERF-001**: On typical PC specifications, several thousand task records shall be operated and displayed without delay.

### 3.3 Data Management (DATA)

- **REQ-DATA-001**: Each project shall have an independent Git repository with completely separated history.
- **REQ-DATA-002**: `setting.json` and `tasks.csv` within each project directory shall be under Git management.
- **REQ-DATA-003**: The global basic settings (`data/setting.json`) shall not be under Git management.

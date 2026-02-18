# Requirement Definition

## 1. System Overview

### 1.1 Background & Purpose

- **Background**: There is a need for a project management tool that operates in an offline environment and does not require complex infrastructure like database servers. There is also a need for reliable change history management using a version control system (Git).
- **Purpose**: To provide a project management tool that is completely offline, manages data in versatile formats like JSON/CSV, and offers powerful history management via Git. This allows users to manage projects securely from anywhere.

### 1.2 Scope

- **In Scope**:
  - Management of project settings and basic settings (JSON)
  - CRUD operations for task data (CSV)
  - Visual display of task data (List, Gantt Chart)
  - Data history management via Git (Undo/Redo)
- **Out of Scope**:
  - Simultaneous editing by multiple users and real-time synchronization (asynchronous sharing via Git is possible, but real-time sync is out of scope)
  - Direct integration with cloud storage

### 1.3 User Definition

| User Type | Description                                                            |
| :-------- | :--------------------------------------------------------------------- |
| User      | An individual or team member who uses this tool for project management |

---

## 2. Functional Requirements

### 2.1 Configuration Management (CNFG)

| Req-ID           | Category | Feature Name     | Detail & Behavior                                                                                                             | Priority | Remarks |
| :--------------- | :------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **REQ-CNFG-001** | Config   | Basic Settings   | Ability to manage Task Status, Task Type, Assignee, Daily Work Hours, and Holiday Definitions in a configuration file (JSON). | High     |         |
| **REQ-CNFG-002** | Config   | Project Settings | Ability to manage Project Name, duration, and overrides for Basic Settings in a project-specific configuration file (JSON).   | High     |         |

### 2.2 Task Management (TASK)

| Req-ID           | Category | Feature Name     | Detail & Behavior                                                                                           | Priority | Remarks |
| :--------------- | :------- | :--------------- | :---------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **REQ-TASK-001** | Task     | Task List View   | Ability to display registered tasks in a list format. Supports deletion, searching, filtering, and sorting. | High     |         |
| **REQ-TASK-002** | Task     | Task Create/Edit | Ability to create new tasks and edit existing ones. IDs should be automatically generated (uuid4).          | High     |         |
| **REQ-TASK-003** | Task     | Hierarchy View   | Ability to display a hierarchical tree view based on parent-child relationships of tasks.                   | Medium   |         |
| **REQ-TASK-004** | Task     | CSV I/O          | Ability to save and load task data in CSV format.                                                           | High     |         |

### 2.3 Visualization & Charts (VIEW)

| Req-ID           | Category      | Feature Name  | Detail & Behavior                                                                                                                       | Priority | Remarks |
| :--------------- | :------------ | :------------ | :-------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **REQ-VIEW-001** | Visualization | Gantt Chart   | Ability to display task schedules (planned start/end) in a Gantt chart format. Parent task duration should be aggregated from children. | High     |         |
| **REQ-VIEW-002** | Visualization | Progress Line | Ability to display a progress line (Inazuma line) based on actual dates and progress rate.                                              | Medium   |         |

### 2.4 History Management (HIST)

| Req-ID           | Category | Feature Name | Detail & Behavior                                                                                                | Priority | Remarks |
| :--------------- | :------- | :----------- | :--------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **REQ-HIST-001** | History  | Auto Commit  | Automatically create a Git commit upon data modification operations such as task creation, editing, or deletion. | High     |         |
| **REQ-HIST-002** | History  | Undo/Redo    | Ability to revert task data to a previous state (Undo) or cancel the revert (Redo) using Git history.            | High     |         |

### 2.5 Initialization & Project Creation (INIT)

| Req-ID           | Category         | Feature Name         | Detail & Behavior                                                                                                                                           | Priority | Remarks |
| :--------------- | :--------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **REQ-INIT-001** | Initialization   | Git Repo Init        | When the tool starts, if there is no Git configuration in the task data directory, initialize as a local Git repo with main branch.                         | High     |         |
| **REQ-INIT-002** | Initialization   | Check Project Config | When the tool starts, check if a default project configuration exists.                                                                                      | High     |         |
| **REQ-INIT-003** | Initialization   | Screen Transition    | When the tool starts, if default project config exists, show task list. If not, show new project creation screen.                                           | High     |         |
| **REQ-INIT-004** | Project Creation | Create New Project   | Ability to enter project name and save in the new project creation screen. On save, create a branch with the project name from main and start data storage. | High     |         |

### 2.6 Common UI (UI)

| Req-ID         | Category | Feature Name      | Detail & Behavior                                                          | Priority | Remarks |
| :------------- | :------- | :---------------- | :------------------------------------------------------------------------- | :------- | :------ |
| **REQ-UI-001** | UI       | Menu Bar          | Always display the menu bar on all screens.                                | High     |         |
| **REQ-UI-002** | UI       | Project Switch    | Display project selection dropdown in menu bar to switch projects.         | High     |         |
| **REQ-UI-003** | UI       | Screen Navigation | Display screen transition menu (Task List, Gantt Chart, etc.) in menu bar. | High     |         |
| **REQ-UI-004** | UI       | Undo/Redo         | Display Undo/Redo buttons in menu bar to revert/redo task changes.         | High     |         |

---

## 3. Non-Functional Requirements

### 3.1 Environment & Constraints (ENV)

- **REQ-ENV-001**: All functions must operate in an offline environment without internet connection.
- **REQ-ENV-002**: Data storage destination must be the local file system (JSON/CSV).
- **REQ-ENV-003**: Must not require external database servers (MySQL, PostgreSQL, etc.).

### 3.2 Performance (PERF)

- **REQ-PERF-001**: Must be able to manipulate and display thousands of task records without delay on standard PC specs.

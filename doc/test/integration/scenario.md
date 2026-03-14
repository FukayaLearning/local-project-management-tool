# Integration Test Specification

## 1. Test Strategy

- **Environment**: Docker Container Environment (Frontend + Backend + Nginx)
- **Tools**: Vitest (Frontend Integration), or Playwright (E2E)
  - In this project, we conduct frontend component integration tests and integration tests that actually communicate with backend API.
- **Objective**: Confirm that frontend and backend cooperate and user business flows (scenarios) complete successfully.

## 2. Test Scenarios

### Scenario 1: Project Settings Reference and Update (Settings)

- **Related Requirements**: REQ-PROJ-003, REQ-SET-001
- **Prerequisites**: Application is running and backend initial data exists.

| Step | Operation/Procedure                                | Expected Result                                                                           | Test-ID            |
| :--- | :------------------------------------------------- | :---------------------------------------------------------------------------------------- | :----------------- |
| 1    | Access Settings Page (`http://localhost/settings`) | Settings form is displayed and current project name is shown                              | **IT-SCN-SET-001** |
| 2    | Change project name and click "Save Changes"       | Save completion message or state transition occurs, and change is maintained after reload | **IT-SCN-SET-002** |

### Scenario 2: Task Management Flow (Task Management)

- **Related Requirements**: REQ-TASK-001, REQ-TASK-002, REQ-TASK-003

| Step | Operation/Procedure                              | Expected Result                                                    | Test-ID             |
| :--- | :----------------------------------------------- | :----------------------------------------------------------------- | :------------------ |
| 1    | Access Task List Page (`http://localhost/tasks`) | Task list is displayed                                             | **IT-SCN-TASK-001** |
| 2    | Click "New Task" button                          | Task creation modal is displayed                                   | **IT-SCN-TASK-002** |
| 3    | Input title and status, click "Save"             | Modal closes and new task is added to the list                     | **IT-SCN-TASK-003** |
| 4    | Click the added task                             | Task detail (edit) modal opens and registered content is displayed | **IT-SCN-TASK-004** |
| 5    | Change status and click "Save"                   | Status of the corresponding task in the list is updated            | **IT-SCN-TASK-005** |
| 6    | Select a specific status in the status filter    | Only tasks with the selected status are displayed                  | **IT-SCN-TASK-006** |

### Scenario 3: Initialization & Project Creation Flow (Init/Create Project)

- **Related Requirements**: REQ-INIT-001, REQ-INIT-003, REQ-INIT-004

| Step | Operation/Procedure                           | Expected Result                                                          | Test-ID             |
| :--- | :-------------------------------------------- | :----------------------------------------------------------------------- | :------------------ |
| 1    | First launch application (no data)            | Redirected to `/create_project` and project creation screen is displayed | **IT-SCN-INIT-001** |
| 2    | Input project name and click "Create Project" | Redirected to TOP page, created project name is displayed in menu bar    | **IT-SCN-INIT-002** |

### Scenario 4: Manual Sync and Persistence (Manual Sync)

- **Related Requirements**: REQ-HIST-002, REQ-INIT-002, REQ-ENV-004

| Step | Operation/Procedure                              | Expected Result                                                       | Verification Point (DB/Logs)            | Test-ID               |
| :--- | :----------------------------------------------- | :-------------------------------------------------------------------- | :-------------------------------------- | :-------------------- |
| 1    | Manually edit `tasks.csv` while app is running   | App state doesn't instantly reflect the change (memory/file mismatch) | None                                    | **IT-SCN-SYNC-001-1** |
| 2    | Reload the task list (API call)                  | Manually edited content is displayed in the list                      | Auto commit is created in History (Git) | **IT-SCN-SYNC-001-2** |
| 3    | Manually rewrite project name in `settings.json` | None                                                                  | None                                    | **IT-SCN-SYNC-001-3** |
| 4    | Reload the browser                               | Rewritten project name is displayed in the header, etc.               | Git branch is automatically switched    | **IT-SCN-SYNC-001-4** |

### Scenario 5: Undo/Redo Flow (Undo/Redo)

- **Related Requirements**: REQ-HIST-002

| Step | Operation/Procedure | Expected Result                    | Test-ID             |
| :--- | :------------------ | :--------------------------------- | :------------------ |
| 1    | Create new task     | Added to task list                 | **IT-SCN-HIST-001** |
| 2    | Click "Undo" button | Created task disappears from list  | **IT-SCN-HIST-002** |
| 3    | Click "Redo" button | Disappeared task reappears in list | **IT-SCN-HIST-003** |

### Scenario 6: Switch Project Flow (Switch Project)

- **Related Requirements**: REQ-UI-002

| Step | Operation/Procedure                  | Expected Result                                               | Test-ID           |
| :--- | :----------------------------------- | :------------------------------------------------------------ | :---------------- |
| 1    | Change project selection in menu bar | Screen reloads and task list of selected project is displayed | **IT-SCN-SW-001** |

### Scenario 7: Common UI Layout and Navigation (UI Layout)

- **Related Requirements**: REQ-UI-001, REQ-UI-003

| Step | Operation/Procedure                       | Expected Result                                                                     | Test-ID           |
| :--- | :---------------------------------------- | :---------------------------------------------------------------------------------- | :---------------- |
| 1    | Access the application                    | Header and Sidebar (navigation) are displayed properly, with logo and menus present | **IT-SCN-UI-001** |
| 2    | Click on each link in the navigation menu | Transitions to corresponding pages (Tasks, Gantt Chart, Settings, etc.) properly    | **IT-SCN-UI-001** |

### Scenario 8: Gantt Chart Display Flow (Gantt Chart)

- **Related Requirements**: REQ-VIEW-001, REQ-VIEW-002

| Step | Operation/Procedure                       | Expected Result                                          | Test-ID              |
| :--- | :---------------------------------------- | :------------------------------------------------------- | :------------------- |
| 1    | Access Gantt Chart page                   | Gantt Chart page is displayed with \"Gantt Chart\" title | **IT-SCN-GANTT-001** |
| 2    | Create a task with dates and save         | A bar is displayed on the Gantt Chart                    | **IT-SCN-GANTT-002** |
| 3    | Toggle \"Show Progress Line\" checkbox ON | Inazuma line (red dashed line) is displayed              | **IT-SCN-GANTT-003** |

### Scenario 9: Task Reorder Flow (Task Reorder)

- **Related Requirements**: REQ-TASK-005

| Step | Operation/Procedure                          | Expected Result                                                     | Test-ID                |
| :--- | :------------------------------------------- | :------------------------------------------------------------------ | :--------------------- |
| 1    | Drag and drop a task row on Task List page   | Task moves to dropped position and order is maintained after reload | **IT-SCN-REORDER-001** |
| 2    | Drag and drop a task row on Gantt Chart page | Task moves to dropped position and order is maintained after reload | **IT-SCN-REORDER-002** |

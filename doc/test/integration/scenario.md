# Integration Test Specification

## 1. Test Strategy

- **Environment**: Docker Container Environment (Frontend + Backend + Nginx)
- **Tools**: Vitest (Frontend Integration), or Playwright (E2E)
  - In this project, we conduct frontend component integration tests and integration tests that actually communicate with backend API.
- **Objective**: Confirm that frontend and backend cooperate and user business flows (scenarios) complete successfully.

## 2. Test Scenarios

### Scenario 1: Project Settings Reference and Update (Settings)

- **Related Requirements**: REQ-PROJ-003, REQ-SET-001
- **Prerequisites**: Application is running and at least one project exists.

| Step | Operation/Procedure                                                       | Expected Result                                                                  | Test-ID            |
| :--- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------- | :----------------- |
| 1    | Access Settings Page (`http://localhost/projects/[ProjectName]/settings`) | Settings form is displayed and current project name is shown                     | **IT-SCN-SET-001** |
| 2    | Change project name and click "Save Changes"                              | Save completion message is shown, and the project URL is updated to the new name | **IT-SCN-SET-002** |

### Scenario 2: Task Management Flow (Task Management)

- **Related Requirements**: REQ-TASK-001, REQ-TASK-002, REQ-TASK-003

| Step | Operation/Procedure                                               | Expected Result                                                    | Test-ID             |
| :--- | :---------------------------------------------------------------- | :----------------------------------------------------------------- | :------------------ |
| 1    | Access Task List Page (`http://localhost/projects/[ProjectName]`) | Task list is displayed                                             | **IT-SCN-TASK-001** |
| 2    | Click "New Task" button                                           | Task creation modal is displayed                                   | **IT-SCN-TASK-002** |
| 3    | Input title and status, click "Save"                              | Modal closes and new task is added to the list                     | **IT-SCN-TASK-003** |
| 4    | Click the added task                                              | Task detail (edit) modal opens and registered content is displayed | **IT-SCN-TASK-004** |
| 5    | Change status and click "Save"                                    | Status of the corresponding task in the list is updated            | **IT-SCN-TASK-005** |
| 6    | Select a specific status in the status filter                     | Only tasks with the selected status are displayed                  | **IT-SCN-TASK-006** |

### Scenario 3: Initialization & Project Creation Flow (Init/Create Project)

- **Related Requirements**: REQ-INIT-001, REQ-INIT-003, REQ-INIT-004

| Step | Operation/Procedure                                                | Expected Result                                                                        | Test-ID             |
| :--- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------ |
| 1    | First launch application without data to `http://localhost/`       | Redirected to `/projects` and an empty project list is displayed                       | **IT-SCN-INIT-001** |
| 2    | Click "New Project", input project name and click "Create Project" | Redirected to the project's task list page (`http://localhost/projects/[ProjectName]`) | **IT-SCN-INIT-002** |

### Scenario 4: Manual Sync and Persistence (Manual Sync)

- **Related Requirements**: REQ-HIST-002, REQ-INIT-002, REQ-ENV-004

| Step | Operation/Procedure                                               | Expected Result                                                          | Verification Point (DB/Logs)            | Test-ID               |
| :--- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------- | :-------------------- |
| 1    | Manually edit `data/[ProjectName]/tasks.csv` while app is running | App state doesn't instantly reflect the change (memory/file update wait) | None                                    | **IT-SCN-SYNC-001-1** |
| 2    | Reload the task list (API call)                                   | Manually edited content is displayed in the list                         | Auto commit is created in History (Git) | **IT-SCN-SYNC-001-2** |
| 3    | Create a new directory under `data/` via shell                    | None                                                                     | None                                    | **IT-SCN-SYNC-001-3** |
| 4    | Reload the project list screen                                    | The created directory name is displayed as a project                     | Recognized as a project                 | **IT-SCN-SYNC-001-4** |

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

| Step | Operation/Procedure                       | Expected Result                                                                                              | Test-ID           |
| :--- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------- |
| 1    | Access the application                    | Header and navigations are displayed properly, with logo and menus present                                   | **IT-SCN-UI-001** |
| 2    | Click on each link in the navigation menu | Transitions to corresponding pages (Project Management, Tasks, Gantt Chart, Project Settings, etc.) properly | **IT-SCN-UI-001** |

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

### Scenario 10: Advanced Auto Scheduling (Advanced Scheduling)

- **Related Requirements**: REQ-VIEW-003

| Step | Operation/Procedure                       | Expected Result                                                                                            | Test-ID                |
| :--- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :--------------------- |
| 1    | Assign multiple tasks to the same person  | Tasks are scheduled sequentially without overlap, within daily work hours limit.                           | **IT-SCN-SCHED-001**   |
| 2    | Change assignee's productivity and save   | Task duration (days) correctly scales based on productivity (e.g., productivity 2.0 halves the duration).  | **IT-SCN-SCHED-002**   |
| 3    | Add multiple short tasks                  | Next tasks start using remaining time within the same day (Intra-day continuation).                        | **IT-SCN-SCHED-003-1** |
| 4    | Fix a high priority task to a future date | Lower priority tasks are automatically scheduled in the available gap before the fixed date (Gap-filling). | **IT-SCN-SCHED-003-2** |

### Scenario 11: Undefined Field Preservation (Undefined Field Preservation)

- **Related Requirements**: REQ-TASK-006

| Step | Operation/Procedure                                                                          | Expected Result                                                                    | Test-ID              |
| :--- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------------------- |
| 1    | Place a CSV from external tool containing unknown columns (e.g., "Milestone") into a project | Task list is displayed normally                                                    | **IT-SCN-EXTRA-001** |
| 2    | Edit any task content within the tool and save                                               | Other edits are saved while unknown columns and their values are maintained in CSV | **IT-SCN-EXTRA-002** |
| 3    | Export the project                                                                           | The exported CSV contains the unknown columns                                      | **IT-SCN-EXTRA-003** |

### Scenario 12: Apply Schedule (Apply Schedule)

- **Related Requirements**: REQ-VIEW-004

| Step | Operation/Procedure                              | Expected Result                                                                         | Test-ID              |
| :--- | :----------------------------------------------- | :-------------------------------------------------------------------------------------- | :------------------- |
| 1    | Import tasks with no dates or inconsistent dates | Automatically calculated schedules are shown on the Gantt chart                         | **IT-SCN-APPLY-001** |
| 2    | Click "Apply Schedule to CSV" button             | Success message is shown, and calculated dates are saved back to CSV as start/due dates | **IT-SCN-APPLY-002** |
| 3    | Return to the task list and verify updated dates | The list reflects the calculated date results in the date columns                       | **IT-SCN-APPLY-003** |

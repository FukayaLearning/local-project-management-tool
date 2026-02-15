# Integration Test Specification

## 1. Test Strategy
* **Environment**: Docker Container Environment (Frontend + Backend + Nginx)
* **Tools**: Vitest (Frontend Integration), or Playwright (E2E)
    * In this project, we conduct frontend component integration tests and integration tests that actually communicate with backend API.
* **Objective**: Confirm that frontend and backend cooperate and user business flows (scenarios) complete successfully.

## 2. Test Scenarios

### Scenario 1: Project Settings Reference and Update (Settings)
* **Related Requirements**: REQ-PROJ-003, REQ-SET-001
* **Prerequisites**: Application is running and backend initial data exists.

| Step | Operation/Procedure | Expected Result | Test-ID |
| :--- | :--- | :--- | :--- |
| 1 | Access Settings Page (`http://localhost/settings`) | Settings form is displayed and current project name is shown | **IT-SCN-SET-001** |
| 2 | Change project name and click "Save Changes" | Save completion message or state transition occurs, and change is maintained after reload | **IT-SCN-SET-002** |

### Scenario 2: Task Management Flow (Task Management)
* **Related Requirements**: REQ-TASK-001, REQ-TASK-002, REQ-TASK-003

| Step | Operation/Procedure | Expected Result | Test-ID |
| :--- | :--- | :--- | :--- |
| 1 | Access Task List Page (`http://localhost/tasks`) | Task list is displayed | **IT-SCN-TASK-001** |
| 2 | Click "New Task" button | Task creation modal is displayed | **IT-SCN-TASK-002** |
| 3 | Input title and status, click "Save" | Modal closes and new task is added to the list | **IT-SCN-TASK-003** |
| 4 | Click the added task | Task detail (edit) modal opens and registered content is displayed | **IT-SCN-TASK-004** |
| 5 | Change status and click "Save" | Status of the corresponding task in the list is updated | **IT-SCN-TASK-005** |

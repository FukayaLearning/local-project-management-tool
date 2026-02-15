# Frontend Unit Test Specification

## 1. Testing Strategy
*   **Tools**: Vitest, React Testing Library
*   **Coverage Criteria**:
    *   Normal and abnormal flows for main UseCase logic.
    *   Rendering and event handling for Common Components.
    *   Basic display verification for Page Components.

## 2. Component Test Specifications

### 2.1 Common Components

#### Button
*   **Target File**: `frontend/src/presentation/components/Button.tsx`

| Test-ID | Summary | Precondition | Input/Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-BTN-001** | Rendering (Primary) | None | variant="primary" | Primary style button is displayed. |
| **UNIT-FE-BTN-002** | Rendering (Secondary) | None | variant="secondary" | Secondary style button is displayed. |
| **UNIT-FE-BTN-003** | Rendering (Danger) | None | variant="danger" | Danger style button is displayed. |
| **UNIT-FE-BTN-004** | Click Event | onClick handler set | Click | Handler is executed. |
| **UNIT-FE-BTN-005** | Disabled State | disabled=true | Click | Handler is NOT executed. |

#### Input
*   **Target File**: `frontend/src/presentation/components/Input.tsx`

| Test-ID | Summary | Precondition | Input/Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-INP-001** | Rendering | With label | Display | Label and input field are displayed. |
| **UNIT-FE-INP-002** | Input Verification | None | Type string | onChange event fires and value updates. |
| **UNIT-FE-INP-003** | Error Display | error="Error Message" | Display | Error message is displayed in red. |

#### Select
*   **Target File**: `frontend/src/presentation/components/Select.tsx`

| Test-ID | Summary | Precondition | Input/Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-SEL-001** | Option Display | With options array | Display | Specified options are displayed. |
| **UNIT-FE-SEL-002** | Selection Change | None | Change option | onChange event fires and value updates. |

### 2.2 Application Layer (UseCases)

#### useTaskUseCase
*   **Target File**: `frontend/src/application/usecases/useTaskUseCase.ts`
*   **Note**: Test using mocked Repository.

| Test-ID | Summary | Precondition | Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-UC-TASK-001** | Fetch Tasks (Success) | Repo returns task array | fetchTasks() | tasks state is updated, isLoading becomes false. |
| **UNIT-FE-UC-TASK-002** | Fetch Tasks (Error) | Repo throws error | fetchTasks() | error state is updated, isLoading becomes false. |
| **UNIT-FE-UC-TASK-003** | Create Task (Success) | Repo returns new task | createTask() | New task is appended to tasks state. |
| **UNIT-FE-UC-TASK-004** | Update Task (Success) | Repo returns updated task | updateTask() | Corresponding task in tasks state is updated. |
| **UNIT-FE-UC-TASK-005** | Delete Task (Success) | Repo completes | deleteTask() | Corresponding task is removed from tasks state. |

#### useSettingsUseCase
*   **Target File**: `frontend/src/application/usecases/useSettingsUseCase.ts`

| Test-ID | Summary | Precondition | Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-UC-SET-001** | Fetch Settings (Success) | Repo returns settings | fetchSettings() | settings state is updated. |
| **UNIT-FE-UC-SET-002** | Update Project Settings | Repo returns updated data | updateProjectSettings() | settings.project is updated. |

### 2.3 Page/Feature Components

#### TaskDetailModal
*   **Target File**: `frontend/src/presentation/pages/TaskListPage/components/TaskDetailModal.tsx`

| Test-ID | Summary | Precondition | Input/Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-MOD-TASK-001** | New Mode Display | task=null | Display | Title is "New Task", fields are empty. |
| **UNIT-FE-MOD-TASK-002** | Edit Mode Display | task object exists | Display | Title is "Edit Task", fields are populated. |
| **UNIT-FE-MOD-TASK-003** | Save Action | Valid input | Click Save | onSave handler is called with input values. |
| **UNIT-FE-MOD-TASK-004** | Validation | Empty Title | Click Save | Save action is prevented (HTML5 validation). |

#### ProjectSettingsForm
*   **Target File**: `frontend/src/presentation/pages/SettingsPage/ProjectSettingsForm.tsx`

| Test-ID | Summary | Precondition | Input/Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-FRM-SET-001** | Initial Display | With settings | Display | Project name is set in input field. |
| **UNIT-FE-FRM-SET-002** | Save Action | Change name | Click Save | onSave handler is called with updated value. |

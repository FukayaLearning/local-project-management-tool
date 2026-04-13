# Frontend Unit Test Specification

## 1. Test Strategy

- **Tools**: Vitest, React Testing Library
- **Coverage Criteria**:
  - Rendering and event handling of major UI components (Button, Input, Select, Modal)
  - State management and API calls of UseCases (useTaskUseCase, useSettingsUseCase)
  - Form behavior of Page components (TaskDetailModal, ProjectSettingsForm)

## 2. Component Test Specifications

### 2.1 Common Components

| Component  | Test-ID         | Test Summary      | Expected Behavior                                   | Result |
| :--------- | :-------------- | :---------------- | :-------------------------------------------------- | :----- |
| **Button** | UNIT-FE-BTN-001 | Initial Rendering | Button is displayed with specified variant and size | PASS   |
|            | UNIT-FE-BTN-002 | Click Event       | onClick handler is called when clicked              | PASS   |
|            | UNIT-FE-BTN-003 | Disabled State    | Button is disabled when disabled prop is true       | PASS   |
| **Input**  | UNIT-FE-INP-001 | Initial Rendering | Label and input field are displayed                 | PASS   |
|            | UNIT-FE-INP-002 | Error Display     | Error message is displayed in red                   | PASS   |
| **Select** | UNIT-FE-SEL-001 | Initial Rendering | Specified options are displayed and selectable      | PASS   |

### 2.2 UseCases (Application Layer)

| Hook                   | Test-ID             | Test Summary            | Expected Behavior                               | Result |
| :--------------------- | :------------------ | :---------------------- | :---------------------------------------------- | :----- |
| **useTaskUseCase**     | UNIT-FE-UC-TASK-001 | Fetch Tasks Success     | Tasks fetched from API are reflected in state   | PASS   |
|                        | UNIT-FE-UC-TASK-002 | Fetch Tasks Failure     | Error state is updated                          | PASS   |
|                        | UNIT-FE-UC-TASK-003 | Create Task Success     | Newly created task is added to the list         | PASS   |
|                        | UNIT-FE-UC-TASK-004 | Create Subtask Success  | Task created with parent_id reflects properly   | PASS   |
|                        | UNIT-FE-UC-TASK-005 | Reorder Tasks Success   | Reorder API is called and task array is fetched | PASS   |
|                        | UNIT-FE-UC-TASK-006 | Batch Apply Success     | bulkUpdate API is called and list is refreshed  | PASS   |
| **useSettingsUseCase** | UNIT-FE-UC-SET-001  | Fetch Settings Success  | Project settings are reflected in state         | PASS   |
|                        | UNIT-FE-UC-SET-002  | Update Settings Success | Updated settings are reflected in state         | PASS   |
| **useProjectUseCase**  | UNIT-FE-UC-PROJ-001 | Fetch Projects Success  | Project list from API is reflected in state     | PASS   |
|                        | UNIT-FE-UC-PROJ-002 | Create Project Success  | Newly created project is added to the list      | PASS   |
|                        | UNIT-FE-UC-PROJ-003 | Execute Undo Success    | Undo API is called and returns valid result     | PASS   |
|                        | UNIT-FE-UC-PROJ-004 | Execute Redo Success    | Redo API is called and returns valid result     | PASS   |

### 2.3 Page Components

| Component                 | Test-ID            | Test Summary         | Expected Behavior                                         | Result |
| :------------------------ | :----------------- | :------------------- | :-------------------------------------------------------- | :----- |
| **TaskDetailModal**       | UNIT-FE-PG-TDM-001 | Create Mode Display  | Empty form is displayed                                   | PASS   |
|                           | UNIT-FE-PG-TDM-002 | Edit Mode Display    | Existing task information is pre-filled in form           | PASS   |
|                           | UNIT-FE-PG-TDM-003 | Save Operation       | onSave is called with input content                       | PASS   |
| **ProjectSettingsForm**   | UNIT-FE-PG-PSF-001 | Initial Rendering    | Current settings are pre-filled in form                   | PASS   |
|                           | UNIT-FE-PG-PSF-002 | Save Operation       | onSave is called with modified content                    | PASS   |
|                           | UNIT-FE-PG-PSF-003 | Validation           | Save button is disabled when required fields are empty    | PASS   |
| **ProjectCreatePage**     | UNIT-FE-PG-PCP-001 | Initial Rendering    | Project name input field is displayed                     | PASS   |
|                           | UNIT-FE-PG-PCP-002 | Create Project       | API is called with input name, redirects after completion | PASS   |
| **ProjectManagementPage** | UNIT-FE-PG-PMP-001 | Initial Rendering    | Project list is fetched and displayed                     | PASS   |
|                           | UNIT-FE-PG-PMP-002 | Click Create New     | Redirects to create project page upon button click        | PASS   |
|                           | UNIT-FE-PG-PMP-003 | Open Project         | Redirects to project detail page upon Open button click   | PASS   |
| **GlobalSettingsPage**    | UNIT-FE-PG-GSP-001 | Initial Rendering    | Global settings are fetched and displayed                 | PASS   |
| **MenuBar**               | UNIT-FE-MNU-001    | Element Verification | Project selector, Undo/Redo buttons are displayed         | PASS   |
|                           | UNIT-FE-MNU-002    | Switch Project       | Switch API is called on selection change, triggers reload | PASS   |
|                           | UNIT-FE-MNU-003    | Execute Undo         | Undo API is called when Undo button is clicked            | PASS   |
|                           | UNIT-FE-MNU-004    | Execute Redo         | Redo API is called when Redo button is clicked            | PASS   |

### 2.4 Domain Services (Domain Layer)

| Service               | Test-ID               | Test Summary              | Expected Behavior                                                      | Result |
| :-------------------- | :-------------------- | :------------------------ | :--------------------------------------------------------------------- | :----- |
| **GanttChartService** | UNIT-FE-SVC-GANTT-001 | Parent Date Aggregation   | Returns DateRange with min start_date and max due_date of children     | PASS   |
|                       | UNIT-FE-SVC-GANTT-002 | Bar Position Calculation  | Returns correct left and width based on date difference × dayWidth     | PASS   |
|                       | UNIT-FE-SVC-GANTT-003 | Inazuma Line Calculation  | Returns correct polyline coordinate array based on progress rate       | PASS   |
|                       | UNIT-FE-SVC-GANTT-004 | Timeline Date Generation  | Returns array of consecutive date strings from start to end            | PASS   |
|                       | UNIT-FE-SVC-GANTT-005 | Task Hierarchy Flattening | Tasks sorted parent-first with correct depth values                    | PASS   |
|                       | UNIT-FE-SVC-GANTT-006 | Task Hierarchy Sorting    | Hierarchical tasks correctly sorted by display_order before flattening | PASS   |

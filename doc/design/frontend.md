# Frontend Design

## 1. Overview

This document is the Frontend Design for the "Local Project Management Tool".
It is implemented as a SPA (Single Page Application) using React + TypeScript, adopting a DDD (Domain-Driven Design)-like Layered Architecture.

## 2. General Strategy

### 2.1 Architecture

Following the rules in `coding.md`, the directory structure and responsibility separation are as follows:

```
frontend/src/
├── domain/                  # [Domain Layer] Business logic and type definitions
│   ├── entities/            # [Entity] Task, Settings, ProjectSettings, etc.
│   ├── repositories/        # [Repository Interface] ITaskRepository, ISettingsRepository
│   └── services/            # [Domain Service] (If necessary)
│
├── infrastructure/          # [Infrastructure Layer] External communication implementation
│   ├── api/                 # API Client
│   │   ├── client.ts        # fetch wrapper
│   │   └── repositories/    # Repository Implementation (TaskApiRepository, SettingsApiRepository)
│   └── dtos/                # API Response type definitions (Before conversion to Domain Entity)
│
├── application/             # [Application Layer] Use Cases (Custom Hooks)
│   └── usecases/            # useTaskUseCase, useSettingsUseCase
│
├── presentation/            # [Presentation Layer] UI Components
│   ├── components/          # Common UI Parts (Button, Input, Modal, etc.)
│   ├── styles/              # Global Styles (index.css)
│   └── pages/               # Page Components (Page/View)
│       ├── SettingsPage/
│       └── TaskListPage/
│
└── main.tsx                 # Entry Point
```

### 2.2 Tech Stack

- **Language**: TypeScript
- **Framework**: React (Vite)
- **Styling**: TailwindCSS (Standard compliance) or CSS Modules
- **State Management**: React Context + Custom Hooks (Local state uses useState)
- **Routing**: React Router (Recommended for scalability)
- **Other Libraries**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag and drop task reordering.

## 3. Component Design

### 3.1 Common Components (`presentation/components`)

- `Button`: Buttons (Primary, Secondary, Danger)
- `Input`: Text Input
- `Select`: Dropdown
- `Modal`: Generic Modal Dialog
- `Card`: Container with border

### 3.2 Settings Page (`presentation/pages/SettingsPage`)

Uses `SettingsUseCase` to fetch and update data.

- `SettingsPage`: Root component. Manages data loading and saving.
  - `ProjectSettingsForm`: Form for Project Name, Duration.
  - `BasicSettingsForm`: Form for Status definitions, Holidays (Read-only or simple edit).

### 3.3 Task List Page (`presentation/pages/TaskListPage`)

Uses `TaskUseCase` for task operations.

- `TaskListPage`: Root component.
  - `TaskToolbar`: New Task button, Filtering, View Switcher (List/Gantt).
  - `TaskListView`: Task list in table format. Supports drag and drop reordering using SortableContext.
    - `TaskRow`: Row for each task. Includes Edit/Delete actions.
  - `GanttChartView`: Display in Gantt Chart format. Supports drag and drop reordering.
    - `GanttBar`: Bar representing task duration.
  - `TaskDetailModal`: Modal for creating/editing tasks.
    - `TaskForm`: Input form for Title, Assignee, Duration, etc.

### 3.4 Common Layout (`presentation/components/Layout`)

- `AppLayout`: Wrapper component common to all screens.
- `MenuBar`: Header part. Includes logo, screen navigation links, project selection dropdown.
  - Navigation: "Task List", "Gantt Chart".
  - Project Selection: Displays project list fetched from API. Switches active project via `useProject` hook upon change.
  - Undo/Redo: Places "Undo" and "Redo" buttons to call API for reverting/redoing changes.

### 3.5 New Project Creation Page (`presentation/pages/ProjectCreatePage`)

Displayed when not initialized or when user selects "Create New Project".

- `ProjectCreatePage`: Provides project name input form.
  - `ProjectNameInput`: Input for project name.
  - `CreateButton`: Executes creation. Redirects to Task List on success.

### 3.6 Gantt Chart Page (`presentation/pages/GanttChartPage`)

Fetches task data via `TaskUseCase` and converts it to rendering data using `GanttChartService`.

- `GanttChartPage`: Root component. Manages task fetching, zoom control (dayWidth), Inazuma line toggle, and reference date selection.
  - `GanttChart`: Chart area. Renders task label column and timeline column side by side.
    - `TimelineHeader`: Date column header. Displays date labels according to zoom level.
    - `GanttBar`: Task bar for each task. Renders bar based on start_date to due_date. Parent tasks use a summary style (different color) encompassing child ranges. Includes progress rate visualization.
    - `InazumaLine`: Draws a polyline using SVG `<path>` based on progress rates. Red dashed line style. Visualizes progress status of each task at the reference date.

### 3.7 Domain Services (`domain/services`)

- `GanttChartService`: Provides calculation logic for Gantt chart rendering as pure functions.
  - `calculateParentDateRange(parentTask, childTasks)`: Aggregates parent task range to the min start_date and max due_date of its children.
  - `calculateBarPosition(startDate, dueDate, timelineStart, dayWidth)`: Calculates bar left/width in pixels.
  - `calculateInazumaLinePoints(tasks, referenceDate, timelineStart, dayWidth, rowHeight)`: Calculates Inazuma line polyline coordinates from each task's progress rate and the reference date.
  - `generateTimelineDates(start, end)`: Generates an array of dates for timeline display.
  - `flattenTasksWithHierarchy(tasks)`: Sorts tasks in display order considering parent-child relationships.

## 4. Data & State Management

### 4.1 Application State

Large-scale stores like Redux are not used. State returned by Custom Hooks (`useTaskUseCase`, etc.) such as `data`, `isLoading`, `error` is received by the page's root component and passed down to child components as Props.

### 4.2 API Integration (Infrastructure)

- **Repository Pattern**: Calls backend APIs using `fetch` or `axios` within `infrastructure/api/repositories`.
- **DTO -> Entity Conversion**: Converts API responses (JSON) into Domain Layer Entity classes/interfaces before returning to the Application Layer.

### 4.3 Initialization Flow & Routing

1.  Call `GET /system/status` at application startup (`App.tsx`) to check initialization status.
2.  If not initialized or default project is not set, redirect to `/create-project` (ProjectCreatePage).
3.  If initialized, transition to `/tasks` (TaskListPage).

## 5. Error Handling

- API errors are caught in `usecases` and notified to components as error state (`error: Error | null`).
- Notified to the user via `Toast` or error message display areas on the screen.

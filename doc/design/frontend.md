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
*   **Language**: TypeScript
*   **Framework**: React (Vite)
*   **Styling**: TailwindCSS (Standard compliance) or CSS Modules
*   **State Management**: React Context + Custom Hooks (Local state uses useState)
*   **Routing**: React Router (Recommended for scalability)

## 3. Component Design

### 3.1 Common Components (`presentation/components`)
*   `Button`: Buttons (Primary, Secondary, Danger)
*   `Input`: Text Input
*   `Select`: Dropdown
*   `Modal`: Generic Modal Dialog
*   `Card`: Container with border

### 3.2 Settings Page (`presentation/pages/SettingsPage`)
Uses `SettingsUseCase` to fetch and update data.
*   `SettingsPage`: Root component. Manages data loading and saving.
    *   `ProjectSettingsForm`: Form for Project Name, Duration.
    *   `BasicSettingsForm`: Form for Status definitions, Holidays (Read-only or simple edit).

### 3.3 Task List Page (`presentation/pages/TaskListPage`)
Uses `TaskUseCase` for task operations.
*   `TaskListPage`: Root component.
    *   `TaskToolbar`: New Task button, Filtering, View Switcher (List/Gantt).
    *   `TaskListView`: Task list in table format.
        *   `TaskRow`: Row for each task. Includes Edit/Delete actions.
    *   `GanttChartView`: Display in Gantt Chart format.
        *   `GanttBar`: Bar representing task duration.
    *   `TaskDetailModal`: Modal for creating/editing tasks.
        *   `TaskForm`: Input form for Title, Assignee, Duration, etc.

## 4. Data & State Management

### 4.1 Application State
Large-scale stores like Redux are not used. State returned by Custom Hooks (`useTaskUseCase`, etc.) such as `data`, `isLoading`, `error` is received by the page's root component and passed down to child components as Props.

### 4.2 API Integration (Infrastructure)
*   **Repository Pattern**: Calls backend APIs using `fetch` or `axios` within `infrastructure/api/repositories`.
*   **DTO -> Entity Conversion**: Converts API responses (JSON) into Domain Layer Entity classes/interfaces before returning to the Application Layer.

## 5. Error Handling
*   API errors are caught in `usecases` and notified to components as error state (`error: Error | null`).
*   Notified to the user via `Toast` or error message display areas on the screen.

# Frontend Design

## 1. Overview

This document is the Frontend Design for the "Local Project Management Tool".
It is implemented as an SPA (Single Page Application) using React + TypeScript, adopting a DDD (Domain-Driven Design)-like Layered Architecture.
As of the current version, the architecture has been entirely renewed to support multi-project environments and independent per-project Git repositories.

## 2. General Strategy

### 2.1 Architecture

Following the rules in `coding.md`, the directory structure and responsibility separation are as follows:

```
frontend/src/
├── domain/                  # [Domain Layer] Business logic and type definitions
│   ├── entities/            # [Entity] Task, Settings, ProjectSettings, etc.
│   ├── repositories/        # [Repository Interface] ITaskRepository, ISettingsRepository, IProjectRepository
│   └── services/            # [Domain Service] e.g. GanttChartService
│
├── infrastructure/          # [Infrastructure Layer] External communication implementation
│   ├── api/                 # API Client
│   │   ├── client.ts        # fetch wrapper
│   │   └── repositories/    # Repository implementations (TaskApiRepository, SettingsApiRepository, ProjectApiRepository)
│   └── dtos/                # API Response type definitions (Before conversion to Domain Entity)
│
├── application/             # [Application Layer] Use Cases (Custom Hooks)
│   ├── providers/           # DependencyProvider (DI Container)
│   └── usecases/            # useTaskUseCase, useSettingsUseCase, useProjectUseCase
│
├── presentation/            # [Presentation Layer] UI Components
│   ├── components/          # Common UI Parts (Button, Input, Modal, etc.)
│   ├── styles/              # Global Styles (index.css)
│   └── pages/               # Page Components (Page/View)
│       ├── GlobalSettingsPage/ # Global configuration page
│       ├── ProjectManagementPage/ # Project listing page
│       ├── ProjectCreatePage/     # New project creation page
│       ├── SettingsPage/          # Per-project settings page
│       ├── TaskListPage/          # Task list page
│       └── GanttChartPage/        # Gantt chart page
│
└── main.tsx                 # Entry Point
```

### 2.2 Tech Stack

- **Language**: TypeScript
- **Framework**: React (Vite)
- **UI Library**: Mantine (Theme-based UI creation)
- **Styling**: TailwindCSS (Utility First CSS)
- **State Management**: React Context + Custom Hooks (Local state uses `useState`)
- **Routing**: React Router (`react-router-dom`) for context-based URL manipulation
- **Other Libraries**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop task reordering.

## 3. Component Design

### 3.1 Common Layout (`presentation/components/Layout`)

Provides a layout corresponding to two distinct contexts (Global / Project).

- `App.tsx`: App Root. Routes betweeen `GlobalLayout` and `ProjectLayout` based on URL.
- `MenuBar`: Header portion. Receives a Context parameter to toggle available actions.
  - **Global Context**: Logo, 'Project Management' link, 'Basic Settings' link.
  - **Project Context**: Logo, 'Back to Projects' link, Task/Gantt/Project Settings links, Project switcher dropdown, Undo/Redo buttons.

### 3.2 Page Components (`presentation/pages`)

#### 3.2.1 Global Context

- `ProjectManagementPage`: Lists existing projects and provides navigation to the new project creation page. Uses `useProjectUseCase`.
- `GlobalSettingsPage`: Displays basic settings utilized across the entire application (e.g., standard work hours, core task statuses/types, holiday definitions). Uses `useSettingsUseCase`.
- `ProjectCreatePage`: Page for creating a new project. Submit project name to initialize a repository. Upon success, auto-navigates to the project screen.

#### 3.2.2 Project Context (`/projects/:projectName/*`)

Extracts the `projectName` URL path parameter to pass to use-cases for targeted data retrieval/updates.

- `TaskListPage`: Lists tasks. Uses `useTaskUseCase`.
  - Includes creation, inline-editing, and drag-and-drop item re-ordering.
  - `TaskDetailModal`: Modal form for comprehensive task edits.
- `GanttChartPage`: Renders a Gantt chart.
  - Depends on `GanttChartService` to calculate geometries for dependencies and the progress 'Inazuma' polyline.
  - Toggles zoom levels and allows drag-and-drop vertical repositioning.
- `SettingsPage`: Settings scoped down to a single project.
  - `ProjectSettingsForm`: For modifications strictly isolated to the project itself (name or setting overrides).
  - Also displays global basic settings in a read-only informational context.

## 4. Data & State Management

### 4.1 Application State

Does not utilize monolithic global stores (e.g., Redux). Uses a Dependency Injection (DI) container pattern (`DependencyProvider`). Repositories are injected into Custom Hooks (`useTaskUseCase`, `useProjectUseCase`, etc.). These hooks manage states like `data`, `isLoading`, and `error`. Top-level page components subscribe to these updates and push data down as React Props (minimizing unnecessary prop-drilling).

### 4.2 API Integration (Infrastructure)

- **Repository Pattern**: Repositories defined in `infrastructure/api/repositories` (`ProjectApiRepository`, `TaskApiRepository`, `SettingsApiRepository`) use `ApiClient` under the hood.
- All mutating or fetching operations inside a project require the `projectName` in the URL (e.g., `GET /api/v1/projects/:projectName/tasks`).
- Data passes from API JSON representations into DTOs, then resolves as strongly typed Domain Entities within the Application Layer.

### 4.3 Initialization Flow & Routing

React Router is defined as follows:

1. `/*`: Handled by `GlobalLayout`
   - `/projects` -> `ProjectManagementPage`
   - `/projects/new` -> `ProjectCreatePage`
   - `/settings` -> `GlobalSettingsPage`
   - `/` -> Redirects to `/projects`
2. `/projects/:projectName/*`: Handled by `ProjectLayout`
   - `/` -> `TaskListPage`
   - `/gantts` -> `GanttChartPage`
   - `/settings` -> `SettingsPage`

## 5. Error Handling

- API invocation failures are immediately caught inside `usecases`. The failure is preserved in the local `error: Error | null` state object.
- At the UI level, the corresponding views present these errors within designated notification wrappers or form-error highlights.
- For interactive tasks like project creation, errors bubble up to immediately display inline alongside the submit action.

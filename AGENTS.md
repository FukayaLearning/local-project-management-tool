# AGENTS.md (Handover Document)

This document provides essential context for AI agents working on this project. Use this to quickly catch up on the project state and rules.

## Project Overview

- **Name**: Local Project Management Tool
- **Concept**: Offline-first project management using local file systems (JSON/CSV) and Git for history management.
- **Core Features**:
  - Project/Task settings (JSON)
  - Task management (CSV, UUID v4)
  - Git integration: Auto-commit on change, Startup/Runtime manual change detection.
  - History management: Undo/Redo via Git restore.
  - Visualisation: Gantt chart and Inazuma line (Planned).

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS (DDD Layered Architecture)
- **Backend**: Python 3.12+, FastAPI, Pandas (DDD Layered Architecture)
- **Infrastructure**: Docker (Frontend, Backend, Nginx)
- **Database**: None (JSON/CSV files in `data/` directory)
- **Version Control**: Git (both for source code and task data persistence)

## Design & Rules

Strictly follow the rules defined in `.gemini/antigravity/memory/`:

- `coding.md`: DDD layers (Presentation, Application, Domain, Infrastructure).
- `documents.md`: Documentation structure and dual-language (EN/JP) requirement.
- `processes.md`: Sequential development process (Requirement -> Design -> Implementation -> Test).
- `test.md`: Testing rules (Vitest for FE, Pytest for BE). Use scripts for execution.
- `htmlpage.md`: UI previews in Markdown must be embedded HTML fragments.

## Current Status (As of 2026-02-21)

- [x] Basic Settings & Project Management
- [x] Task CRUD (CSV storage)
- [x] Git Core Integration (Auto-commit, Branch switching)
- [x] Undo/Redo Functionality
- [/] Initialisation Flow (System Status check)
- [ ] Gantt Chart Logic (Planned)
- [ ] Inazuma Line Logic (Planned)

## Critical Files

- `backend/app/main.py`: Entry point and DI configuration.
- `frontend/src/main.tsx`: Entry point.
- `doc/design/requirement.ja.md`: Source of truth for functional requirements.
- `doc/design/traceability_matrix.md`: Tracking implementation progress.

## Common Workflows

- Use `/check-traceability` to verify document consistency.
- Use `/do-remain-process` when continuing from a specific development step.
- Use `doc/test/integration/scripts/` to run E2E scenarios.

## Development Procedures

All build, test, and demo procedures MUST be executed via the provided scripts to ensure consistency (as per project rules).

### Build Confirmation (Production-equivalent)

Confirmed as the production build using the root script.

- **Run**: `./build.sh`

### Production Execution

Starts the application in production mode using the root script.

- **Run**: `./run.sh`
- **Auto-start (WSL)**: `./run.sh --autostart` (Adds entry to `~ ~/.bashrc`)
- **Access**: `http://localhost:8080` (via Nginx proxy)

### Production Stop

Stops the application in production mode using the root script.

- **Run**: `./stop.sh`

### Unit Test

These scripts perform build confirmation (unit test environment) and run unit tests.

- **Backend Unit Test**: `./doc/test/unit/run_backend_unit_test.sh`
- **Frontend Unit Test**: `./doc/test/unit/run_frontend_unit_test.sh`

### Integration Test

Runs the full stack in production mode and executes E2E scenarios.

- **Run**: `./doc/test/integration/run_integration_test.sh`

### Application Demo (Demo/Debug Mode)

Starts the application in development mode, cleans data, and runs integration tests with visible feedback.

- **Run**: `./doc/test/integration/run_integration_test.sh --demo`

### Evidence & Debugging

Execution logs and results are saved in the respective `result/` directories under `doc/test/`. Use these for debugging failures:

- **Integration Tests (`doc/test/integration/result/`)**:
  - `result_TIMESTAMP.log`: Output of the Playwright test runner.
  - `backend.log`: Logs from the backend container (useful for inspecting API errors).
  - `frontend.log`: Logs from the frontend container.
  - `test-results/`: Playwright traces and screenshots of failed tests.
- **Unit Tests (`doc/test/unit/result/`)**:
  - `backend/result_TIMESTAMP.log`: Pytest execution details.
  - `frontend/result_TIMESTAMP.log`: Vitest execution details.
  - `*/coverage/index.html`: Code coverage reports (visualise using a browser).

**Debugging Checklist**:

1. Check `result_TIMESTAMP.log` for the specific failed assertion.
2. Review `backend.log` for any tracebacks or 500/400 errors during the test.
3. If integration test fails visually, check `test-results/` for screenshots.

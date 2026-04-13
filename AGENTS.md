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
  - Visualisation: Gantt chart and Inazuma line.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Vanilla CSS (DDD Layered Architecture)
- **Backend**: Python 3.12+, FastAPI, Pandas (DDD Layered Architecture)
- **Infrastructure**: Docker (Frontend, Backend, Nginx)
- **Database**: None (JSON/CSV files in `data/` directory)
- **Version Control**: Git (both for source code and task data persistence)

## Project Rules & Architecture

Strictly follow the rules defined in `.gemini/antigravity/memory/` and `SKILL.md` (if used):

- **Coding (coding.md)**:
  - DDD Layered Architecture: Presentation, Application, Domain, Infrastructure.
  - Presentation converts to Domain entities; Application/Infrastructure depend on Domain.
  - Dependency Injection (DI) is mandatory at the top level.
- **Documentation (documents.md)**:
  - Always maintain English (`.md`) and Japanese (`.ja.md`) pairs.
  - Specific file tree structure in `doc/` (Requirement, System Design, Traceability Matrix, etc.).
- **Development Process (processes.md)**:
  - Mandatory 21-step flow starting from Requirement Definition to README update.
- **Testing (test.md)**:
  - All procedures MUST use scripts (`build.sh`, `run.sh`, `stop.sh`).
  - Unit tests: Branch coverage 80%+, Mock infrastructure.
  - Integration tests: Scenario-based E2E using Playwright.
  - Evidence (logs/outputs) MUST be stored in `result/` directories.
- **UI Design (htmlpage.md)**:
  - UI previews in Markdown must be embedded HTML fragments (not images).

## Available Skills

Use these skills to perform complex tasks:

- `backend-unit-test`: Run backend unit tests and assist in debugging.
- `demo`: Run the integration test script in demo mode (interactive browser).
- `frontend-unit-test`: Run frontend unit tests and assist in debugging.
- `integration-test`: Execute full-stack integration tests and scenarios.
- `run`: Start the project in the appropriate environment.
- `stop`: Stop the running project containers.

## Workflows (Slash Commands)

- `/check-traceability`: Verify consistency between requirements, design, implementation, and tests.
- `/debug`: Identify the root cause of bugs or failing tests.
- `/do-remain-process`: Continue development from the current phase following the process flow.
- `/reverse-engineering`: Excavate documentation from source code and existing tests.
- `/review`: Review documents and code for compliance with project rules.
- `/sync-documents`: Synchronize English and Japanese documentation pairs.

## Current Status (As of 2026-03-19)

- [x] Basic Settings & Project Management
- [x] Task CRUD (CSV storage)
- [x] Git Core Integration (Auto-commit, Branch switching)
- [x] Undo/Redo Functionality
- [x] Initialisation Flow (System Status check)
- [x] Gantt Chart Feature
- [ ] Inazuma Line Logic (Planned)

## Critical Files

- `backend/app/main.py`: Entry point and DI configuration.
- `frontend/src/main.tsx`: Frontend entry point.
- `doc/design/requirement.ja.md`: Functional requirements (Japanese).
- `doc/design/traceability_matrix.md`: Core traceability mapping.

## Common Workflows

- Use `doc/test/integration/scripts/` to run or define E2E scenarios.
- Check `result/` directories for test evidence and logs.

## Development Procedures

All build, test, and demo procedures MUST be executed via the provided scripts.

- **Build**: `./build.sh`
- **Run**: `./run.sh` (or `./run.sh --autostart`)
- **Stop**: `./stop.sh`
- **Backend Unit Test**: `./doc/test/unit/run_backend_unit_test.sh`
- **Frontend Unit Test**: `./doc/test/unit/run_frontend_unit_test.sh`
- **Integration Test**: `./doc/test/integration/run_integration_test.sh`
- **Demo Mode**: `./doc/test/integration/run_integration_test.sh --demo`

## Evidence & Debugging

Logs are saved in `doc/test/*/result/`.

1. Check `result_TIMESTAMP.log` for failure details.
2. Review `backend.log` / `frontend.log` for container or API errors.
3. Check `test-results/` for screenshots/traces of UI failures.

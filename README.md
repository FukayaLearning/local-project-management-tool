# Local Project Management Tool

A local-first project management tool built with Python (FastAPI) and React.
It operates completely offline, managing settings in JSON and task data in CSV, without using a traditional RDBMS.
It utilizes Git as a backend storage mechanism to provide powerful history management (Undo/Redo).

## ✨ Features

- **Offline First**: No internet connection required. Runs entirely on your local machine.
- **File-Based**: Data is stored in human-readable JSON and CSV formats, managed by Git.
- **Powerful History**: Robust Undo/Redo functionality powered by Git integration.
- **Project Management**: Create and switch between multiple projects. Each project is managed as a separate Git repository within its own directory.
- **Gantt Chart**: Visualize task schedules with a Gantt chart. Parent tasks automatically aggregate child task date ranges.
- **Advanced Scheduling**: Supports automated scheduling based on resource constraints, including productivity ratios, intra-day task continuation, and gap-filling (dispatching lower priority tasks during high priority task wait times).
- **Progress Tracking**: Includes an Inazuma (progress) line to compare actual progress against the plan based on status and progress rates.
- **Smart Initialization**: Automatically guides you to project creation on first launch.

## 📂 Directory Structure

```text
.
├── backend/            # Python (FastAPI) Application
│   ├── app/            # Application Logic
│   └── data/           # Global Settings and All Projects Data
│       ├── setting.json # Global settings (not tracked by Git)
│       ├── ProjectA/   # Project-specific directory
│       │   ├── .git/   # Independent Git repository for the project
│       │   ├── setting.json # Project settings (tracked by Git)
│       │   └── tasks.csv    # Task data (tracked by Git)
│       └── ProjectB/   # Another project
├── frontend/           # React Application
├── doc/                # Documentation
└── docker-compose.yml  # Docker Composition
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose (Recommended)
- Or: Python 3.12+, Node.js 20+, Git

### Recommended Scripts (Docker)

We provide scripts for easy building, running, and stopping the project.

1.  **Build**

    ```bash
    ./build.sh
    ```

2.  **Run**

    ```bash
    ./run.sh
    ```

    - Access the application at `http://localhost:8080` (via Nginx proxy).
    - **Autostart**: Running `./run.sh --autostart` enables Docker's `restart: always` policy, allowing the application to start automatically with your PC or Docker Desktop.

3.  **Stop**
    ```bash
    ./stop.sh
    ```

### Direct Docker Compose Usage

1.  **Start the application**

    ```bash
    docker compose up -d --build
    ```

2.  **Access**
    - [http://localhost:8080](http://localhost:8080) (via Nginx proxy)
    - Frontend (Dev version): [http://localhost:3000](http://localhost:3000)
    - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

3.  **Stop**
    ```bash
    docker compose down
    ```

### Manual Setup (Development)

See `README.ja.md` for detailed manual setup instructions.

### Backend Unit Tests

Runs build confirmation and tests together, generating a coverage report.

```bash
./doc/test/unit/run_backend_unit_test.sh
```

### Frontend Unit Tests

Runs build confirmation and tests together.

```bash
./doc/test/unit/run_frontend_unit_test.sh
```

### Integration Tests (E2E)

Starts the full stack in production mode and runs scenario-based tests using Playwright.

```bash
./doc/test/integration/run_integration_test.sh
```

### Application Demo (Debug Mode)

Starts the application in development mode, initializes data, and runs integration tests for demonstration.

```bash
./doc/test/integration/run_integration_test.sh --demo
```

### Reviewing Test Results

Logs, screenshots, and coverage reports are saved in the `doc/test/*/result/` directories.

## 🛠 Tech Stack

- **Backend**: Python (FastAPI), Pandas
- **Frontend**: React + TypeScript (Vite), Mantine
- **Storage**: Local Files (JSON/CSV)
- **Version Control**: Git

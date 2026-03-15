# Local Project Management Tool

A local-first project management tool built with Python (FastAPI) and React.
It operates completely offline, managing settings in JSON and task data in CSV, without using a traditional RDBMS.
It utilizes Git as a backend storage mechanism to provide powerful history management (Undo/Redo).

## ✨ Features

- **Offline First**: No internet connection required. Runs entirely on your local machine.
- **File-Based**: Data is stored in human-readable JSON and CSV formats, managed by Git.
- **Powerful History**: Robust Undo/Redo functionality powered by Git integration.
- **Project Management**: Create and switch between multiple projects. Each project is managed as a separate Git branch.
- **Smart Initialization**: Automatically guides you to project creation on first launch.

## 📂 Directory Structure

```text
.
├── backend/            # Python (FastAPI) Application
│   ├── app/            # Application Logic
│   └── data/           # User Data (JSON/CSV) - .gitignored
├── frontend/           # React Application
├── doc/                # Documentation
└── docker-compose.yml  # Docker Composition
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose (Recommended)
- Or: Python 3.12+, Node.js 20+, Git

### Docker (Recommended)

1.  **Start the application**

    ```bash
    docker compose up -d --build
    ```

2.  **Access**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

3.  **Stop**
    ```bash
    docker compose down
    ```

### Manual Setup (Development)

See `README.ja.md` for detailed manual setup instructions.

## 🧪 Testing

### Frontend Unit Tests

```bash
docker compose exec frontend npm test
```

### Frontend Integration Tests

Tests checking the interaction between Frontend and Backend (running in Docker Container).

```bash
docker compose exec frontend npm run test:integration
```

### Backend Unit Tests

```bash
docker compose exec backend pytest
```

## 🛠 Tech Stack

- **Backend**: Python (FastAPI), Pandas
- **Frontend**: React + TypeScript (Vite), Mantine
- **Storage**: Local Files (JSON/CSV)
- **Version Control**: Git

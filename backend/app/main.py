from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .presentation.api.v1.endpoints import projects, tasks, system
from .application.usecases.system_usecase import SystemUseCase
from .infrastructure.git.git_service import GitService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時の処理
    from .infrastructure.file_system.settings_repository import SettingsFileRepository
    git_service = GitService()
    settings_repo = SettingsFileRepository()
    system_usecase = SystemUseCase(git_service, settings_repo)
    system_usecase.initialize_system()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(system.router, prefix="/api/v1/system", tags=["system"])


@app.get("/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

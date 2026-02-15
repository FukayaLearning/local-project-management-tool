from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .presentation.api.v1.endpoints import projects, tasks

app = FastAPI()

origins = [
    "http://localhost:3000", # Dev
    "http://localhost:5173", # Vite Dev
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

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

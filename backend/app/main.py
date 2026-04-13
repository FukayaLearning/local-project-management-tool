from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .presentation.api.v1.endpoints import projects, tasks, settings
from .container import Container


container = Container()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


import os
import json
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_debug")

class DebugMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if os.getenv("ENV_DEBUG") != "true":
            return await call_next(request)

        # Log Request
        body = await request.body()
        logger.info(f"--- DEBUG REQUEST ---")
        logger.info(f"Method: {request.method}")
        logger.info(f"URL: {request.url}")
        logger.info(f"Headers: {request.headers}")
        if body:
            try:
                logger.info(f"Body: {json.loads(body)}")
            except:
                logger.info(f"Body: {body.decode('utf-8', errors='replace')}")

        response = await call_next(request)

        # Log Response (Limited as reading streaming response is tricky in BaseHTTPMiddleware)
        # Note: In a real world, you might want to wrap the response body.
        logger.info(f"--- DEBUG RESPONSE ---")
        logger.info(f"Status: {response.status_code}")
        return response

app = FastAPI(lifespan=lifespan)
app.add_middleware(DebugMiddleware)

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

app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/projects", tags=["tasks"])


@app.get("/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Base stage
FROM python:3.12-slim AS base
WORKDIR /workspace

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git config --global --add safe.directory /workspace/backend/data
RUN git config --global user.name "System" && \
    git config --global user.email "system@example.com"

# Copy requirements first for caching
COPY requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the application
COPY . ./backend

# Set PYTHONPATH to include the workspace root
ENV PYTHONPATH=/workspace

# Development stage
FROM base AS dev
# Run uvicorn pointing to the backend module
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base AS prod
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

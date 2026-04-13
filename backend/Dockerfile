# Base stage for common OS dependencies
FROM python:3.12-slim AS base
WORKDIR /workspace/backend

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git config --global --add safe.directory '*'
RUN git config --global user.name "System" && \
    git config --global user.email "system@example.com"

# Builder stage to install production dependencies
FROM base AS builder
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Test stage: Includes all source code and dev dependencies
FROM builder AS test
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY . .
# Set PYTHONPATH so tests can find the backend package
ENV PYTHONPATH=/workspace
CMD ["pytest"]

# Production stage: Minimal image with only necessary app code
FROM builder AS prod
# Copy only the application code, excluding tests
COPY app/ ./app/
ENV PYTHONPATH=/workspace
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Development stage: For local development with reload
FROM test AS dev
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

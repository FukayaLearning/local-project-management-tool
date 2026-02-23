#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULT_DIR="${SCRIPT_DIR}/result/backend"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Backend Unit Tests (Dockerized)..."

cd "${REPO_ROOT}"
# Clean previous results
docker compose -f docker-compose.yaml down backend
docker run --rm -v "${RESULT_DIR}:/workspace/backend/test-results" alpine sh -c "rm -rf /workspace/backend/test-results/coverage /workspace/backend/test-results/*.log"
docker run --rm -v "${REPO_ROOT}/backend/data:/data" alpine sh -c "rm -rf /data/* /data/.* 2>/dev/null || true"
rm -rf "${RESULT_DIR}"
mkdir -p "${RESULT_DIR}"

# Step 7: Backend Build Confirmation
echo "Step 7: Building backend image..."
docker compose -f docker-compose.yaml build --progress=plain backend

# Step 10: Backend Unit Test Execution
echo "Step 10: Running backend unit tests in container..."
# We mount the result directory to capture the coverage report
    docker compose -f docker-compose.yaml run -T --rm \
        -v "${RESULT_DIR}:/workspace/backend/test-results" \
        -e PYTHONPATH=/workspace \
        backend \
    pytest tests/unit -v --cov=backend.app --cov-report=term --cov-report=html:/workspace/backend/test-results/coverage > "${LOG_FILE}" 2>&1

docker compose -f docker-compose.yaml down backend
echo "Backend unit tests COMPLETED. Evidence saved to ${RESULT_DIR}"

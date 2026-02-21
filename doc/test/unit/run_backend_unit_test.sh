#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULT_DIR="${SCRIPT_DIR}/result/backend"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Clean previous results
rm -rf "${RESULT_DIR}"
mkdir -p "${RESULT_DIR}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Backend Unit Tests (Dockerized)..."

cd "${REPO_ROOT}"

# Step 7: Backend Build Confirmation
echo "Step 7: Building backend image..."
docker compose -f docker-compose.yaml build backend

# Step 10: Backend Unit Test Execution
echo "Step 10: Running backend unit tests in container..."
# We mount the result directory to capture the coverage report
docker compose -f docker-compose.yaml run --rm \
    -v "${RESULT_DIR}:/workspace/backend/test-results" \
    -e PYTHONPATH=/workspace \
    backend \
    pytest backend/tests/unit -v --cov=backend.app --cov-report=html:/workspace/backend/test-results/coverage 2>&1 | tee "${LOG_FILE}"

echo "Backend unit tests completed. Evidence saved to ${RESULT_DIR}"

#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULT_DIR="${SCRIPT_DIR}/result/frontend"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Clean previous results
rm -rf "${RESULT_DIR}"
mkdir -p "${RESULT_DIR}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Frontend Unit Tests (Dockerized)..."

cd "${REPO_ROOT}"

# Step 13: Frontend Build Confirmation
echo "Step 13: Building frontend image..."
docker compose -f docker-compose.yaml build --progress=plain frontend

# Step 16: Frontend Unit Test Execution
echo "Step 16: Running frontend unit tests in container..."
# We run vitest inside the container. 
# Note: Since volumes are removed for app code, the container uses the code copied during build.
docker compose -f docker-compose.yaml run --rm \
    -v "${RESULT_DIR}:/app/test-results" \
    frontend \
    npm run test -- --run --coverage --coverage.reportsDirectory=/app/test-results/coverage > "${LOG_FILE}" 2>&1

echo "Frontend unit tests COMPLETED. Evidence saved to ${RESULT_DIR}"

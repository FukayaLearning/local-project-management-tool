#!/bin/bash
set -e

# Default values
DEMO_MODE="false"
TEST_FILES=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --demo) DEMO_MODE="true" ;;
        --run) shift; TEST_FILES="$1" ;; # Optional: specific test file
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Determine directories
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULT_DIR="${SCRIPT_DIR}/result"
mkdir -p "${RESULT_DIR}"
# Clean up previous results
rm -rf "${RESULT_DIR:?}"/*


TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Playwright Integration Tests..."
echo "Demo Mode: ${DEMO_MODE}"
echo "Log File: ${LOG_FILE}"

export DEMO_MODE="${DEMO_MODE}"


# Handle Docker Lifecycle
echo "Setting up environment..."

# Save current dir (repo/doc/test/integration)
# Root is 3 levels up
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"

if [ "$DEMO_MODE" == "true" ]; then
    echo "Running in DEBUG Mode (using docker-compose.yaml)..."
    cd "${REPO_ROOT}"
    # Ensure debug containers are up
    docker compose -f docker-compose.yaml up -d --build
    
    # Wait for services
    echo "Waiting for services to start..."
    sleep 10
else
    echo "Running in PRODUCTION Mode (using docker-compose.prod.yaml)..."
    cd "${REPO_ROOT}"
    # Clean volume for fresh install test (InitProject)
    docker compose -f docker-compose.prod.yaml down -v
    docker compose -f docker-compose.prod.yaml up -d --build

    echo "Waiting for services to start..."
    sleep 10
fi


# Config is in repo/doc/test/integration/scripts/playwright.config.ts
# Relative to frontend directory where we run npx
CONFIG_PATH="../doc/test/integration/scripts/playwright.config.ts"

# Run playwright
cd "${FRONTEND_DIR}"
echo "Running in: $(pwd)"
echo "Running: npx playwright test -c ${CONFIG_PATH} ${TEST_FILES}"
npx playwright test -c "${CONFIG_PATH}" ${TEST_FILES} 2>&1 | tee "${LOG_FILE}"

EXIT_CODE=$?

# Cleanup
if [ "$DEMO_MODE" != "true" ]; then
    echo "Cleaning up Production Environment..."
    cd "${REPO_ROOT}"
    docker compose -f docker-compose.prod.yaml down -v
fi


EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "Tests PASSED"
else
    echo "Tests FAILED"
fi

exit $EXIT_CODE

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

RESULT_DIR="/doc/test/integration/result"
CONTAINER_RESULT_DIR="/app/integration_results"
mkdir -p ".${RESULT_DIR}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE=".${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Integration Tests..."
echo "Demo Mode: ${DEMO_MODE}"
echo "Log File: .${RESULT_DIR}/result_${TIMESTAMP}.log"

# Construct vitest command
# We use 'test:integration' from package.json but we need to inject DEMO_MODE.
# Since npm script is fixed, we can just run vitest directly or pass env var to npm.
# But 'npm run test:integration' has VITE_API_BASE_URL embedded.
# We will use cross-env or just inject env var in docker exec.

# If TEST_FILES is empty, run all in scripts dir (mapped path)
if [ -z "$TEST_FILES" ]; then
    TARGET_FILES="--dir /app/integration_tests"
else
    # Assuming relative path from project root or absolute path
    TARGET_FILES="$TEST_FILES"
fi

# Run test in docker
# Note: Source files are in doc/test/integration/scripts, but mapped to container?
# Container mounts ./frontend:/app. doc/ is in ../doc relative to frontend.
# We need to make sure doc/ is accessible in container.
# docker-compose.yml check needed.

# Currently docker-compose mounts ./frontend:/app.
# doc/ is at ./doc (sibling to frontend).
# So doc/ is NOT accessible inside 'frontend' container by default!

# CRITICAL FIX: We need to mount doc/ directory to frontend container or move scripts back to frontend/src temporarily?
# Or just update docker-compose.yaml to mount root or doc?
# If we update docker-compose.yaml, we need to restart container.

# Check if /app/doc/test exists in container (it won't).
# So we need to modify docker-compose.yaml to mount ./doc:/app/doc or similar.
echo "Checking docker mounts..."
# (Logic to be implemented in agent step, not this script yet)

# For now, assuming environment is set up:
docker compose exec -e DEMO_MODE="${DEMO_MODE}" frontend npm run test:integration -- ${TARGET_FILES} 2>&1 | tee "${LOG_FILE}"

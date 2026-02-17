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

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Playwright Integration Tests..."
echo "Demo Mode: ${DEMO_MODE}"
echo "Log File: ${LOG_FILE}"

export DEMO_MODE="${DEMO_MODE}"

# Run from frontend directory (repo root/frontend)
# Navigate to script dir first, then relative to frontend
cd "${SCRIPT_DIR}/../../../frontend"

# Config is in repo/doc/test/integration/scripts/playwright.config.ts
CONFIG_PATH="../doc/test/integration/scripts/playwright.config.ts"

# Run playwright
echo "Running: npx playwright test -c ${CONFIG_PATH} ${TEST_FILES}"
npx playwright test -c "${CONFIG_PATH}" ${TEST_FILES} 2>&1 | tee "${LOG_FILE}"

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "Tests PASSED"
else
    echo "Tests FAILED"
fi

exit $EXIT_CODE

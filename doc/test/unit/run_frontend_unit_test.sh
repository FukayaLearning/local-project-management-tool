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

echo "Starting Frontend Unit Tests..."

cd "${REPO_ROOT}/frontend"

# Ensure dependencies are installed
npm install --quiet --no-progress

# Run vitest
echo "Running vitest..."
npx vitest run --coverage 2>&1 | tee "${LOG_FILE}"

# move coverage report
if [ -d "coverage" ]; then
    mv coverage "${RESULT_DIR}/coverage"
fi

echo "Frontend unit tests completed. Evidence saved to ${RESULT_DIR}"

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

echo "Starting Backend Unit Tests..."

cd "${REPO_ROOT}/backend"

# Ensure python venv
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install --quiet -r requirements.txt pytest pytest-cov httpx

# Run pytest with coverage. Use PYTHONUNBUFFERED=1 to prevent buffering when piping to tee.
echo "Running pytest..."
export PYTHONPATH="${REPO_ROOT}"
export PYTHONUNBUFFERED=1
pytest tests/ -v --cov=app --cov-report=html:"${RESULT_DIR}/coverage" 2>&1 | tee "${LOG_FILE}"

echo "Backend unit tests completed. Evidence saved to ${RESULT_DIR}"

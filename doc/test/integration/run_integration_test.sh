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
docker run --rm -v "${RESULT_DIR}:/result" alpine sh -c "rm -rf /result/*"


TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULT_DIR}/result_${TIMESTAMP}.log"

echo "Starting Playwright Integration Tests..."
echo "Demo Mode: ${DEMO_MODE}"
echo "Log File: ${LOG_FILE}"

export DEMO_MODE="${DEMO_MODE}"




# Handle Docker Lifecycle
echo "Setting up environment..."

# Save current dir (repo/doc/test/integration)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Root is 3 levels up
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
export REPO_ROOT
FRONTEND_DIR="${REPO_ROOT}/frontend"
TEST_DIR="${SCRIPT_DIR}"
export E2E_DIR="${SCRIPT_DIR}"

# Function to stop containers on exit
cleanup() {
    echo "Cleaning up..."
    if [ ! -z "$BROWSER_PID" ]; then
        echo "Stopping Host Browser Server (PID: $BROWSER_PID)..."
        kill $BROWSER_PID
    fi
    
    cd "${REPO_ROOT}"
    echo "Saving container logs..."
    if [ "$DEMO_MODE" == "true" ]; then
        docker compose -f docker-compose.yaml logs backend > "${RESULT_DIR}/backend.log" 2>&1 || true
        docker compose -f docker-compose.yaml logs frontend > "${RESULT_DIR}/frontend.log" 2>&1 || true
        # In demo mode, we might leave app running
        :
    else
        docker compose -f docker-compose.prod.yaml logs backend > "${RESULT_DIR}/backend.log" 2>&1 || true
        docker compose -f docker-compose.prod.yaml logs frontend > "${RESULT_DIR}/frontend.log" 2>&1 || true
        # Prod mode cleanup
        docker compose -f docker-compose.prod.yaml down -v
    fi
}
trap cleanup EXIT

if [ "$DEMO_MODE" == "true" ]; then
    echo "Running in DEMO (DEBUG) Mode..."
    
    # 1. Start App (Debug/Dev mode)
    cd "${REPO_ROOT}"
    # Ensure clean state
    docker compose -f docker-compose.yaml down -v --remove-orphans
    echo "Cleaning up backend data..."
    rm -rf "${REPO_ROOT}/backend/data/"* "${REPO_ROOT}/backend/data/".git* || true
    docker compose -f docker-compose.yaml up -d --build
    
    echo "Waiting for App services to start..."
    sleep 10
    
    # 2. Start Host Browser Server
    echo "Starting Host Playwright Browser Server..."
    
    # Install dependencies on host if needed (in doc/test/integration)
    cd "${TEST_DIR}"
    if [ ! -d "node_modules" ]; then
        echo "Installing integration test dependencies on Host..."
        npm install --quiet --no-progress 2>&1 | tee -a "${LOG_FILE}"
    fi
    npx playwright install chromium

    # We need to run the node script and capture output line by line to find WS Endpoint
    # We use a temp file to store the WS Endpoint
    WS_FILE=$(mktemp)
    node "${TEST_DIR}/launch_browser_server.js" > "$WS_FILE" 2>&1 &
    BROWSER_PID=$!
    
    echo "Waiting for Browser Server to initialize..."
    # Loop to read file until we find ws://
    MAX_RETRIES=30
    WS_ENDPOINT=""
    for i in $(seq 1 $MAX_RETRIES); do
        if grep -q "ws://" "$WS_FILE"; then
            WS_ENDPOINT=$(grep -o "ws://.*" "$WS_FILE")
            break
        fi
        sleep 1
    done
    
    if [ -z "$WS_ENDPOINT" ]; then
        echo "Failed to start Host Browser Server. Output:"
        cat "$WS_FILE"
        rm "$WS_FILE"
        exit 1
    fi
    echo "Host Browser Server listening at: $WS_ENDPOINT"
    rm "$WS_FILE"
    
    # 3. Run Tests in Container, Connected to Host
    echo "Running Tests in Container (Connected to Host)..."
    cd "${REPO_ROOT}"
    # Use -f to combine compose files. 
    docker compose -f docker-compose.yaml -f doc/test/integration/docker-compose.e2e.yaml -f doc/test/integration/docker-compose.e2e.demo.yaml run --rm --build \
        -e PLAYWRIGHT_WS_ENDPOINT="$WS_ENDPOINT" \
        -e BASE_URL=http://proxy \
        e2e-tests npx playwright test -c scripts/playwright.config.ts $TEST_FILES 2>&1 | tee -a "${LOG_FILE}"
        
else
    echo "Running in PRODUCTION Mode (Headless Container)..."
    cd "${REPO_ROOT}"
    
    # 1. Clean & Start App (Prod mode)
    docker compose -f docker-compose.prod.yaml down -v
    echo "Cleaning up backend data..."
    rm -rf "${REPO_ROOT}/backend/data/"* "${REPO_ROOT}/backend/data/".git* || true
    docker compose -f docker-compose.prod.yaml up -d --build
    
    echo "Waiting for App services to start..."
    sleep 10
    
    # 2. Run Tests in Container (Headless)
    echo "Running Tests in Container (Self-contained)..."
    # Compose prod and e2e files. 
    docker compose -f docker-compose.prod.yaml -f doc/test/integration/docker-compose.e2e.yaml run --rm --build \
        -e BASE_URL=http://frontend \
        e2e-tests npx playwright test -c scripts/playwright.config.ts $TEST_FILES 2>&1 | tee "${LOG_FILE}"
fi

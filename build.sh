#!/bin/bash
set -e

# This script performs a production-equivalent build of the entire stack.
# It is used for build confirmation (as per project rules) and integration testing.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"

echo "Starting Production Build Confirmation..."

cd "${REPO_ROOT}"

# Build all services using the production compose file
docker compose -f docker-compose.prod.yaml build

echo "Build confirmation COMPLETED."

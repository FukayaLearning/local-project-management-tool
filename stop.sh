#!/bin/bash
set -e

# This script stops the production environment using the production compose file.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"

echo "Stopping Application (PRODUCTION mode)..."

cd "${REPO_ROOT}"

# Stop services
docker compose -f docker-compose.prod.yaml down "$@"

echo "Application stopped."

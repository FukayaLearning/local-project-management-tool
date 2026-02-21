#!/bin/bash
set -e

# This script runs the application in production mode.
# Options:
#   --autostart : Enable Docker 'restart: always' policy.
#                 The application will start automatically with Docker/OS boot.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
AUTOSTART_FLAG="false"

for arg in "$@"; do
  if [ "$arg" == "--autostart" ]; then
    AUTOSTART_FLAG="true"
  fi
done

COMPOSE_FILES="-f docker-compose.prod.yaml"

if [ "$AUTOSTART_FLAG" == "true" ]; then
  echo "Enabling Docker 'restart: always' policy..."
  COMPOSE_FILES="${COMPOSE_FILES} -f docker-compose.autostart.yaml"
fi

echo "Starting Application in PRODUCTION mode..."

cd "${REPO_ROOT}"
docker compose ${COMPOSE_FILES} up -d

echo "Application is running at http://localhost:8080"

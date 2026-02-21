#!/bin/bash
set -e

# This script runs the application in production mode.
# Options:
#   --autostart : Set up auto-start on WSL session start (adds to ~/.bashrc)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
AUTOSTART_FLAG="false"

for arg in "$@"; do
  if [ "$arg" == "--autostart" ]; then
    AUTOSTART_FLAG="true"
  fi
done

if [ "$AUTOSTART_FLAG" == "true" ]; then
  echo "Setting up WSL auto-start in ~/.bashrc..."
  BASHRC="${HOME}/.bashrc"
  LINE="[ -f \"${REPO_ROOT}/run.sh\" ] && \"${REPO_ROOT}/run.sh\""
  if grep -Fq "${REPO_ROOT}/run.sh" "${BASHRC}"; then
    echo "Auto-start already configured in ${BASHRC}."
  else
    echo -e "\n# Local Project Management Tool Auto-start\n${LINE}" >> "${BASHRC}"
    echo "Configuration added to ${BASHRC}."
  fi
fi

echo "Starting Application in PRODUCTION mode..."

cd "${REPO_ROOT}"
docker compose -f docker-compose.prod.yaml up -d

echo "Application is running at http://localhost:8080"

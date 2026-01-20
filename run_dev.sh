#!/usr/bin/env bash
# Robust dev launcher for backend + frontend (Linux/macOS/WSL/Git Bash).

set -euo pipefail

if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

usage() {
  cat <<'USAGE'
Usage: ./run_dev.sh [--dry-run] [--skip-migrations] [--force-install] [--same-window]

Options:
  --dry-run          Run bootstraps only (do not start servers).
  --skip-migrations  Skip backend Alembic migrations.
  --force-install    Force npm install (frontend) even if node_modules exists.
  --same-window      Run backend + frontend in the same terminal (default).
USAGE
}

log() {
  printf '%s\n' "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"

DRY_RUN=0
SKIP_MIGRATIONS=0
FORCE_INSTALL=0
SAME_WINDOW=1

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --skip-migrations) SKIP_MIGRATIONS=1 ;;
    --force-install) FORCE_INSTALL=1 ;;
    --same-window) SAME_WINDOW=1 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
  shift
done

export DRY_RUN SKIP_MIGRATIONS FORCE_INSTALL

if [ ! -f "${BACKEND_DIR}/run_local.sh" ]; then
  die "Missing backend/run_local.sh"
fi
if [ ! -f "${FRONTEND_DIR}/run_local.sh" ]; then
  die "Missing frontend/run_local.sh"
fi

ensure_env_files() {
  if [ ! -f "${BACKEND_DIR}/.env" ]; then
    if [ -f "${BACKEND_DIR}/.env.example" ]; then
      log "Backend .env not found. Creating from backend/.env.example..."
      cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
    elif [ -f "${BACKEND_DIR}/app/.env.example" ]; then
      log "Backend .env not found. Creating from backend/app/.env.example..."
      cp "${BACKEND_DIR}/app/.env.example" "${BACKEND_DIR}/.env"
    else
      log "Backend .env example not found. Creating empty backend/.env..."
      : > "${BACKEND_DIR}/.env"
    fi
  fi

  if [ ! -f "${FRONTEND_DIR}/.env.local" ]; then
    if [ -f "${FRONTEND_DIR}/.env.example" ]; then
      log "Frontend .env.local not found. Creating from frontend/.env.example..."
      cp "${FRONTEND_DIR}/.env.example" "${FRONTEND_DIR}/.env.local"
    else
      log "Frontend .env.example not found. Creating empty frontend/.env.local..."
      : > "${FRONTEND_DIR}/.env.local"
    fi
  fi
}

run_backend() {
  (cd "${BACKEND_DIR}" && bash ./run_local.sh)
}

run_frontend() {
  (cd "${FRONTEND_DIR}" && bash ./run_local.sh)
}

ensure_env_files
log "Environment files are ready."
log "run_dev.sh: launching (2026-01-19)"

if [ "${SAME_WINDOW}" = "1" ]; then
  run_backend &
  backend_pid=$!
  run_frontend &
  frontend_pid=$!

  cleanup() {
    log "Stopping servers..."
    kill "${backend_pid}" "${frontend_pid}" 2>/dev/null || true
  }
  trap cleanup EXIT

  wait "${backend_pid}" "${frontend_pid}"
else
  run_backend &
  run_frontend &
  wait
fi

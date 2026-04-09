#!/usr/bin/env bash

# Safer production startup flow for Render/Procfile environments.
# - Runs Alembic migrations by default.
# - Prints actionable Alembic diagnostics when migration fails.
# - Supports optional emergency bypass and optional auto-stamp recovery.

set -euo pipefail

log() {
  printf '[startup] %s\n' "$*"
}

RUN_DB_MIGRATIONS="${RUN_DB_MIGRATIONS:-1}"
ALLOW_START_WITH_MIGRATION_FAILURE="${ALLOW_START_WITH_MIGRATION_FAILURE:-0}"
ALEMBIC_AUTO_STAMP_ON_MISSING_REVISION="${ALEMBIC_AUTO_STAMP_ON_MISSING_REVISION:-0}"
DRY_RUN="${DRY_RUN:-0}"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

PYTHON_BIN="${PYTHON_BIN:-python}"
if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN=".venv/bin/python"
elif [[ -x ".venv/Scripts/python.exe" ]]; then
  PYTHON_BIN=".venv/Scripts/python.exe"
elif ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  else
    log "No Python executable found."
    exit 1
  fi
fi

ALEMBIC_CMD=("$PYTHON_BIN" -m alembic -c alembic.ini)
UVICORN_CMD=("$PYTHON_BIN" -m uvicorn app.main:app --host "$HOST" --port "$PORT")

show_migration_diagnostics() {
  log "Alembic diagnostics:"
  log "- current"
  "${ALEMBIC_CMD[@]}" current || true
  log "- heads"
  "${ALEMBIC_CMD[@]}" heads || true
  log "- recent history"
  "${ALEMBIC_CMD[@]}" history | tail -n 25 || true
}

run_migrations() {
  local output
  if output=$("${ALEMBIC_CMD[@]}" upgrade head 2>&1); then
    if [[ -n "$output" ]]; then
      printf '%s\n' "$output"
    fi
    return 0
  fi

  local status=$?
  printf '%s\n' "$output"

  if [[ "$output" == *"Can't locate revision identified by"* ]] && [[ "$ALEMBIC_AUTO_STAMP_ON_MISSING_REVISION" == "1" ]]; then
    log "Detected unresolved Alembic revision; auto-stamp is enabled."
    log "Stamping database to head, then retrying upgrade..."
    "${ALEMBIC_CMD[@]}" stamp head
    "${ALEMBIC_CMD[@]}" upgrade head
    return 0
  fi

  return "$status"
}

if [[ "$RUN_DB_MIGRATIONS" == "1" ]]; then
  log "Running database migrations (alembic upgrade head)..."
  if ! run_migrations; then
    log "Migration command failed."
    show_migration_diagnostics

    if [[ "$ALLOW_START_WITH_MIGRATION_FAILURE" == "1" ]]; then
      log "ALLOW_START_WITH_MIGRATION_FAILURE=1, starting app without successful migration."
    else
      log "Refusing to start app."
      log "Set ALLOW_START_WITH_MIGRATION_FAILURE=1 only for emergency bypass."
      exit 1
    fi
  fi
else
  log "RUN_DB_MIGRATIONS=$RUN_DB_MIGRATIONS, skipping migrations."
fi

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN=1, startup checks completed."
  exit 0
fi

log "Starting API on ${HOST}:${PORT}"
exec "${UVICORN_CMD[@]}"

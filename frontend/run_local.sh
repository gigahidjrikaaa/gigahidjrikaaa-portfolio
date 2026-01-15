#!/bin/sh
# Runs the frontend development server locally.
# Self-repairs common missing pieces:
# - Creates .env.local from .env.example if missing
# - Installs node dependencies if node_modules is missing (or FORCE_INSTALL=1)

set -eu

# Prefer a predictable PATH; some shells start with missing /usr/bin.
PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"
export PATH

log() {
  printf '%s\n' "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

# cd to the folder containing this script without relying on external `dirname`.
SCRIPT_DIR=${0%/*}
if [ "$SCRIPT_DIR" = "$0" ]; then
  SCRIPT_DIR="."
fi
cd "$SCRIPT_DIR" || die "Failed to cd into script directory: $SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  # Try common Windows install locations.
  for d in "/c/Program Files/nodejs" "/c/Program Files (x86)/nodejs"; do
    if [ -f "$d/node.exe" ]; then
      PATH="$d:$PATH"
      export PATH
      break
    fi
  done
fi

if ! command -v node >/dev/null 2>&1; then
  die "Node.js is not installed or not on PATH. Install Node.js (LTS) and retry."
fi

if ! command -v npm >/dev/null 2>&1; then
  die "npm is not available on PATH. Install Node.js (includes npm) and retry."
fi
command -v cp >/dev/null 2>&1 || die "cp is not available. Please run this from Git Bash (Git for Windows) or WSL."

if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    log "--- Creating frontend .env.local from .env.example ---"
    cp ".env.example" ".env.local" || die "Failed to create .env.local from .env.example."
    log "NOTE: Review frontend/.env.local and set any required values."
  else
    log "--- Creating empty frontend .env.local (no .env.example found) ---"
    : > .env.local
  fi
fi

if [ "${FORCE_INSTALL:-}" = "1" ] || [ ! -d "node_modules" ]; then
  if [ -f "package-lock.json" ]; then
    log "--- Installing frontend dependencies (npm ci) ---"
    if ! npm ci; then
      log "npm ci failed; falling back to npm install"
      npm install || die "Dependency install failed (npm install)."
    fi
  else
    log "--- Installing frontend dependencies (npm install) ---"
    npm install || die "Dependency install failed (npm install)."
  fi
fi

log "--- Starting Frontend Development Server ---"
if [ "${DRY_RUN:-}" = "1" ]; then
  log "--- DRY_RUN=1: bootstrap complete; not starting server ---"
  exit 0
fi

exec npm run dev
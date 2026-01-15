#!/usr/bin/env bash
# Dev launcher for backend + frontend.
#
# Goals:
# - Works from Git Bash on Windows without cmd.exe quoting issues.
# - Opens backend+frontend in separate windows on Windows.
# - Falls back to running both in the current terminal on non-Windows.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"

BACKEND_ENV_EXAMPLE="${BACKEND_DIR}/.env.example"
LEGACY_BACKEND_ENV_EXAMPLE="${BACKEND_DIR}/app/.env.example"

ensure_env_files() {
    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        if [ -f "${BACKEND_ENV_EXAMPLE}" ]; then
            echo "Backend .env not found. Creating from backend/.env.example..."
            cp "${BACKEND_ENV_EXAMPLE}" "${BACKEND_DIR}/.env"
        elif [ -f "${LEGACY_BACKEND_ENV_EXAMPLE}" ]; then
            echo "Backend .env not found. Creating from backend/app/.env.example..."
            cp "${LEGACY_BACKEND_ENV_EXAMPLE}" "${BACKEND_DIR}/.env"
        else
            echo "Backend .env example not found. Creating empty backend/.env..."
            touch "${BACKEND_DIR}/.env"
        fi
    fi

    if [ ! -f "${FRONTEND_DIR}/.env.local" ]; then
        if [ -f "${FRONTEND_DIR}/.env.example" ]; then
            echo "Frontend .env.local not found. Creating from frontend/.env.example..."
            cp "${FRONTEND_DIR}/.env.example" "${FRONTEND_DIR}/.env.local"
        else
            echo "Frontend .env.example not found. Creating empty frontend/.env.local..."
            touch "${FRONTEND_DIR}/.env.local"
        fi
    fi
}

is_windows() {
    case "${OSTYPE}" in
        msys*|cygwin*|win32*) return 0 ;;
    esac
    return 1
}

find_git_bash_exe_windows() {
    # Returns a Windows path to bash.exe if found.
    local candidates=(
        "/c/Program Files/Git/bin/bash.exe"
        "/c/Program Files/Git/usr/bin/bash.exe"
        "/c/Program Files (x86)/Git/bin/bash.exe"
        "/c/Program Files (x86)/Git/usr/bin/bash.exe"
    )

    for p in "${candidates[@]}"; do
        if [ -x "$p" ]; then
            cygpath -w "$p"
            return 0
        fi
    done

    # Fallback: try cygpath of whatever bash we are running (may not exist on disk for some shells)
    if command -v bash >/dev/null 2>&1; then
        local bash_path
        bash_path="$(command -v bash)"
        if [ -n "${bash_path}" ] && [ -e "${bash_path}" ]; then
            cygpath -w "${bash_path}" || true
            return 0
        fi
    fi

    return 1
}

start_windows_processes() {
    local bash_win
    if ! bash_win="$(find_git_bash_exe_windows)"; then
        echo "Could not find Git bash.exe. Falling back to current terminal." >&2
        return 1
    fi

    local backend_win frontend_win
    backend_win="$(cygpath -w "${BACKEND_DIR}")"
    frontend_win="$(cygpath -w "${FRONTEND_DIR}")"

    # Use PowerShell Start-Process to avoid cmd.exe quoting quirks.
    # Note: we run run_local.sh in a subshell so even if it calls `exit`,
    # we can keep the window open and show the exit code.
    echo "Starting backend and frontend in separate windows..."
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \
        "Start-Process -FilePath '${bash_win}' -WorkingDirectory '${backend_win}' -ArgumentList @('-lc', 'cd \"${backend_win}\"; (./run_local.sh); code=$?; echo; echo Backend exited with code: $code; exec bash -i'); Start-Process -FilePath '${bash_win}' -WorkingDirectory '${frontend_win}' -ArgumentList @('-lc', 'cd \"${frontend_win}\"; (./run_local.sh); code=$?; echo; echo Frontend exited with code: $code; exec bash -i');"

    echo "Server launch commands have been sent."
    return 0
}

start_unix_processes() {
    echo "Starting backend and frontend in the current terminal..."
    (cd "${BACKEND_DIR}" && ./run_local.sh) &
    local backend_pid=$!
    (cd "${FRONTEND_DIR}" && ./run_local.sh) &
    local frontend_pid=$!

    cleanup() {
        echo "Stopping servers..."
        kill "${backend_pid}" "${frontend_pid}" 2>/dev/null || true
    }
    trap cleanup EXIT

    wait "${backend_pid}" "${frontend_pid}"
}

ensure_env_files
echo "Environment files are ready."
echo "run_dev.sh: launching (2026-01-15)"

if is_windows; then
    if start_windows_processes; then
        exit 0
    fi
fi

start_unix_processes

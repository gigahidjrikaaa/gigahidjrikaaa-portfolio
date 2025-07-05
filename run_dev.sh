#!/bin/bash
# This script launches the backend and frontend development servers
# in separate Git Bash windows.

# --- Configuration ---
# NOTE: This script assumes Git Bash is installed at the default location.
# If your path is different, please update the GIT_BASH_PATH variable.
GIT_BASH_PATH="C:\Program Files\Git\git-bash.exe"

# --- Environment Setup ---
# Check for backend .env file
if [ ! -f backend/.env ]; then
    echo "Backend .env file not found. Creating from example..."
    cp backend/app/.env.example backend/.env
fi

# Check for frontend .env file
if [ ! -f frontend/.env ]; then
    echo "Frontend .env file not found. Creating..."
    touch frontend/.env
fi

echo "Environment files are ready."

# --- Server Launch ---
echo "Starting backend and frontend servers in separate windows..."

# Get the current project directory path
PROJECT_DIR=$(pwd)

# Command to execute the backend script
# We navigate to the backend directory, then execute its local run script.
BACKEND_CMD="cd \"${PROJECT_DIR}/backend\" && ./run_local.sh"

# Command to execute the frontend script
FRONTEND_CMD="cd \"${PROJECT_DIR}/frontend\" && ./run_local.sh"

# Use 'start' to launch the scripts in new Git Bash terminals
start "Backend Server" "$GIT_BASH_PATH" --login -i -c "$BACKEND_CMD"
start "Frontend Server" "$GIT_BASH_PATH" --login -i -c "$FRONTEND_CMD"

echo "Server launch commands have been sent."

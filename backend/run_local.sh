#!/bin/bash
# This script runs the backend server.

echo "--- Activating Python Virtual Environment ---"
# Activate the virtual environment. The '||' part handles errors.
source .venv/Scripts/activate || { echo "Failed to activate virtual environment."; read -p "Press Enter to close..."; exit 1; }

echo "--- Starting Backend Server (localhost:8000) ---"
# Start the Uvicorn server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# This part will only be reached if the server command fails or is stopped.
echo
echo "Server process has stopped."
read -p "Press Enter to close this window..."
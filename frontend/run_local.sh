#!/bin/bash
# This script runs the frontend development server.

# Check if node_modules exists, if not, run npm install
if [ ! -d "node_modules" ]; then
  echo "--- 'node_modules' not found, running 'npm install' ---"
  npm install || { echo "npm install failed."; read -p "Press Enter to close..."; exit 1; }
fi

echo "--- Starting Frontend Development Server ---"
# Start the Next.js development server
npm run dev || { 
  echo "Failed to start the frontend server. Please check the logs above.";
  read -p "Press Enter to close this window...";
  exit 1; 
}

# This part will only be reached if the server command fails or is stopped.
echo
echo "Server process has stopped."
read -p "Press Enter to close this window..."
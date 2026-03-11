#!/usr/bin/env bash

set -euo pipefail

echo "  Documents Management Systems "
# Function to kill process on a specific port (continues on error)
kill_port() {
  local port=$1
  local pid=$(lsof -ti:$port 2>/dev/null || true)

  if [ -n "$pid" ]; then
    echo "Port $port is in use by PID $pid. Attempting to kill..."
    # Try kill, but continue even if it fails
    kill -9 $pid 2>/dev/null || true
    sleep 1
  else
    echo "Port $port is available."
  fi
}

# Kill processes on ports 3000 and 3001 if running
echo "Checking and freeing required ports..."
kill_port 3001 || true
kill_port 3000 || true

echo "===================================================="

# 1. Start Backend and wait for it to be healthy
echo "Step 1: Starting Backend (MySQL, Migrations, Seed)..."
cd backend
# update permission
chmod +x start-api.sh
./start-api.sh &
BACKEND_PID=$!

# 2. Wait for Backend port (3001) to be active
echo "Waiting for Backend to respond on port 3001..."
attempts=0
until curl -s http://localhost:3001/api/docs > /dev/null; do
  attempts=$((attempts + 1))
  if [ $attempts -ge 60 ]; then
    echo " Error: Backend failed to start in time."
    kill $BACKEND_PID
    exit 1
  fi
  sleep 2
done

echo "Backend is healthy!"

# 3. Start Frontend
echo "Step 2: Starting Frontend..."
cd ../frontend

# Copy env.example file if it doesn't exist
if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    echo "Copying env to .env..."
    cp .env.example .env
  else
    echo "Warning: 'env' file not found. You may need to create .env manually."
  fi
else
  echo ".env file already exists — skipping copy."
fi

npm install
npm run dev &
FRONTEND_PID=$!

# 4. Handle Shutdown
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "===================================================="
echo "SYSTEM READY"
echo "Backend: http://localhost:3001"
echo "Swagger: http://localhost:3001/api/docs"
echo "Frontend: http://localhost:3000"
echo "===================================================="

wait

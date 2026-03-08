#!/usr/bin/env bash

set -euo pipefail

echo "Starting Documents Management System (Backend + Frontend)"

# Start backend (includes MySQL via Docker)
cd backend
./start-api.sh &  # Run in background

# Start frontend
cd ../frontend
cp .env.example .env

npm install

npm run dev &

# Wait for processes
wait

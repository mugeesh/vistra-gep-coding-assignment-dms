#!/usr/bin/env bash

set -euo pipefail

# ────────────────────────────────────────────────
# Auto cd to backend/ if not already there
# ────────────────────────────────────────────────
if [[ "$(basename "$(pwd)")" != "backend" ]]; then
  if [[ -d "backend" ]]; then
    echo "Changing directory to backend/..."
    cd backend
  else
    echo "Error: 'backend' directory not found in current path."
    echo "Please run this script from the project root."
    exit 1
  fi
else
  echo "Already in backend/ directory — skipping cd."
fi

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

echo "====================================="
echo "  DMS Backend - Dev Setup"
echo "  (Docker MySQL + Prisma + NestJS)"
echo "====================================="
echo ""

# 1. Clean up any old/stuck MySQL container
echo "1. Cleaning up old MySQL container (if exists)..."
docker rm -f mysql 2>/dev/null || true

# 2. Start MySQL
echo "2. Starting MySQL container..."
docker compose up -d mysql

# 3. Wait for MySQL to be ready
echo "3. Waiting for MySQL to be fully ready (max 60 seconds)..."
attempts=0
max_attempts=30

until docker compose exec -T mysql mysqladmin ping -h localhost -uroot -prootPassword --silent 2>/dev/null; do
  attempts=$((attempts + 1))
  if [ $attempts -ge $max_attempts ]; then
    echo "ERROR: MySQL failed to become healthy."
    echo "Logs:"
    docker compose logs mysql | tail -n 30
    exit 1
  fi
  echo "MySQL starting... (${attempts}/${max_attempts})"
  sleep 2
done

echo "MySQL is fully ready!"

# 4. Install dependencies if needed
echo "4. Installing dependencies..."
npm install

# 5. Prisma setup
echo "5. Generating Prisma client..."
npx prisma generate
# 3. Preparation
npm install
npm run prisma:generate

# 4. syn DB
echo "Synchronizing Database..."
if [[ "$*" == *"--fresh"* ]]; then
  echo "Force resetting database..."
  npx prisma migrate reset --force
else
  # 'db push' is the best for reviewers because it ignores migration history
  # We removed --skip-generate to fix the 'unknown option' error
  npx prisma db push --accept-data-loss
fi

# 5. Seeding
echo "Seeding initial data..."
npm run prisma:seed || {
  echo "Seed failed. Reviewer may need to run 'cd  backend && npm run prisma:seed' manually."
}

# 8. Start NestJS
echo "8. Starting NestJS application (watch mode)..."
echo "    → App should be running at http://localhost:3001"
echo "    → Swagger: http://localhost:3001/api/docs"
echo "    → Press Ctrl+C to stop"
echo ""
#run apps
npm run start

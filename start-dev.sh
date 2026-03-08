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

# Copy env file if it doesn't exist
if [[ ! -f ".env" ]]; then
  if [[ -f "env" ]]; then
    echo "Copying env to .env..."
    cp env .env
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

# 6. Run migrations
echo "6. Running database migrations..."
if [[ "$*" == *"--fresh"* ]]; then
  echo "Fresh migration reset..."
  npx prisma migrate reset --force
else
  npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
fi

# 7. Seed database
echo "7. Seeding database..."
if [[ -f "prisma/seed.ts" ]] || [[ -f "prisma/seed.js" ]]; then
  npx prisma db seed
else
  echo "No seed file found — skipping seeding."
fi

# 8. Start NestJS
echo "8. Starting NestJS application (watch mode)..."
echo "    → App should be running at http://localhost:3001"
echo "    → Swagger: http://localhost:3001/api/docs"
echo "    → Press Ctrl+C to stop"
echo ""

npm run start:dev

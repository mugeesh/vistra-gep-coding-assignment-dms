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
cp env .env

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
# Robust wait for MySQL
echo "3. Waiting for MySQL to be fully healthy (max 60s)..."
attempts=0
max_attempts=30

until docker compose ps mysql | grep "healthy" >/dev/null 2>&1 || \
      docker compose exec -T mysql mysqladmin ping -h localhost -uroot -prootPassword --silent 2>/dev/null; do
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

set -euo pipefail



# 4. Prisma setup
echo "4. Generating Prisma client..."
npx prisma generate --no-install || npm install prisma@latest --no-save && npx prisma generate

echo "5. Seeding database..."
npx ts-node prisma/seed.ts

# 7. Start NestJS
echo "6. Starting NestJS application (watch mode)..."
echo "    → App should be running at http://localhost:3001"
echo "    → Swagger: http://localhost:3001/api/docs"
echo "    → Press Ctrl+C to stop"
echo ""

npm run start:dev

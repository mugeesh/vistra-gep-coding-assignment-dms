# Vistra GEP Coding Assignment: Documents Management System

## Overview
This project implements a simple Documents Management System (DMS) as per the assignment requirements. It includes:
- **Frontend**: Next.js with TypeScript for viewing documents/folders, adding new ones (with form validation), and basic search.
- **Backend**: Node.js/NestJS with TypeScript, Prisma for ORM, and MySQL (via Docker) for data storage.
- No actual file uploads; simulates document/folder records.

Tech Stack:
- Frontend: Next.js, TypeScript, [Your CSS choice, e.g., styled-components]
- Backend: NestJS, Prisma, MySQL 8
- Database: Hierarchical schema for documents/folders (supports parent-child relationships).

## Prerequisites
- Node.js >= 18
- npm >= 9
- Docker (for MySQL)
- Git

## Setup Instructions
1. Clone the repository:
2. https://github.com/mugeesh/vistra-gep-coding-assignment-dms
3. cd vistra-gep-coding-assignment-dms

2. Install dependencies:
- For backend: `cd backend && npm install`
- For frontend: `cd frontend && npm install`

3. Configure environment variables:
- Backend: Copy `backend/.env.example` to `backend/.env` and update if needed (e.g., DATABASE_URL).
- Frontend: Copy `frontend/.env.example` to `frontend/.env` (e.g., set NEXT_PUBLIC_API_URL=http://localhost:3001).

4. Start the application:
- Option 1: Automated (recommended) — Run `./start-all.sh` from the root (starts MySQL, backend, and frontend).
- Option 2: Manual:
    - Start backend (includes MySQL): `cd backend && ./start-dev.sh`
    - Start frontend: `cd frontend && npm run dev`

The script handles:
- Starting MySQL via Docker.
- Prisma client generation, migrations, and seeding.
- Backend in watch mode.

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs
- DB Admin (Adminer): http://localhost:8080 (login: root/rootPassword, DB: document_management_systems)

## Running Tests
- Backend: `cd backend && npm test`

## Features
- View list of documents/folders.
- Add new document (simulate record with name, createdBy, date, size).
- Add new folder.
- [Bonus] Search across items.
- Hierarchical structure (folders can contain documents/folders).

## Database Schema
Using Prisma schema (see `backend/prisma/schema.prisma`):
- `Document` model: id (int), name (string), type (enum: 'document' | 'folder'), parentId (int, optional), createdBy (string), createdAt (date), size (int, optional for documents).

Migrations are applied automatically via the start script.

## Notes
- For fresh DB reset: Run `cd backend && npm run dev:reset`.
- Code follows best practices: Type safety, linting, testing.
- UI is responsive and user-friendly.

If issues arise, check Docker logs: `docker compose logs mysql`.


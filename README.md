# Vistra GEP Coding Assignment: Documents Management System

A simple hierarchical **Documents Management System (DMS)** simulating folders and documents (no real file uploads).

![Frontend - Documents Management UI](frontend-page.png)
> Live demo at http://localhost:3000 after setup

![Swagger UI - API Documentation](api-swagger.png)
> Interactive docs at http://localhost:3001/api/docs

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start (via script)](#quick-start-via-script)
- [Manual Setup](#manual-setup)
- [Access Points](#access-points)
- [Database & Reset](#database--reset)
- [Running Tests](#running-tests)

## Overview

This project implements a basic Documents Management System as per the Vistra GEP assignment requirements.

- No real file uploads — simulates records (name, type, size, createdBy, etc.)
- Supports nested folders/documents
- Basic CRUD + search functionality
- Code is clean, well-structured, and follows best practices

## Features

- Hierarchical folder/document structure (parent-child relationships)
- View items in current folder
- Add new folder
- Add new document (with form validation)
- [Bonus] Global + folder-level search
- Responsive UI
- Swagger API documentation
- Prisma migrations & MySQL via Docker
- Unit/integration tests (backend)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: MySQL 8 (Dockerized)
- **Tools**: Docker Compose, class-validator, class-transformer

## Prerequisites

- Node.js ≥ 22
- npm ≥ 9
- Docker & Docker Compose
- Git

## Quick Start (via script)

```bash
git clone https://github.com/mugeesh/vistra-gep-coding-assignment-dms.git
cd vistra-gep-coding-assignment-dms

# Make script executable and run
chmod +x start-all.sh
./start-all.sh
```

## Manual Setup

If you prefer more control or the automated script doesn't work in your environment, follow these steps:

### backend api:

1. **Start the Database (MySQL via Docker)**  
   From the project root:

```bash
  docker compose up -d mysql
```

2. **Start backend api**

```bash
 cd backend
 npm install
 npx prisma generate
 npx prisma migrate deploy  
 ```

3. Load test seed data

```bash
npm run prisma:seed,
```

4. Run apps

```bash 
  npm run start:dev     
```

### Check Swagger UI: http://localhost:3001/api/docs

### frontend api:

```bash 
  cd frontend
  npm install
  npm run dev    
```

### Check Web: http://localhost:3000

## Access Points

Once the application is running:

- **Frontend UI**  
  http://localhost:3000  
  (Main interface for browsing folders, viewing items, adding new folders/documents, and searching)

- **Backend API**  
  http://localhost:3001

- **Interactive API Documentation (Swagger)**  
  http://localhost:3001/api/docs  
  Explore and test all endpoints interactively

- **Database Admin (Adminer)**  
  http://localhost:8080  
  **Credentials**:
    - System: MySQL
    - Server: `mysql`
    - Username: `root`
    - Password: `rootPassword`
    - Database: `document_management_system`

## Database & Reset

- The database uses a hierarchical structure with self-referencing `parentId` (folders can contain both documents and
  subfolders).
- Schema definition: `backend/prisma/schema.prisma`
- Migrations are applied automatically when starting the backend (via Prisma migrate).
- Seed data (optional demo items) may be applied depending on your `start-all.sh` / `start-dev.sh` implementation.

**Reset the database** (drops all tables, re-applies migrations, optional re-seed):

```bash
cd backend
npm run dev:reset

or

cd backend
npx prisma migrate reset --force
```

## Running Tests

1. backend running test
2.  node -v -this should be v22.X.X
```bash
cd backend
docker compose up -d
cp .env.example .env 
npm install
npx prisma generate
npm run test


**======= Test results ==========**
mugeesh@mugeesh backend % npm run test

> backend-api@1.0.0 test
> jest --config jest.config.js

 PASS  test/integration/items.service.spec.ts
 PASS  test/integration/documents.controller.spec.ts
 PASS  test/integration/folders.controller.spec.ts
 PASS  test/integration/items.controller.spec.ts
--------------------------|---------|----------|---------|---------|----------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
--------------------------|---------|----------|---------|---------|----------------------
All files                 |    62.5 |    34.72 |   52.94 |   61.11 |                      
 common                   |      55 |      100 |       0 |   73.33 |                      
  list-items-query.dto.ts |      55 |      100 |       0 |   73.33 | 12,23,36,76          
 documents                |   43.85 |    11.11 |      20 |   38.77 |                      
  documents.controller.ts |   45.16 |       20 |      40 |   44.44 | 27,43-45,54-59,65-72 
  documents.module.ts     |     100 |      100 |     100 |     100 |                      
  documents.service.ts    |      25 |        0 |       0 |   16.66 | 6-69                 
 documents/dto            |      88 |    28.57 |    62.5 |      88 |                      
  create-document.dto.ts  |   94.11 |       40 |   83.33 |   94.11 | 58                   
  update-document.dto.ts  |      75 |        0 |       0 |      75 | 8,16                 
 folders                  |   56.89 |    26.92 |      50 |   51.92 |                      
  folders.controller.ts   |   68.75 |    38.88 |     100 |   66.66 | 38-42,56-60,76-77    
  folders.module.ts       |     100 |      100 |     100 |     100 |                      
  folders.service.ts      |      25 |        0 |       0 |   16.66 | 10-74                
 folders/dto              |     100 |       50 |     100 |     100 |                      
  create-folder.dto.ts    |     100 |       50 |     100 |     100 | 15-29                
  update-folder.dto.ts    |     100 |       50 |     100 |     100 | 7                    
 items                    |   74.62 |    45.94 |     100 |   72.41 |                      
  items.controller.ts     |     100 |    93.75 |     100 |     100 | 34                   
  items.service.ts        |   68.51 |    32.75 |     100 |   65.95 | 21-23,42-62          
 prisma                   |   31.57 |        0 |       0 |   23.52 |                      
  prisma.service.ts       |   31.57 |        0 |       0 |   23.52 | 6-13,28-54           
--------------------------|---------|----------|---------|---------|----------------------

Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        3.514 s, estimated 4 s
Ran all test suites.
```
2. Frontend test case    

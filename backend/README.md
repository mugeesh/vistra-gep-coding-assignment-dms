# Document Management System - Backend API

**NestJS** + **Prisma** + **MySQL** + **Docker**

Simple REST API for managing folders, documents, and a combined item view (folders + documents in one parent).

## Features

- Folder CRUD operations
- Document CRUD operations
- Combined `/items` endpoint (folders + documents in a parent folder)
- Swagger API documentation
- Adminer web interface for database inspection
- Jest integration & E2E tests
- Dockerized MySQL database

## Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: MySQL
- **Containerization**: Docker + Docker Compose
- **API Documentation**: Swagger / OpenAPI
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js ≥ 22
- npm
- Docker & Docker Compose

###  Setup

```bash
    # 1. Clone repository 
    git clone https://github.com/mugeesh/vistra-gep-coding-assignment-dms.git
    cd backend
    
    # 2. Copy environment
    cp .env.example .env
    
    # 3. Start database (MySQL)
    docker compose up -d
    
    # Wait ~10–20 seconds, then verify
    docker ps
  # You should see mysql and adminer containers running
  ```
### Install & Run Development Server
    
```bash
    npm install
    
    # Generate Prisma client
    npx prisma generate
    
    # (Optional but recommended) Seed test data
    npm run prisma:seed
    
    # Start the server in watch mode
    npm run start:dev
  ```
API should now be available at: http://localhost:3001

### Available Services


1. make sure running port is 30001
2. API: http://localhost:3001
3. Swagger: http://localhost:3001/api/docs
4. Adminer (DB GUI): http://localhost:8080
5. Server: mysql
6. User: root
7. Password: rootPassword
8. Database: document_management_systems

### Running Tests
**Run Test case**
```bash 
    npm run test
    
    > backend-api@1.0.0 test
    > jest --config jest.config.js
    
     PASS  test/integration/items.service.spec.ts
     PASS  test/integration/documents.controller.spec.ts
     PASS  test/integration/folders.controller.spec.ts
    
    Test Suites: 3 passed, 3 total
    Tests:       21 passed, 21 total
    Snapshots:   0 total
    Time:        2.923 s, estimated 3 s
    Ran all test suites.
   ```

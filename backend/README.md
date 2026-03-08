# DMS API (NestJS)

## Development Quick Start
Add this to your README.md (makes it super professional):
Markdown## Development Quick Start

1. Install dependencies
   ```bash
   npm install

Start the full stack (MySQL + Prisma + NestJS)Bashnpm run dev:all
Reset database + restart (when you need a clean slate)Bashnpm run dev:reset

Access:

API: http://localhost:3000
Swagger: http://localhost:3000/api/docs
Adminer (DB GUI): http://localhost:8080
Server: mysql
User: root
Password: rootPassword
Database: document_management_systems


textNow your project is **very easy to run** — just `npm run dev:all` and everything works.

If you want to add:
- Auto-open browser
- Check if Docker is running
- Windows compatibility

Let me know — I can tweak the script further.  
Otherwise, you're ready to share! 🚀


old contents


Backend for the Document Management System: folders, documents, and combined items endpoints.

- **Setup & run**: See root **[SETUP.md](../../SETUP.md)** and root **[README.md](../../README.md)**. Env (including `PORT` and `DATABASE_URL`) is read from **root `.env`** when present, then from `apps/api/.env`.
- **API behavior**: **[API_README.md](./API_README.md)** — endpoints, DTOs, validation, and module layout.

## Commands (from this folder)

```bash
npm install
npm run prisma:migrate:dev -- --name <name>
npm run prisma:seed
npm run start:dev
```

## Structure

- `src/folders` — `GET/POST /folders`
- `src/documents` — `GET/POST /documents`
- `src/items` — `GET /items` (folders + documents for one parent)
- `src/prisma` — DB connection
- `src/common` — shared helpers (e.g. `parseOptionalInt`)

# DMS API (NestJS)

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

# DMS Web (Next.js)

Document explorer UI: list folders and documents, create folder/document with validation, wired to the API.

- **Setup & run**: See root **[SETUP.md](../../SETUP.md)** and root **[README.md](../../README.md)**. API base URL is read from **root `.env`** (`NEXT_PUBLIC_API_BASE_URL` / `BACKEND_URL`) when present.
- **API reference**: [apps/api/API_README.md](../api/API_README.md)

## Commands (from this folder)

```bash
npm install
npm run dev
```

## Structure

- `src/app` — Next.js App Router (layout, page)
- `src/components` — DocumentsExplorer, AddFolderForm, AddDocumentForm
- `src/lib/api.ts` — API client (getItems, createFolder, createDocument)
- `src/types/api.ts` — shared types (Folder, Document, payloads)

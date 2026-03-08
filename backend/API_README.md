# Document Management API – Functional Overview

This document describes the **functionalities exposed by the NestJS API** for the Document Management System (DMS). It focuses on what each endpoint does and how the main pieces (folders, documents, combined items) work together.

---

## 1. High‑level purpose

The API exposes a minimal document management backend that lets a client:

- Browse a **hierarchical folder tree**.
- List **documents** inside any folder (or at the root).
- **Create folders** and **create documents** using simple JSON payloads.
- Fetch a **combined view** of folders and documents in one call (for the explorer UI).

The database is MySQL 8, accessed through **Prisma**.

---

## 2. Data model (conceptual)

### Folder

- `id: number` – primary key.
- `name: string` – display name.
- `parentId: number | null` – points to another folder, or `null` for root.
- `createdAt`, `updatedAt` – timestamps.

This enables a classic tree: a folder can have many child folders and documents.

### Document

- `id: number` – primary key.
- `folderId: number | null` – which folder it belongs to, or `null` to live at root.
- `title: string` – document title (required).
- `description?: string` – optional description.
- `fileName?: string` – simulated file name.
- `mimeType?: string` – simulated content type.
- `sizeBytes?: number` – simulated size.
- `createdAt`, `updatedAt` – timestamps.

No actual files are stored; documents are **metadata records only**.

---

## 3. Base URL and ports

When you run:

```bash
cd apps/api
npm run start:dev
```

the API starts on the first free port starting from **3001**. At startup it logs, for example:

```text
[bootstrap] Listening on http://localhost:3002
```

Use that URL (e.g. `http://localhost:3002`) as the **base URL** in Postman or the frontend.

---

## 4. Folders API

**Files:**

- `src/folders/folders.controller.ts`
- `src/folders/folders.service.ts`
- `src/folders/dto/create-folder.dto.ts`

### 4.1 GET `/folders`

List folders **directly under a given parent**, or at the **root** when no parent is given.

- **Method**: `GET`
- **URL**: `/folders`
- **Query parameters**:
  - `parentId` (optional):
    - When omitted / `null`: list **root** folders.
    - When set to a number (e.g. `7`): list folders whose `parentId = 7`.

**Examples**

- Root folders:

```http
GET /folders
```

- Children of folder `7`:

```http
GET /folders?parentId=7
```

**Response**: JSON array of folders, each with `id`, `name`, `parentId`, `createdAt`, `updatedAt`.

### 4.2 POST `/folders`

Create a **new folder**.

- **Method**: `POST`
- **URL**: `/folders`
- **Body (JSON)**:

```json
{
  "name": "New Folder",
  "parentId": 7
}
```

- `name` – required, non‑empty string.
- `parentId` – optional; if provided, must be an existing folder id; otherwise you get a 400 error.

**Behavior**:

- Validates the body using `CreateFolderDto`.
- Verifies that `parentId` (if present) points to an existing folder.
- Inserts a new folder and returns the created record as JSON.

---

## 5. Documents API

**Files:**

- `src/documents/documents.controller.ts`
- `src/documents/documents.service.ts`
- `src/documents/dto/create-document.dto.ts`

### 5.1 GET `/documents`

List documents **inside a folder**, or at the **root** when no folder is given.

- **Method**: `GET`
- **URL**: `/documents`
- **Query parameters**:
  - `folderId` (optional):
    - When omitted / `null`: list documents with `folderId = null` (root).
    - When set to a number (e.g. `7`): list documents with `folderId = 7`.

**Examples**

- Root documents:

```http
GET /documents
```

- Documents in folder `7`:

```http
GET /documents?folderId=7
```

**Response**: JSON array of documents, each with `id`, `folderId`, `title`, `description`, `fileName`, `mimeType`, `sizeBytes`, `createdAt`, `updatedAt`.

### 5.2 POST `/documents`

Create a **new document metadata record**.

- **Method**: `POST`
- **URL**: `/documents`
- **Body (JSON)**:

```json
{
  "title": "My Doc",
  "folderId": 7,
  "description": "Optional description",
  "fileName": "mydoc.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 12345
}
```

- `title` – required, non‑empty string.
- `folderId` – optional; if present, must refer to an existing folder, or a 400 error is returned.
- `description`, `fileName`, `mimeType`, `sizeBytes` – all optional.

**Behavior**:

- Validates the body using `CreateDocumentDto`.
- Verifies that `folderId` (if present) refers to an existing folder.
- Creates a new document and returns the created record as JSON.

---

## 6. Combined items API

**Files:**

- `src/items/items.controller.ts`

The **items** endpoint is designed specifically to make the explorer UI simpler. It returns both **folders** and **documents** for the same parent context in **one call**.

### 6.1 GET `/items`

- **Method**: `GET`
- **URL**: `/items`
- **Query parameters**:
  - `parentId` (optional):
    - When omitted / `null`: treat as root and return folders with `parentId = null` and documents with `folderId = null`.
    - When set to a number (e.g. `7`): return folders with `parentId = 7` and documents with `folderId = 7`.
  - `page`, `pageSize` (optional): pagination. Defaults: `page = 1`, `pageSize = 10`. `pageSize` is capped at 100.
  - `sortBy` (optional): `name` | `createdAt` | `size` | `type`. Default `name`.
  - `sortOrder` (optional): `asc` | `desc`. Default `asc`.
  - `search` (optional): filter by name/title/fileName (and description for documents). Length capped at 200.
  - `globalSearch` (optional): when `true` and `search` is set, **search across all folders and documents** (ignore `parentId`). Folder `name` and document `title`, `fileName`, and `description` are matched via DB `LIKE`. When `false` or omitted, `search` only filters within the current `parentId` scope.

**Examples**

- Root view:

```http
GET /items
```

- Children of folder `7`:

```http
GET /items?parentId=7
```

- Global search across all folders and documents:

```http
GET /items?search=report&globalSearch=true&page=1&pageSize=10
```

**Response shape**:

```json
{
  "items": [ /* mixed folder and document items with "kind" */ ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

This is ideal for a single “Explorer” call that populates both the folder list and the document list, with optional pagination, sort, search, and global search.

---

## 7. Shared utilities and behavior

### 7.1 Query parameter parsing

`src/common/query-int.ts` provides `parseOptionalInt`, which:

- Accepts a raw string value from the query (e.g. `"7"`, `"null"`, `""`).
- Returns:
  - `number` for valid ints.
  - `null` for empty/`null` values.
  - `null` for invalid values (non‑ints).

Controllers use this helper for `parentId` / `folderId` to robustly support:

- Omitted query params.
- Explicit `?parentId=null`.

### 7.2 Validation and error handling

- Global `ValidationPipe` is enabled in `src/main.ts`:
  - Strips unknown fields (`whitelist: true`).
  - Rejects extra unexpected fields (`forbidNonWhitelisted: true`).
  - Automatically transforms payloads into DTO instances.
- Services throw `BadRequestException` when:
  - `parentId` refers to a non‑existent folder.
  - `folderId` refers to a non‑existent folder.

This results in clear `400` responses when clients send invalid references.

---

## 8. Where to extend next

If you want to extend the API, natural next steps are:

- **Add update/delete operations**:
  - `PATCH /folders/:id`, `DELETE /folders/:id`
  - `PATCH /documents/:id`, `DELETE /documents/:id`
- **Extend search** (e.g. search in document body, tags, or custom fields).
- **Optimize pagination** (e.g. cursor-based or DB-level limit/offset for large sets).

All of these can be added by:

1. Updating/adding DTOs in the `dto` folders.
2. Adding new handler methods to the controllers.
3. Implementing the logic in the corresponding services.

---

## 9. DTO vs Controller vs Module vs Service

This API follows standard NestJS layering. The four core concepts you will see repeatedly are:

### 9.1 DTO (Data Transfer Object)

- **What it is**: A TypeScript class that describes and validates the **shape of incoming data**, usually request bodies.
- **Responsibility**:
  - Defines which fields are allowed/required.
  - Applies validation rules via `class-validator` decorators (e.g. `@IsString()`, `@IsNotEmpty()`).
  - Does **not** contain business logic or database access.
- **Where used here**:
  - `src/folders/dto/create-folder.dto.ts` – validates `name` and optional `parentId` when creating folders.
  - `src/documents/dto/create-document.dto.ts` – validates document creation fields like `title`, `folderId`, `sizeBytes`, etc.

### 9.2 Controller

- **What it is**: The **HTTP entry point** for a feature – it defines routes and their handlers.
- **Responsibility**:
  - Maps URLs + HTTP methods to methods (e.g. `GET /folders`, `POST /documents`).
  - Reads query params, route params, and DTO-validated bodies.
  - Delegates real work to services and returns their results as responses.
- **Where used here**:
  - `src/folders/folders.controller.ts` – handles `/folders` GET/POST.
  - `src/documents/documents.controller.ts` – handles `/documents` GET/POST.
  - `src/items/items.controller.ts` – handles `/items` GET.

### 9.3 Module

- **What it is**: A **feature boundary and wiring unit** for Nest’s dependency injection (DI) system.
- **Responsibility**:
  - Groups controllers and services that logically belong together.
  - Controls what gets exported so other modules can reuse services if needed.
  - Keeps the application structure organized and scalable.
- **Where used here**:
  - `src/folders/folders.module.ts` – bundles `FoldersController` + `FoldersService`.
  - `src/documents/documents.module.ts` – bundles `DocumentsController` + `DocumentsService`.
  - `src/items/items.module.ts` – bundles `ItemsController`.
  - `src/prisma/prisma.module.ts` – exposes `PrismaService` globally for DB access.

### 9.4 Service

- **What it is**: A **reusable logic layer** that can be injected into controllers and other services.
- **Responsibility**:
  - Encapsulates business rules and data access (Prisma queries, validations beyond simple DTO checks).
  - Stays HTTP-agnostic (no direct use of `Request`, `Response`, etc.).
  - Is easy to unit-test independently of the web layer.
- **Where used here**:
  - `src/folders/folders.service.ts` – folder queries and parent existence checks.
  - `src/documents/documents.service.ts` – document queries and `folderId` existence checks.
  - `src/prisma/prisma.service.ts` – Prisma client setup, DB connection management.

---

## 10. Security and performance

- **Helmet**: Security headers (CSP in production, XSS, etc.) are applied via the `helmet` middleware.
- **CORS**: Only origins listed in `FRONTEND_URL` (comma-separated) are allowed. Set this in the root `.env`.
- **Rate limiting**: `@nestjs/throttler` is applied globally (e.g. 20 req/s and 100 req/min per IP). Prevents abuse and DoS.
- **Body limit**: JSON request body is limited to 256 KB via `useBodyParser('json', { limit: '256kb' })`.
- **Validation**: All DTOs use `class-validator` and `class-transformer`; strings are trimmed before validation. `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted`, `transform`, and `stopAtFirstError`.
- **Query safety**: Items list caps `pageSize` at 100 and `search` length at 200 characters.



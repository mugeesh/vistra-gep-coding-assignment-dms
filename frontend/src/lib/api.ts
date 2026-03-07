import type {
  CreateDocumentPayload,
  CreateFolderPayload,
  Document,
  Folder,
  ItemsSortBy,
  PaginatedItemsResponse,
} from '@/types/api';
import { FIELD_LIMITS } from '@/lib/validation';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
}

export interface GetItemsParams {
  parentId: number | null;
  page?: number;
  pageSize?: number;
  sortBy?: ItemsSortBy;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  globalSearch?: boolean;
}

export async function getItems(params: GetItemsParams): Promise<PaginatedItemsResponse> {
  const base = getBaseUrl();
  if (typeof window !== 'undefined' && !base) {
    throw new Error(
      'API base URL is missing. Set NEXT_PUBLIC_API_BASE_URL or BACKEND_URL in the root .env.',
    );
  }
  const {
    parentId,
    page = 1,
    pageSize = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    search,
    globalSearch,
  } = params;
  const searchParams = new URLSearchParams();
  if (parentId !== null) searchParams.set('parentId', String(parentId));
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  searchParams.set('sortBy', sortBy);
  searchParams.set('sortOrder', sortOrder);
  if (search?.trim())
    searchParams.set('search', search.trim().slice(0, FIELD_LIMITS.searchMaxLength));
  if (globalSearch) searchParams.set('globalSearch', 'true');
  const url = `${base}/items?${searchParams.toString()}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    const msg =
      e instanceof Error && e.message === 'Failed to fetch'
        ? 'Cannot reach the API (network or CORS). Ensure the API is running, BACKEND_URL / NEXT_PUBLIC_API_BASE_URL matches it, and FRONTEND_URL in .env includes your browser origin (e.g. http://192.168.0.17:3000 if you use the network URL).'
        : e instanceof Error
          ? e.message
          : 'Failed to load items';
    throw new Error(msg);
  }
  if (!res.ok) {
    const text = await res.text();
    let detail: string;
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      const m = j.message;
      detail = Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : text || res.statusText;
    } catch {
      detail = text || res.statusText;
    }
    throw new Error(`Failed to load items (${res.status}): ${detail}`);
  }
  return res.json();
}

async function parseErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    const msg = json.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  } catch {
    // ignore
  }
  return text || `Request failed: ${res.status}`;
}

export async function createFolder(payload: CreateFolderPayload): Promise<Folder> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  return res.json();
}

export async function createDocument(
  payload: CreateDocumentPayload
): Promise<Document> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  return res.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

export async function updateFolder(
  id: number,
  payload: { name: string },
): Promise<Folder> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/folders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  return res.json();
}

export async function deleteFolder(id: number): Promise<void> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/folders/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

export async function updateDocument(
  id: number,
  payload: { title: string },
): Promise<Document> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/documents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  return res.json();
}

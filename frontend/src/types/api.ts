export interface Folder {
    id: number;
    name: string;
    parentId: number | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
    kind: 'folder';
}

export interface Document {
    id: number;
    title: string;
    description?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    folderId: number | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
    kind: 'document';
}

export type ItemsSortBy = 'name' | 'createdAt' | 'size' | 'type';

export interface FolderItem {
    kind: 'folder';
    id: number;
    name: string;
    parentId: number | null;
    createdAt: string;
    createdBy: string | null,
    updatedAt: string;
}

export interface DocumentItem {
    kind: 'document';
    id: number;
    folderId: number | null;
    title: string;
    description: string | null;
    fileName: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export type ListItem = FolderItem | DocumentItem;


export interface CreateFolderPayload {
    name: string;
    parentId?: number | null;
}

export interface CreateDocumentPayload {
    title: string;
    folderId?: number | null;
    description?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    createdBy: string | null
}

export interface PaginatedItemsResponse {
    items: ListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

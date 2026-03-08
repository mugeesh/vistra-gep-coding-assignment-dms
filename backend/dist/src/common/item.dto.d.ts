export type ItemsSortBy = 'name' | 'createdAt' | 'size' | 'type';
export type ListItem = FolderItem | DocumentItem;
export interface PaginatedItemsResult {
    items: ListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface ListItemsOptions {
    parentId: number | null;
    page: number;
    pageSize: number;
    sortBy: ItemsSortBy;
    sortOrder: 'asc' | 'desc';
    search?: string;
    globalSearch?: boolean;
}
export declare class FolderItem {
    kind: 'folder';
    id: number;
    name: string;
    createdBy: string | null;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
}
export declare class DocumentItem {
    kind: 'document';
    id: number;
    folderId: number | null;
    title: string;
    description?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare class PaginatedItems {
    items: (FolderItem | DocumentItem)[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

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

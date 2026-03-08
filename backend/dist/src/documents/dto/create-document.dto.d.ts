export declare class CreateDocumentDto {
    title: string;
    description?: string;
    folderId?: number | null;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    createdBy: string;
}

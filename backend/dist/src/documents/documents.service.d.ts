import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByFolderId(folderId: number | null): Promise<{
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        title: string;
        description: string | null;
        folderId: number | null;
        fileName: string | null;
        mimeType: string | null;
        sizeBytes: number;
    }[]>;
    createDocument(input: {
        title: string;
        folderId: number | null;
        description?: string;
        fileName?: string;
        mimeType?: string;
        sizeBytes?: number;
        createdBy?: string;
    }): Promise<{
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        title: string;
        description: string | null;
        folderId: number | null;
        fileName: string | null;
        mimeType: string | null;
        sizeBytes: number;
    }>;
    update(id: number, input: {
        title: string;
    }): Promise<{
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        title: string;
        description: string | null;
        folderId: number | null;
        fileName: string | null;
        mimeType: string | null;
        sizeBytes: number;
    }>;
    delete(id: number): Promise<void>;
}

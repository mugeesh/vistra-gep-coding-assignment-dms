import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    findAll(folderId?: number): Promise<{
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
    create(dto: CreateDocumentDto): Promise<{
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
    update(id: number, dto: UpdateDocumentDto): Promise<{
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
    remove(id: number): Promise<void>;
}

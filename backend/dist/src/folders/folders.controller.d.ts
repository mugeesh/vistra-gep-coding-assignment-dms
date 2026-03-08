import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FoldersService } from './folders.service';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    findAll(parentId?: number): Promise<{
        parentId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    create(dto: CreateFolderDto): Promise<{
        parentId: number | null;
        name: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, dto: UpdateFolderDto): Promise<{
        parentId: number | null;
        name: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}

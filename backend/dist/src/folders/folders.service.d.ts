import { PrismaService } from '../prisma/prisma.service';
export declare class FoldersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllByParent(parentId: number | null): Promise<{
        parentId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    create(input: {
        name: string;
        parentId: number | null;
        createdBy: string | '-';
    }): Promise<{
        parentId: number | null;
        name: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, input: {
        name: string;
    }): Promise<{
        parentId: number | null;
        name: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<void>;
}

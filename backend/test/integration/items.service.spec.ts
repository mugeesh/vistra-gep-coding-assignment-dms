import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import {ItemsService} from "../../src/items/items.service";
import {PrismaService} from "../../src/prisma/prisma.service";
import {ListItem, ListItemsOptions, PaginatedItems} from "../../src/common/item.dto";

describe('ItemsService', () => {
    let service: ItemsService;
    let prismaMock: ReturnType<typeof mockDeep<PrismaClient>>;

    beforeEach(async () => {
        prismaMock = mockDeep<PrismaClient>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<ItemsService>(ItemsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll - basic folder listing (no search)', () => {
        it('should return folders and documents from specific parentId', async () => {
            // Mock Prisma responses
            prismaMock.folder.findMany.mockResolvedValue([
                { id: 1, name: 'HR', parentId: null, createdAt: new Date(), updatedAt: new Date() },
            ]);

            prismaMock.document.findMany.mockResolvedValue([
                {
                    id: 10,
                    folderId: null,
                    title: 'Handbook',
                    description: null,
                    fileName: 'handbook.pdf',
                    mimeType: 'pdf',
                    sizeBytes: 5000,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            const options: ListItemsOptions = {
                parentId: null,
                page: 1,
                pageSize: 10,
                sortBy: 'name',
                sortOrder: 'asc',
                search: undefined,
                globalSearch: false,
            };

            const result = await service.findAll(options);

            expect(result).toMatchObject<PaginatedItems>({
                items: expect.arrayContaining<ListItem>([
                    expect.objectContaining({ kind: 'folder', name: 'HR' }),
                    expect.objectContaining({ kind: 'document', title: 'Handbook' }),
                ]),
                total: 2,
                page: 1,
                pageSize: 10,
                totalPages: 1,
            });

            expect(prismaMock.folder.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { parentId: null },
                }),
            );
        });
    });

    describe('findAll - local search (non-global)', () => {
        it('should filter items client-side when search is provided and globalSearch=false', async () => {
            // Mock returns more items than needed
            prismaMock.folder.findMany.mockResolvedValue([
                { id: 1, name: 'HR Documents', parentId: null, createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: 'Finance', parentId: null, createdAt: new Date(), updatedAt: new Date() },
            ]);

            prismaMock.document.findMany.mockResolvedValue([]);

            const options: ListItemsOptions = {
                parentId: null,
                page: 1,
                pageSize: 10,
                sortBy: 'name',
                sortOrder: 'asc',
                search: 'doc',
                globalSearch: false, // ← local search → client-side filter
            };

            const result = await service.findAll(options);

            // Only "HR Documents" should match
            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toMatchObject({ name: 'HR Documents' });
            expect(result.total).toBe(1);
        });
    });

    it('should return only matching items in global search', async () => {
        // Mock Prisma to return ONLY matching records
        prismaMock.folder.findMany.mockResolvedValue([]); // No folders match "secret"

        prismaMock.document.findMany.mockResolvedValue([
            {
                id: 20,
                folderId: 3,
                title: 'Secret Plan',
                description: null,
                fileName: 'plan.pdf',
                mimeType: 'pdf',
                sizeBytes: 1000,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const options: ListItemsOptions = {
            parentId: 999, // ignored in global search
            page: 1,
            pageSize: 5,
            sortBy: 'name',
            sortOrder: 'asc',
            search: 'secret',
            globalSearch: true,
        };

        const result = await service.findAll(options);

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
            kind: 'document',
            title: 'Secret Plan',
        });
        expect(result.total).toBe(1);
    });

});

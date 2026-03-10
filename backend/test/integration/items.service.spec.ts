import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { ItemsService } from '../../src/items/items.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  ListItem,
  ListItemsOptions,
  PaginatedItems,
} from '../../src/common/item.dto';

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

  describe('findAll', () => {
    const defaultOptions: ListItemsOptions = {
      parentId: null,
      page: 1,
      pageSize: 10,
      sortBy: 'name',
      sortOrder: 'asc',
      search: undefined,
      globalSearch: false,
    };

    it('should return folders and documents from specific parentId (no search)', async () => {
      prismaMock.folder.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'HR',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
        },
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
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.findAll(defaultOptions);

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
      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { folderId: null },
        }),
      );
    });

    it('should filter items client-side when local search is provided (globalSearch = false)', async () => {
      prismaMock.folder.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'HR Documents',
          parentId: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Finance',
          parentId: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      prismaMock.document.findMany.mockResolvedValue([]);

      const result = await service.findAll({
        ...defaultOptions,
        search: 'doc',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ name: 'HR Documents' });
      expect(result.total).toBe(1);
    });

    describe('global search (globalSearch = true)', () => {
      it('should return only matching documents across hierarchy', async () => {
        prismaMock.folder.findMany.mockResolvedValue([]);
        prismaMock.document.findMany.mockResolvedValue([
          {
            id: 20,
            folderId: 3,
            title: 'Secret Plan',
            description: null,
            createdBy: null,
            fileName: 'plan.pdf',
            mimeType: 'pdf',
            sizeBytes: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        const result = await service.findAll({
          ...defaultOptions,
          parentId: 999, // irrelevant in global mode
          search: 'secret',
          globalSearch: true,
          pageSize: 5,
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
          kind: 'document',
          title: 'Secret Plan',
        });
        expect(result.total).toBe(1);
      });
    });
  });
});

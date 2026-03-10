import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ItemsController } from '../../src/items/items.controller';
import { ItemsService } from '../../src/items/items.service';
import { PaginatedItemsResult } from '../../src/common/item.dto';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockPaginatedResult: PaginatedItemsResult = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  const mockItemsService = {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call itemsService.findAll with default values when query is empty', async () => {
      const query = {};
      await controller.findAll(query as any);

      expect(service.findAll).toHaveBeenCalledWith({
        parentId: null,
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: undefined,
        globalSearch: false,
      });
    });

    it('should pass query parameters correctly to the service', async () => {
      const query = {
        parentId: 5,
        page: 2,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'test-query',
        globalSearch: true,
      };

      const result = await controller.findAll(query as any);

      expect(service.findAll).toHaveBeenCalledWith({
        parentId: 5,
        page: 2,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'test-query',
        globalSearch: true,
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('DB Error'));

      await expect(controller.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

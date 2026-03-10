import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { PaginatedItems } from '../common/item.dto';
import { ListItemsQueryDto } from '../common/list-items-query.dto';

const MAX_SEARCH_LENGTH = 200;

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@Query() query: ListItemsQueryDto): Promise<PaginatedItems> {
    try {
      return await this.itemsService.findAll({
        parentId: query.parentId ?? null,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
        sortBy: query.sortBy ?? 'name',
        sortOrder: query.sortOrder ?? 'asc',
        search: query.search
          ? query.search.trim().slice(0, MAX_SEARCH_LENGTH)
          : undefined,
        globalSearch: query.globalSearch ?? false,
      });
    } catch (err) {
      console.error('[ItemsController.findAll]', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Failed to retrieve items',
      );
    }
  }
}

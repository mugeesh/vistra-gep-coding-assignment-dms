import { ItemsService } from './items.service';
import { PaginatedItems } from "../common/item.dto";
import { ListItemsQueryDto } from "../common/list-items-query.dto";
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    findAll(query: ListItemsQueryDto): Promise<PaginatedItems>;
}

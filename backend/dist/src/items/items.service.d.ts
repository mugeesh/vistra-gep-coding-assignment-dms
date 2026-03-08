import { PrismaService } from '../prisma/prisma.service';
import { ListItemsOptions, PaginatedItemsResult } from '../common/item.dto';
export declare class ItemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(options: ListItemsOptions): Promise<PaginatedItemsResult>;
}

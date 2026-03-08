import { ItemsSortBy } from "./item.dto";
export declare class ListItemsQueryDto {
    parentId?: number;
    page?: number;
    pageSize?: number;
    sortBy?: ItemsSortBy;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    globalSearch?: boolean;
}

// dto/list-items-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {ItemsSortBy} from "./item.dto";

export class ListItemsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    parentId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

    @IsOptional()
    @IsEnum(['name', 'createdAt', 'size', 'type'])
    sortBy?: ItemsSortBy = 'name';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'asc';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Boolean)
    globalSearch?: boolean = false;
}

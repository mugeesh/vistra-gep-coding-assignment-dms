import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemsSortBy } from './item.dto';

export class ListItemsQueryDto {
  @ApiPropertyOptional({
    description: 'Parent item ID (for nested items)',
    example: 42,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['name', 'createdAt', 'size', 'type'],
    example: 'name',
    default: 'name',
  })
  @IsOptional()
  @IsEnum(['name', 'createdAt', 'size', 'type'])
  sortBy?: ItemsSortBy = 'name';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'invoice',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Search across all levels (not just current folder)',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  globalSearch?: boolean = false;
}

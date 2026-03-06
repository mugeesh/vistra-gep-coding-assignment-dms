// src/common/dto/item.dto.ts

import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';

export type ItemsSortBy = 'name' | 'createdAt' | 'size' | 'type';
export type ListItem = FolderItem | DocumentItem;

export interface PaginatedItemsResult {
    items: ListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ListItemsOptions {
    parentId: number | null;
    page: number;
    pageSize: number;
    sortBy: ItemsSortBy;
    sortOrder: 'asc' | 'desc';
    search?: string;
    globalSearch?: boolean;
}

export class FolderItem {
    @ApiProperty({ enum: ['folder'], example: 'folder' })
    kind: 'folder';

    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Documents' })
    name: string;

    @ApiPropertyOptional({ example: null })
    parentId: number | null;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
    updatedAt: string;
}

export class DocumentItem {
    @ApiProperty({ enum: ['document'], example: 'document' })
    kind: 'document';

    @ApiProperty({ example: 42 })
    id: number;

    @ApiPropertyOptional({ example: 5 })
    folderId: number | null;

    @ApiProperty({ example: 'Project Plan' })
    title: string;

    @ApiPropertyOptional({ example: 'Q1 roadmap' })
    description?: string | null;

    @ApiPropertyOptional({ example: 'plan.pdf' })
    fileName?: string | null;

    @ApiPropertyOptional({ example: 'application/pdf' })
    mimeType?: string | null;

    @ApiPropertyOptional({ example: 102400 })
    sizeBytes?: number | null;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
    updatedAt: string;
}

export class PaginatedItems {
    @ApiProperty({
        type: 'array',
        items: {
            oneOf: [
                { $ref: getSchemaPath(FolderItem) },
                { $ref: getSchemaPath(DocumentItem) },
            ],
        },
        description: 'List of items – each has "kind": "folder" or "document"',
    })
    items: (FolderItem | DocumentItem)[];

    @ApiProperty({ example: 84 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 20 })
    pageSize: number;

    @ApiProperty({ example: 5 })
    totalPages: number;
}

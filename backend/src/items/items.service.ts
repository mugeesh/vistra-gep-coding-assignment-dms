import { Injectable } from '@nestjs/common';
import { Document, Folder } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DocumentItem,
  FolderItem,
  ListItem,
  ItemsSortBy,
  ListItemsOptions,
  PaginatedItemsResult,
} from '../common/item.dto';

function matchesSearchTerm(item: ListItem, term: string): boolean {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  if (item.kind === 'folder') {
    return item.name.toLowerCase().includes(query);
  }

  const title = item.title?.toLowerCase() ?? '';
  const fileName = item.fileName?.toLowerCase() ?? '';
  return title.includes(query) || fileName.includes(query);
}

function compareBy(
  a: ListItem,
  b: ListItem,
  sortBy: ItemsSortBy,
  order: 'asc' | 'desc',
): number {
  const direction = order === 'asc' ? 1 : -1;

  if (sortBy === 'name') {
    const nameA = a.kind === 'folder' ? a.name : (a.title ?? a.fileName ?? '');
    const nameB = b.kind === 'folder' ? b.name : (b.title ?? b.fileName ?? '');
    return (
      direction * nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
    );
  }

  if (sortBy === 'createdAt') {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return direction * (timeA - timeB);
  }

  if (sortBy === 'size') {
    const sizeA = a.kind === 'document' ? (a.sizeBytes ?? 0) : 0;
    const sizeB = b.kind === 'document' ? (b.sizeBytes ?? 0) : 0;
    return direction * (sizeA - sizeB);
  }

  if (sortBy === 'type') {
    const typeA = a.kind === 'folder' ? 'Folder' : (a.mimeType ?? '');
    const typeB = b.kind === 'folder' ? 'Folder' : (b.mimeType ?? '');
    return (
      direction * typeA.localeCompare(typeB, undefined, { sensitivity: 'base' })
    );
  }

  return 0;
}

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: ListItemsOptions): Promise<PaginatedItemsResult> {
    const {
      parentId,
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
      globalSearch,
    } = options;
    const isGlobalSearch = Boolean(globalSearch && search?.trim());
    const searchTerm = search?.trim() ?? '';

    let folders: Folder[];
    let documents: Document[];

    if (isGlobalSearch && searchTerm) {
      [folders, documents] = await Promise.all([
        this.prisma.folder.findMany({
          where: { name: { contains: searchTerm } },
          select: {
            id: true,
            name: true,
            createdBy: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.document.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm } },
              { fileName: { contains: searchTerm } },
              { description: { contains: searchTerm } },
            ],
          },
          select: {
            id: true,
            folderId: true,
            title: true,
            description: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
      ]);
    } else {
      [folders, documents] = await Promise.all([
        this.prisma.folder.findMany({
          where: { parentId },
          select: {
            id: true,
            name: true,
            createdBy: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.document.findMany({
          where: { folderId: parentId },
          select: {
            id: true,
            folderId: true,
            title: true,
            description: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
      ]);
    }

    const folderToItem = (f: Folder): FolderItem => ({
      kind: 'folder',
      id: f.id,
      name: f.name,
      createdBy: f.createdBy,
      parentId: f.parentId,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    });

    const documentToItem = (d: Document): DocumentItem => ({
      kind: 'document',
      id: d.id,
      folderId: d.folderId,
      title: d.title,
      description: d.description,
      fileName: d.fileName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      createdBy: d.createdBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    });

    let items: ListItem[] = [
      ...folders.map(folderToItem),
      ...documents.map(documentToItem),
    ];

    // Apply local search filter
    if (!isGlobalSearch && searchTerm) {
      items = items.filter((item) => matchesSearchTerm(item, searchTerm));
    }

    // Sort items
    items.sort((a, b) => compareBy(a, b, sortBy, sortOrder));

    // Pagination
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const skip = (currentPage - 1) * pageSize;
    const paginatedItems = items.slice(skip, skip + pageSize);

    return {
      items: paginatedItems,
      total,
      page: currentPage,
      pageSize,
      totalPages,
    };
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function matchesSearchTerm(item, term) {
    const query = term.trim().toLowerCase();
    if (!query)
        return true;
    if (item.kind === 'folder') {
        return item.name.toLowerCase().includes(query);
    }
    const title = item.title?.toLowerCase() ?? '';
    const fileName = item.fileName?.toLowerCase() ?? '';
    return title.includes(query) || fileName.includes(query);
}
function compareBy(a, b, sortBy, order) {
    const direction = order === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
        const nameA = a.kind === 'folder' ? a.name : (a.title ?? a.fileName ?? '');
        const nameB = b.kind === 'folder' ? b.name : (b.title ?? b.fileName ?? '');
        return direction * nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
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
        return direction * typeA.localeCompare(typeB, undefined, { sensitivity: 'base' });
    }
    return 0;
}
let ItemsService = class ItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        const { parentId, page, pageSize, sortBy, sortOrder, search, globalSearch } = options;
        const isGlobalSearch = Boolean(globalSearch && search?.trim());
        const searchTerm = search?.trim() ?? '';
        let folders;
        let documents;
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
        }
        else {
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
        const folderToItem = (f) => ({
            kind: 'folder',
            id: f.id,
            name: f.name,
            createdBy: f.createdBy,
            parentId: f.parentId,
            createdAt: f.createdAt.toISOString(),
            updatedAt: f.updatedAt.toISOString(),
        });
        const documentToItem = (d) => ({
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
        let items = [
            ...folders.map(folderToItem),
            ...documents.map(documentToItem),
        ];
        if (!isGlobalSearch && searchTerm) {
            items = items.filter((item) => matchesSearchTerm(item, searchTerm));
        }
        items.sort((a, b) => compareBy(a, b, sortBy, sortOrder));
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
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItemsService);
//# sourceMappingURL=items.service.js.map
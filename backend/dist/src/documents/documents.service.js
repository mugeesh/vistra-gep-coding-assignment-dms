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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listByFolderId(folderId) {
        return this.prisma.document.findMany({
            where: { folderId },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    async createDocument(input) {
        if (input.folderId !== null) {
            const folder = await this.prisma.folder.findUnique({
                where: { id: input.folderId },
                select: { id: true },
            });
            if (!folder) {
                throw new common_1.BadRequestException('folderId does not exist.');
            }
        }
        return this.prisma.document.create({
            data: {
                title: input.title,
                folderId: input.folderId,
                description: input.description,
                fileName: input.fileName,
                mimeType: input.mimeType,
                sizeBytes: input.sizeBytes,
                createdBy: input.createdBy,
            },
        });
    }
    async update(id, input) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!doc) {
            throw new common_1.BadRequestException('Document not found.');
        }
        return this.prisma.document.update({
            where: { id },
            data: { title: input.title.trim() },
        });
    }
    async delete(id) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!doc) {
            throw new common_1.BadRequestException('Document not found.');
        }
        await this.prisma.document.delete({ where: { id } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map
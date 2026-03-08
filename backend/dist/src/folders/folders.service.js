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
exports.FoldersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FoldersService = class FoldersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByParent(parentId) {
        return this.prisma.folder.findMany({
            where: { parentId },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            select: {
                id: true,
                name: true,
                parentId: true,
                createdAt: true,
                updatedAt: true
            },
        });
    }
    async create(input) {
        if (input.parentId !== null) {
            const parent = await this.prisma.folder.findUnique({
                where: { id: input.parentId },
                select: { id: true },
            });
            if (!parent) {
                throw new common_1.BadRequestException('parentId does not exist.');
            }
        }
        return this.prisma.folder.create({
            data: {
                name: input.name,
                parentId: input.parentId,
                createdBy: input.createdBy,
            },
        });
    }
    async update(id, input) {
        const folder = await this.prisma.folder.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!folder) {
            throw new common_1.BadRequestException('Folder not found.');
        }
        return this.prisma.folder.update({
            where: { id },
            data: { name: input.name.trim() },
        });
    }
    async remove(id) {
        const exists = await this.prisma.folder.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException('Folder not found');
        }
        await this.prisma.folder.delete({ where: { id } });
    }
};
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoldersService);
//# sourceMappingURL=folders.service.js.map
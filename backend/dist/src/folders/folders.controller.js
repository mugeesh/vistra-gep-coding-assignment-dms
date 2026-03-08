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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const update_folder_dto_1 = require("./dto/update-folder.dto");
const folders_service_1 = require("./folders.service");
let FoldersController = class FoldersController {
    foldersService;
    constructor(foldersService) {
        this.foldersService = foldersService;
    }
    async findAll(parentId) {
        return this.foldersService.findAllByParent(parentId ?? null);
    }
    async create(dto) {
        try {
            return await this.foldersService.create({
                name: dto.name,
                parentId: dto.parentId ?? null,
                createdBy: dto.createdBy ?? '-',
            });
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            console.error('[FoldersController.create]', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Failed to create folder');
        }
    }
    async update(id, dto) {
        try {
            return await this.foldersService.update(id, { name: dto.name });
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            console.error('[FoldersController.update]', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Failed to update folder');
        }
    }
    async remove(id) {
        try {
            await this.foldersService.remove(id);
            return { message: 'Folder deleted successfully' };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            console.error('[FoldersController.delete]', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Failed to delete folder');
        }
    }
};
exports.FoldersController = FoldersController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('parentId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_folder_dto_1.UpdateFolderDto]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "remove", null);
exports.FoldersController = FoldersController = __decorate([
    (0, common_1.Controller)('folders'),
    __metadata("design:paramtypes", [folders_service_1.FoldersService])
], FoldersController);
//# sourceMappingURL=folders.controller.js.map
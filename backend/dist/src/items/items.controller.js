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
exports.ItemsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const items_service_1 = require("./items.service");
const list_items_query_dto_1 = require("../common/list-items-query.dto");
const MAX_SEARCH_LENGTH = 200;
let ItemsController = class ItemsController {
    itemsService;
    constructor(itemsService) {
        this.itemsService = itemsService;
    }
    async findAll(query) {
        try {
            return await this.itemsService.findAll({
                parentId: query.parentId ?? null,
                page: query.page ?? 1,
                pageSize: query.pageSize ?? 10,
                sortBy: query.sortBy ?? 'name',
                sortOrder: query.sortOrder ?? 'asc',
                search: query.search
                    ? query.search.trim().slice(0, MAX_SEARCH_LENGTH)
                    : undefined,
                globalSearch: query.globalSearch ?? false,
            });
        }
        catch (err) {
            console.error('[ItemsController.findAll]', err);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : 'Failed to retrieve items');
        }
    }
};
exports.ItemsController = ItemsController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("../common/item.dto").PaginatedItems }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_items_query_dto_1.ListItemsQueryDto]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "findAll", null);
exports.ItemsController = ItemsController = __decorate([
    (0, common_1.Controller)('items'),
    __metadata("design:paramtypes", [items_service_1.ItemsService])
], ItemsController);
//# sourceMappingURL=items.controller.js.map
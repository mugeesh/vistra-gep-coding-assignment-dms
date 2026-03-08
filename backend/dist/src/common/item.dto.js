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
exports.PaginatedItems = exports.DocumentItem = exports.FolderItem = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class FolderItem {
    kind;
    id;
    name;
    createdBy;
    parentId;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { kind: { required: true, type: () => String }, id: { required: true, type: () => Number }, name: { required: true, type: () => String }, createdBy: { required: true, type: () => String, nullable: true }, parentId: { required: true, type: () => Number, nullable: true }, createdAt: { required: true, type: () => String }, updatedAt: { required: true, type: () => String } };
    }
}
exports.FolderItem = FolderItem;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['folder'], example: 'folder' }),
    __metadata("design:type", String)
], FolderItem.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], FolderItem.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Documents' }),
    __metadata("design:type", String)
], FolderItem.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Green' }),
    __metadata("design:type", String)
], FolderItem.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Number)
], FolderItem.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], FolderItem.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-02T00:00:00.000Z' }),
    __metadata("design:type", String)
], FolderItem.prototype, "updatedAt", void 0);
class DocumentItem {
    kind;
    id;
    folderId;
    title;
    description;
    fileName;
    mimeType;
    sizeBytes;
    createdBy;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { kind: { required: true, type: () => String }, id: { required: true, type: () => Number }, folderId: { required: true, type: () => Number, nullable: true }, title: { required: true, type: () => String }, description: { required: false, type: () => String, nullable: true }, fileName: { required: false, type: () => String, nullable: true }, mimeType: { required: false, type: () => String, nullable: true }, sizeBytes: { required: false, type: () => Number, nullable: true }, createdBy: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => String }, updatedAt: { required: true, type: () => String } };
    }
}
exports.DocumentItem = DocumentItem;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['document'], example: 'document' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42 }),
    __metadata("design:type", Number)
], DocumentItem.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    __metadata("design:type", Number)
], DocumentItem.prototype, "folderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Project Plan' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Q1 roadmap' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'plan.pdf' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'application/pdf' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 102400 }),
    __metadata("design:type", Number)
], DocumentItem.prototype, "sizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Green' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], DocumentItem.prototype, "updatedAt", void 0);
class PaginatedItems {
    items;
    total;
    page;
    pageSize;
    totalPages;
    static _OPENAPI_METADATA_FACTORY() {
        return { items: { required: true, type: () => [Object] }, total: { required: true, type: () => Number }, page: { required: true, type: () => Number }, pageSize: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number } };
    }
}
exports.PaginatedItems = PaginatedItems;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        items: {
            oneOf: [
                { $ref: (0, swagger_1.getSchemaPath)(FolderItem) },
                { $ref: (0, swagger_1.getSchemaPath)(DocumentItem) },
            ],
        },
        description: 'List of items – each has "kind": "folder" or "document"',
    }),
    __metadata("design:type", Array)
], PaginatedItems.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 84 }),
    __metadata("design:type", Number)
], PaginatedItems.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], PaginatedItems.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], PaginatedItems.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PaginatedItems.prototype, "totalPages", void 0);
//# sourceMappingURL=item.dto.js.map
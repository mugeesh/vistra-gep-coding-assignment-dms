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
exports.CreateFolderDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const NAME_MAX_LENGTH = 191;
class CreateFolderDto {
    name;
    parentId;
    createdBy;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, parentId: { required: false, type: () => Number, nullable: true }, createdBy: { required: false, type: () => String, nullable: true } };
    }
}
exports.CreateFolderDto = CreateFolderDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.MaxLength)(NAME_MAX_LENGTH),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'parentId must be a valid integer' }),
    (0, class_validator_1.Min)(1, { message: 'parentId must be a positive integer starting from 1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateFolderDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(NAME_MAX_LENGTH),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "createdBy", void 0);
//# sourceMappingURL=create-folder.dto.js.map
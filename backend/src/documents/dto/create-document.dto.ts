import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

const MAX_STRING_LENGTH = 191; // consistent name, utf8mb4 index limit

export class CreateDocumentDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(MAX_STRING_LENGTH)
    title!: string;

    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @MaxLength(MAX_STRING_LENGTH)
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'folderId must be a positive integer' })
    @Min(1, { message: 'folderId must be ≥ 1' })
    folderId?: number | null;

    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty()
    @IsString()
    @MaxLength(MAX_STRING_LENGTH)
    fileName?: string;

    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @MaxLength(100)
    mimeType?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sizeBytes?: number;

    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsOptional()
    @MaxLength(MAX_STRING_LENGTH)
    createdBy!: string;
}

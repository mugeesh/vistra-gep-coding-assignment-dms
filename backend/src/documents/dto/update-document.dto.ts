import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const MAX_STRING_LENGTH = 191;

export class UpdateDocumentDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_STRING_LENGTH)
    title!: string;
}

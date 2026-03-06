import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min} from 'class-validator';
import {Transform, Type} from 'class-transformer';

const NAME_MAX_LENGTH = 191;

export class CreateFolderDto {
    @Transform(({value}) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(NAME_MAX_LENGTH)
    name!: string;

    @IsOptional()
    @IsInt({message: 'parentId must be a valid integer'})
    @Min(1, {message: 'parentId must be a positive integer starting from 1'})
    @Type(() => Number)
    parentId?: number | null;
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const NAME_MAX_LENGTH = 191;

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : (value as string);
}

export class UpdateFolderDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;
}

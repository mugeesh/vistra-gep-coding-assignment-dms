import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  async findAll(
    @Query('parentId', new ParseIntPipe({ optional: true })) parentId?: number,
  ) {
    return this.foldersService.findAllByParent(parentId ?? null);
  }

  @Post()
  async create(@Body() dto: CreateFolderDto) {
    try {
      return await this.foldersService.create({
        name: dto.name,
        parentId: dto.parentId ?? null,
        createdBy: dto.createdBy ?? '-',
      });
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      console.error('[FoldersController.create]', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Failed to create folder',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFolderDto,
  ) {
    try {
      return await this.foldersService.update(id, { name: dto.name });
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      console.error('[FoldersController.update]', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Failed to update folder',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.foldersService.remove(id);
      // Optional: return success message or empty 204
      return { message: 'Folder deleted successfully' };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      console.error('[FoldersController.delete]', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Failed to delete folder',
      );
    }
  }
}

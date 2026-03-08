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
import {CreateDocumentDto} from './dto/create-document.dto';
import {UpdateDocumentDto} from './dto/update-document.dto';
import {DocumentsService} from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {
    }

    @Get()
    async findAll(
        @Query('folderId', new ParseIntPipe({optional: true}))
        folderId?: number,
    ) {
        return this.documentsService.listByFolderId(folderId ?? null);
    }

    @Post()
    async create(@Body() dto: CreateDocumentDto) {
        try {
            return await this.documentsService.createDocument({
                title: dto.title,
                folderId: dto.folderId ?? null,
                description: dto.description,
                fileName: dto.fileName,
                mimeType: dto.mimeType,
                sizeBytes: dto.sizeBytes,
                createdBy: dto.createdBy,
            });
        } catch (err) {
            if (err instanceof BadRequestException) throw err;
            console.error('[DocumentsController.create]', err);
            throw new InternalServerErrorException();
        }
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDocumentDto,
    ) {
        try {
            return await this.documentsService.update(id, {title: dto.title});
        } catch (err) {
            if (err instanceof BadRequestException) throw err;
            console.error('[DocumentsController.update]', err);
            throw new InternalServerErrorException();
        }
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.documentsService.delete(id);
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            console.error('[DocumentsController.remove]', err);
            throw new InternalServerErrorException();
        }
    }
}

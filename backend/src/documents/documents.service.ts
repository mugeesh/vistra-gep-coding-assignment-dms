import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByFolderId(folderId: number | null) {
    return this.prisma.document.findMany({
      where: { folderId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async create(input: {
    title: string;
    folderId: number | null;
    description?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  }) {
    if (input.folderId !== null) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: input.folderId },
        select: { id: true },
      });
      if (!folder) {
        throw new BadRequestException('folderId does not exist.');
      }
    }

    return this.prisma.document.create({
      data: {
        title: input.title,
        folderId: input.folderId,
        description: input.description,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      },
    });
  }

  async update(id: number, input: { title: string }) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!doc) {
      throw new BadRequestException('Document not found.');
    }
    return this.prisma.document.update({
      where: { id },
      data: { title: input.title.trim() },
    });
  }

  async delete(id: number) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!doc) {
      throw new BadRequestException('Document not found.');
    }
    await this.prisma.document.delete({ where: { id } });
  }
}


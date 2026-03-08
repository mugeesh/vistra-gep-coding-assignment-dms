import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

    async findAllByParent(parentId: number | null) {
        return this.prisma.folder.findMany({
            where: { parentId },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            select: {
                id: true,
                name: true,
                parentId: true,
                createdAt: true,
                updatedAt: true
            },
        });
    }

  async create(input: { name: string; parentId: number | null;  createdBy: string | null }) {
    if (input.parentId !== null) {
      const parent = await this.prisma.folder.findUnique({
        where: { id: input.parentId },
        select: { id: true },
      });
      if (!parent) {
        throw new BadRequestException('parentId does not exist.');
      }
    }

    return this.prisma.folder.create({
      data: {
        name: input.name,
        parentId: input.parentId,
        createdBy: input.createdBy,
      },
    });
  }

  async update(id: number, input: { name: string }) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!folder) {
      throw new BadRequestException('Folder not found.');
    }
    return this.prisma.folder.update({
      where: { id },
      data: { name: input.name.trim() },
    });
  }

    async remove(id: number): Promise<void> {
        const exists = await this.prisma.folder.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!exists) {
            throw new NotFoundException('Folder not found');
        }

        await this.prisma.folder.delete({ where: { id } });
    }
}


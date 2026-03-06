
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { FoldersModule } from './folders/folders.module';
import { DocumentsModule } from './documents/documents.module';
import { ItemsModule } from './items/items.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Core modules
        PrismaModule,
        FoldersModule,
        DocumentsModule,
        ItemsModule,
    ],
})
export class AppModule {}

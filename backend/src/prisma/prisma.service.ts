import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {PrismaMariaDb} from '@prisma/adapter-mariadb';

function getDatabaseConfigFromUrl(databaseUrl: string) {
    const url = new URL(databaseUrl);
    const database = url.pathname.replace(/^\//, '');

    if (!database) {
        throw new Error('DATABASE_URL must include a database name');
    }

    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database,
    };
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error(
                'DATABASE_URL is missing. Ensure apps/api/.env.example is set (see .env.example.example).',
            );
        }

        const db = getDatabaseConfigFromUrl(databaseUrl);
        const adapter = new PrismaMariaDb({
            host: db.host,
            port: db.port,
            user: db.user,
            password: db.password,
            database: db.database,
            connectionLimit: 5,
            allowPublicKeyRetrieval: true,
        });

        super({adapter});
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

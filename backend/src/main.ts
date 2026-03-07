import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';
import helmet from 'helmet';

const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 25;
const SWAGGER_PATH = 'api/docs';
const BODY_LIMIT = '256kb';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function getCorsOrigin() {
    if (process.env.NODE_ENV !== 'production') {
        return true; // Allow all in dev (simpler & safer than callback)
    }

    const frontendUrls = (process.env.FRONTEND_URL || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);

    return [...new Set([...DEFAULT_CORS_ORIGINS, ...frontendUrls])];
}

function setupSwagger(app: NestExpressApplication, port: number) {
    const config = new DocumentBuilder()
        .setTitle('Documents Management System API(Vistra GEP Coding Assignment)')
        .setDescription('API for managing documents and folders')
        .setVersion('1.0')
        .addTag('documents', 'Document management endpoints')
        .addTag('folders', 'Folder management endpoints')
        .addServer(`http://localhost:${port}`, 'Local development')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'JWT-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(SWAGGER_PATH, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'DMS API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
        customfavIcon: 'https://nestjs.com/favicon.ico',
    });

    Logger.log(`Swagger UI available at http://localhost:${port}/${SWAGGER_PATH}`, 'Swagger');
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Security
    app.use(
        helmet({
            contentSecurityPolicy: process.env.NODE_ENV === 'production',
            crossOriginEmbedderPolicy: false,
        }),
    );

    // CORS
    app.enableCors({
        origin: getCorsOrigin(),
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
        credentials: false,
    });

    // Body parser
    app.useBodyParser('json', {limit: BODY_LIMIT});

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            stopAtFirstError: true,
        }),
    );

    // Swagger (dev or explicit enable)
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
        // Port will be set later
    }

    const logger = new Logger('Bootstrap');
    let port = Number(process.env.PORT) || DEFAULT_PORT;

    for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
        try {
            await app.listen(port);
            logger.log(`Application running on: http://localhost:${port}`);

            // Now setup Swagger with actual port
            if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
                setupSwagger(app, port);
            }

            return;
        } catch (err: any) {
            if (err.code === 'EADDRINUSE') {
                logger.warn(`Port ${port} in use, trying ${port + 1}...`);
                port += 1;
                continue;
            }
            logger.error(`Failed to start server: ${err.message}`);
            throw err;
        }
    }

    logger.error(`Could not find available port after ${MAX_PORT_ATTEMPTS} attempts`);
    process.exit(1);
}

bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
});

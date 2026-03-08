"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 25;
const SWAGGER_PATH = 'api/docs';
const BODY_LIMIT = '256kb';
const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
function getCorsOrigin() {
    if (process.env.NODE_ENV !== 'production') {
        return true;
    }
    const frontendUrls = (process.env.FRONTEND_URL || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);
    return [...new Set([...DEFAULT_CORS_ORIGINS, ...frontendUrls])];
}
function setupSwagger(app, port) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Documents Management System API(Vistra GEP Coding Assignment)')
        .setDescription('API for managing documents and folders')
        .setVersion('1.0')
        .addTag('documents', 'Document management endpoints')
        .addTag('folders', 'Folder management endpoints')
        .addServer(`http://localhost:${port}`, 'Local development')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(SWAGGER_PATH, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'DMS API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
        customfavIcon: 'https://nestjs.com/favicon.ico',
    });
    common_1.Logger.log(`Swagger UI available at http://localhost:${port}/${SWAGGER_PATH}`, 'Swagger');
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: false,
    }));
    app.enableCors({
        origin: getCorsOrigin(),
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
        credentials: false,
    });
    app.useBodyParser('json', { limit: BODY_LIMIT });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
    }));
    const logger = new common_1.Logger('Bootstrap');
    let port = Number(process.env.PORT) || DEFAULT_PORT;
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
        setupSwagger(app, port);
    }
    for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
        try {
            await app.listen(port);
            logger.log(`Application running on: http://localhost:${port}`);
            return;
        }
        catch (err) {
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
//# sourceMappingURL=main.js.map
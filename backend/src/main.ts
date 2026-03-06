import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const BODY_LIMIT = '256kb';
const SWAGGER_PATH = 'api/docs';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getCorsOrigin():
  | string
  | string[]
  | ((origin: string, cb: (err: Error | null, allow?: boolean) => void) => void) {
  if (process.env.NODE_ENV !== 'production') {
    return (_: string, cb: (err: Error | null, allow?: boolean) => void) => cb(null, true);
  }
  const fromEnv = FRONTEND_URL.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_CORS_ORIGINS, ...fromEnv])];
}

function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('Documents Management System API')
    .setDescription('API for managing documents and folders in the DMS system')
    .setVersion('1.0')
    .addTag('Documents', 'Document management endpoints')
    .addTag('Folders', 'Folder management endpoints')
    // .addTag('Health', 'Health check endpoints')
    .addServer(`http://localhost:${process.env.PORT ?? 3001}`, 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'DMS API Docs',
    customCss: '.swagger-ui .topbar { display: none }', // Optional: hide topbar
    customfavIcon: 'https://nestjs.com/favicon.ico',
  });

  Logger.log(`Swagger UI available at /${SWAGGER_PATH}`, 'Swagger');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: getCorsOrigin(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false,
  });

  // Body parser limit
  app.useBodyParser('json', { limit: BODY_LIMIT });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Setup Swagger documentation (only enable in non-production or always)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    setupSwagger(app);
  }

  const logger = new Logger('bootstrap');
  const basePort = Number(process.env.PORT ?? 3001);

  let lastError: unknown = null;
  for (let port = basePort; port < basePort + 25; port += 1) {
    try {
      await app.listen(port);
      logger.log(`Application is running on: http://localhost:${port}`);
      logger.log(`API Documentation available at: http://localhost:${port}/${SWAGGER_PATH}`);
      return;
    } catch (err: any) {
      lastError = err;
      if (err?.code === 'EADDRINUSE') {
        logger.warn(`Port ${port} is in use, trying next port...`);
        continue;
      }
      throw err;
    }
  }

  logger.error('Unable to find an available port');
  throw lastError;
}

bootstrap();

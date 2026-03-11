import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 5;
const SWAGGER_PATH = 'api/docs';
const BODY_LIMIT = '256kb';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function getCorsOrigin() {
  if (process.env.NODE_ENV !== 'production') return true;

  const frontendUrls = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_CORS_ORIGINS, ...frontendUrls])];
}

function setupSwagger(app: NestExpressApplication, port: number) {
  const config = new DocumentBuilder()
    .setTitle('Documents Management System API')
    .setDescription('API for managing documents and folders')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Local development')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'DMS API Docs',
  });

  Logger.log(
    `Swagger UI available at http://localhost:${port}/${SWAGGER_PATH}`,
    'Swagger',
  );
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- Middleware & Security ---
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: getCorsOrigin(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  app.useBodyParser('json', { limit: BODY_LIMIT });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // --- Port Logic ---
  let port = Number(process.env.PORT) || DEFAULT_PORT;
  let started = false;

  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
    try {
      // Try to start the server
      await app.listen(port);

      // ONLY setup Swagger after we know the port is locked in
      if (
        process.env.NODE_ENV !== 'production' ||
        process.env.ENABLE_SWAGGER === 'true'
      ) {
        setupSwagger(app, port);
      }

      logger.log(`Application successfully started on port: ${port}`);
      started = true;
      break;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'EADDRINUSE') {
          logger.warn(
            `Port ${port} is busy. Attempt ${attempt + 1}/${MAX_PORT_ATTEMPTS}...`,
          );
          port++;
          continue;
        }
      }
      throw err;
    }
  }

  if (!started) {
    logger.error(`Failed to start after ${MAX_PORT_ATTEMPTS} attempts.`);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});

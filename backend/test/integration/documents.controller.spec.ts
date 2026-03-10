import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { mockDeep } from 'jest-mock-extended';
import { DocumentsService } from '../../src/documents/documents.service';
import { DocumentsModule } from '../../src/documents/documents.module';
import { NestErrorResponse } from '../utils';

describe('DocumentsController (integration)', () => {
  let app: INestApplication;
  let documentsService: DocumentsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DocumentsModule],
    })
      .overrideProvider(DocumentsService)
      .useValue(mockDeep<DocumentsService>())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    documentsService = moduleFixture.get<DocumentsService>(DocumentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('POST /documents', () => {
    it('should create a new document with valid DTO', async () => {
      const createDto = {
        title: 'Monthly Report',
        description: 'Q1 financial summary',
        folderId: 5,
        fileName: 'report-q1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 524288,
      };

      const mockCreatedDocument = {
        id: 100,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'John Green',
      };

      jest
        .spyOn(documentsService, 'createDocument')
        .mockResolvedValue(mockCreatedDocument);

      const response = await request(app.getHttpServer())
        .post('/documents')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 100,
        title: 'Monthly Report',
        fileName: 'report-q1.pdf',
      });

      expect(documentsService.createDocument).toHaveBeenCalledWith({
        title: 'Monthly Report',
        description: 'Q1 financial summary',
        folderId: 5,
        fileName: 'report-q1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 524288,
      });
    });

    it('should create document at root level (folderId null)', async () => {
      const createDto = {
        title: 'Welcome Document',
        fileName: 'welcome.md',
        mimeType: 'text/markdown',
        sizeBytes: 2048,
      };

      const mockCreated = {
        id: 101,
        ...createDto,
        folderId: null,
        description: null,
        createdBy: 'John Green',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(documentsService, 'createDocument')
        .mockResolvedValue(mockCreated);

      await request(app.getHttpServer())
        .post('/documents')
        .send(createDto)
        .expect(201);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        title: '',
        fileName: 'test.pdf',
      };

      const response = await request(app.getHttpServer())
        .post('/documents')
        .send(invalidDto)
        .expect(400);

      // Use toContain because message is an array: ["Title is required"]
      const messages = (response.body as NestErrorResponse).message;
      expect(messages[0]).toContain('Title is required');
    });

    it('should return 400 when fileName is missing', async () => {
      const invalidDto = {
        title: 'Missing fileName',
      };

      await request(app.getHttpServer())
        .post('/documents')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for invalid folderId (negative)', async () => {
      const invalidDto = {
        title: 'Invalid folder',
        fileName: 'test.pdf',
        folderId: -5,
      };

      const response = await request(app.getHttpServer())
        .post('/documents')
        .send(invalidDto)
        .expect(400);

      expect((response.body as NestErrorResponse).message).toContain(
        'folderId must be ≥ 1',
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {BadRequestException, INestApplication, ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';
import { mockDeep } from 'jest-mock-extended';
import {FoldersService} from "../../src/folders/folders.service";
import {FoldersModule} from "../../src/folders/folders.module";

describe('FoldersController (integration)', () => {
    let app: INestApplication;
    let foldersServiceMock: jest.Mocked<FoldersService>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [FoldersModule],
        })
            .overrideProvider(FoldersService)
            .useValue(mockDeep<FoldersService>())
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();

        foldersServiceMock = moduleFixture.get(FoldersService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /folders', () => {
        it('should return folders for a specific parentId', async () => {
            const mockFolders = [
                {
                    id: 1,
                    name: 'HR',
                    parentId: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    name: 'Finance',
                    parentId: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            foldersServiceMock.findAllByParent.mockResolvedValue(mockFolders);

            const response = await request(app.getHttpServer())
                .get('/folders?parentId=5')
                .expect(200);

            // Use toMatchObject to handle Date → string serialization
            expect(response.body).toMatchObject([
                {
                    id: 1,
                    name: 'HR',
                    parentId: 5,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
                {
                    id: 2,
                    name: 'Finance',
                    parentId: 5,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            ]);

            expect(foldersServiceMock.findAllByParent).toHaveBeenCalledWith(5);
        });

        it('should return root folders when parentId is not provided', async () => {
            const mockRootFolders = [
                {
                    id: 10,
                    name: 'Root Projects',
                    parentId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            foldersServiceMock.findAllByParent.mockResolvedValue(mockRootFolders);

            const response = await request(app.getHttpServer())
                .get('/folders')
                .expect(200);

            expect(response.body).toMatchObject([
                {
                    id: 10,
                    name: 'Root Projects',
                    parentId: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            ]);

            expect(foldersServiceMock.findAllByParent).toHaveBeenCalledWith(null);
        });

        it('should return 400 for invalid parentId (non-integer)', async () => {
            await request(app.getHttpServer())
                .get('/folders?parentId=abc')
                .expect(400);
        });
    });

    describe('POST /folders', () => {
        it('should create a folder with valid DTO', async () => {
            const createDto = {
                name: 'New Team Folder',
                createdBy: "John Green",
                parentId: 3,
            };

            const mockCreated = {
                id: 100,
                name: 'New Team Folder',
                parentId: 3,
                createdBy: "John Green",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            foldersServiceMock.create.mockResolvedValue(mockCreated);

            const response = await request(app.getHttpServer())
                .post('/folders')
                .send(createDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: 100,
                name: 'New Team Folder',
                parentId: 3,
                createdBy: "John Green",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            expect(foldersServiceMock.create).toHaveBeenCalledWith({
                name: 'New Team Folder',
                parentId: 3,
                createdBy: "John Green",
            });
        });

        it('should create root folder (parentId null)', async () => {
            const createDto = {
                name: 'Archive 2026',
            };

            const mockCreated = {
                id: 101,
                name: 'Archive 2026',
                parentId: null,
                createdBy: "John Green",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            foldersServiceMock.create.mockResolvedValue(mockCreated);

            const response = await request(app.getHttpServer())
                .post('/folders')
                .send(createDto)
                .expect(201);

            expect(response.body).toMatchObject({
                id: 101,
                name: 'Archive 2026',
                parentId: null,
                createdBy: "John Green",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        it('should return 400 when name is empty', async () => {
            const invalidDto = {
                name: '   ', // trimmed to '' → fails @IsNotEmpty
            };

            const response = await request(app.getHttpServer())
                .post('/folders')
                .send(invalidDto)
                .expect(400);

            expect(response.body.message).toContain('Name is required');
        });

        it('should return 400 for invalid parentId (negative)', async () => {
            const invalidDto = {
                name: 'Invalid',
                parentId: -1,
            };

            await request(app.getHttpServer())
                .post('/folders')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('PATCH /folders/:id', () => {
        it('should update folder name', async () => {
            const updateDto = {
                name: 'Renamed Folder',
            };

            const mockUpdated = {
                id: 1,
                name: 'Renamed Folder',
                parentId: 3,
                createdBy: "John Green",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            foldersServiceMock.update.mockResolvedValue(mockUpdated);

            const response = await request(app.getHttpServer())
                .patch('/folders/1')
                .send(updateDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: 1,
                name: 'Renamed Folder',
                parentId: 3,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            expect(foldersServiceMock.update).toHaveBeenCalledWith(1, { name: 'Renamed Folder' });
        });

        it('should return 400 for invalid id', async () => {
            await request(app.getHttpServer())
                .patch('/folders/abc')
                .send({ name: 'New Name' })
                .expect(400);
        });

        it('should return 400 when name is empty', async () => {
            await request(app.getHttpServer())
                .patch('/folders/1')
                .send({ name: '' })
                .expect(400);
        });
    });

    describe('DELETE /folders/:id', () => {
        it('should delete folder and return success message', async () => {
            foldersServiceMock.remove.mockResolvedValue(undefined);

            const response = await request(app.getHttpServer())
                .delete('/folders/1')
                .expect(200);

            expect(response.body).toEqual({ message: 'Folder deleted successfully' });
            expect(foldersServiceMock.remove).toHaveBeenCalledWith(1);
        });

        it('should propagate BadRequestException from service', async () => {
            foldersServiceMock.remove.mockRejectedValue(
                new BadRequestException('Folder not found'),
            );

            const response = await request(app.getHttpServer())
                .delete('/folders/999')
                .expect(400);

            expect(response.body.message).toBe('Folder not found');
        });

        it('should return 400 for invalid id', async () => {
            await request(app.getHttpServer())
                .delete('/folders/abc')
                .expect(400);
        });
    });
});

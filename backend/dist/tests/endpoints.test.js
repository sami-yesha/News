import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ArticleController } from '../src/controllers/article.controller.js';
import prisma from '../src/config/database.js';
import { errorHandler } from '../src/middlewares/error.js';
// Setup Mock Express App for testing routes
const app = express();
app.use(express.json());
// Mock Auth
const mockAuth = (req, res, next) => {
    req.user = { id: 'author-id', role: 'author' };
    next();
};
app.get('/articles', ArticleController.getPublicFeed);
app.get('/articles/me', mockAuth, ArticleController.getMyArticles);
app.get('/articles/:id', ArticleController.getArticleDetail);
app.post('/articles', mockAuth, ArticleController.create);
app.put('/articles/:id', mockAuth, ArticleController.update);
app.delete('/articles/:id', mockAuth, ArticleController.delete);
app.get('/author/dashboard', mockAuth, ArticleController.getDashboard);
app.use(errorHandler);
vi.mock('../src/config/database.js', () => ({
    default: {
        article: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        readLog: {
            create: vi.fn(),
        },
        dailyAnalytics: {
            findMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));
vi.mock('../src/config/queue.js', () => ({
    readLogQueue: { add: vi.fn().mockResolvedValue({}) },
    analyticsQueue: { add: vi.fn().mockResolvedValue({}) }
}));
describe('HTTP Endpoints - Articles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('GET /articles should return a paginated feed', async () => {
        prisma.article.findMany.mockResolvedValue([]);
        prisma.article.count.mockResolvedValue(0);
        const res = await request(app).get('/articles');
        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        expect(res.body.Object).toBeInstanceOf(Array);
    });
    it('POST /articles should create an article (Author Only)', async () => {
        const payload = {
            title: 'Test Article Title',
            content: 'This is a test content that meets the 50 characters requirement for validation purposes.',
            category: 'Tech'
        };
        prisma.article.create.mockResolvedValue({ ...payload, id: 'art-1', authorId: 'author-id' });
        const res = await request(app).post('/articles').send(payload);
        expect(res.status).toBe(201);
        expect(res.body.Success).toBe(true);
    });
    it('GET /articles/:id should return 404 if deleted', async () => {
        prisma.article.findUnique.mockResolvedValue({ id: '1', deletedAt: new Date() });
        const res = await request(app).get('/articles/1');
        expect(res.status).toBe(404);
        expect(res.body.Message).toBe('News article no longer available');
    });
    it('DELETE /articles/:id should return 403 if not the author', async () => {
        prisma.article.findUnique.mockResolvedValue({ id: '1', authorId: 'someone-else' });
        const res = await request(app).delete('/articles/1');
        expect(res.status).toBe(403);
        expect(res.body.Message).toBe('Forbidden');
    });
    it('GET /author/dashboard should return dashboard statistics', async () => {
        prisma.article.findMany.mockResolvedValue([
            { title: 'Art 1', createdAt: new Date(), analytics: [{ viewCount: 10 }] }
        ]);
        prisma.article.count.mockResolvedValue(1);
        const res = await request(app).get('/author/dashboard');
        expect(res.status).toBe(200);
        expect(res.body.Object[0]).toHaveProperty('totalViews', 10);
    });
    it('PUT /articles/:id should update an article', async () => {
        prisma.article.findUnique.mockResolvedValue({ id: '1', authorId: 'author-id' });
        prisma.article.update.mockResolvedValue({ id: '1', title: 'Updated' });
        const res = await request(app).put('/articles/1').send({ title: 'Updated' });
        expect(res.status).toBe(200);
        expect(res.body.Object.title).toBe('Updated');
    });
    it('GET /articles/me should return author content including drafts', async () => {
        prisma.article.findMany.mockResolvedValue([{ id: '1', status: 'Draft' }]);
        prisma.article.count.mockResolvedValue(1);
        const res = await request(app).get('/articles/me');
        expect(res.status).toBe(200);
        expect(res.body.Object[0].status).toBe('Draft');
    });
});
import { AuthService } from '../src/services/auth.service.js';
import { AuthController } from '../src/controllers/auth.controller.js';
const authApp = express();
authApp.use(express.json());
authApp.post('/auth/signup', AuthController.signup);
authApp.post('/auth/login', AuthController.login);
authApp.use(errorHandler);
describe('HTTP Endpoints - Auth', () => {
    it('POST /auth/signup should return 201 on success', async () => {
        const payload = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'Password123!',
            role: 'reader'
        };
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({ ...payload, id: 'user-1' });
        const res = await request(authApp).post('/auth/signup').send(payload);
        expect(res.status).toBe(201);
        expect(res.body.Success).toBe(true);
    });
    it('POST /auth/login should return a token', async () => {
        const credentials = { email: 'jane@example.com', password: 'Password123!' };
        // Mocking the service directly for simplicity in the controller test
        const loginSpy = vi.spyOn(AuthService, 'login').mockResolvedValue({
            token: 'mock-jwt-token',
            user: { id: '1', name: 'Jane', role: 'reader' }
        });
        const res = await request(authApp).post('/auth/login').send(credentials);
        expect(res.status).toBe(200);
        expect(res.body.Object.token).toBe('mock-jwt-token');
        loginSpy.mockRestore();
    });
});
//# sourceMappingURL=endpoints.test.js.map
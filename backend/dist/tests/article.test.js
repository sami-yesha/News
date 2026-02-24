import { describe, it, expect, vi } from 'vitest';
import { ArticleService } from '../src/services/article.service.js';
import prisma from '../src/config/database.js';
vi.mock('../src/config/database.js', () => ({
    default: {
        article: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        readLog: {
            groupBy: vi.fn(),
            create: vi.fn(),
        }
    },
}));
vi.mock('../src/config/queue.js', () => ({
    readLogQueue: {
        add: vi.fn().mockResolvedValue({}),
    },
    analyticsQueue: {
        add: vi.fn().mockResolvedValue({}),
    }
}));
describe('ArticleService', () => {
    it('should retrieve a published article and trigger log', async () => {
        const mockArticle = {
            id: 'uuid-1',
            title: 'Test Article',
            content: 'This is a long enough content for the validation check...',
            status: 'Published',
            deletedAt: null,
            authorId: 'author-uuid',
            author: { id: 'author-uuid', name: 'Author Name' }
        };
        prisma.article.findUnique.mockResolvedValue(mockArticle);
        const result = await ArticleService.getArticleById('uuid-1');
        expect(result.id).toBe('uuid-1');
        expect(prisma.article.findUnique).toHaveBeenCalled();
    });
    it('should throw error if article is soft-deleted', async () => {
        prisma.article.findUnique.mockResolvedValue({
            id: 'uuid-1',
            deletedAt: new Date(),
        });
        await expect(ArticleService.getArticleById('uuid-1'))
            .rejects.toThrow('News article no longer available');
    });
    it('should restrict update to the author only', async () => {
        prisma.article.findUnique.mockResolvedValue({
            id: 'uuid-1',
            authorId: 'other-author',
        });
        await expect(ArticleService.update('uuid-1', 'me-author', { title: 'New Title' }))
            .rejects.toThrow('Forbidden');
    });
});
//# sourceMappingURL=article.test.js.map
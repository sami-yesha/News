import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.js';
import { articleSchema } from '../utils/validation.js';
import { readLogQueue } from '../config/queue.js';
export class ArticleService {
    static async create(authorId, data) {
        const validated = articleSchema.parse(data);
        return await prisma.article.create({
            data: {
                ...validated,
                authorId,
            },
        });
    }
    static async getMyArticles(authorId, query) {
        const { page = 1, size = 10, includeDeleted = 'false' } = query;
        const pageNum = parseInt(page);
        const pageSize = parseInt(size);
        const where = { authorId };
        // If includeDeleted is false, filter out soft-deleted articles
        if (includeDeleted !== 'true') {
            where.deletedAt = null;
        }
        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.article.count({ where }),
        ]);
        return { articles, total, pageNum, pageSize };
    }
    static async update(articleId, authorId, data) {
        const validated = articleSchema.partial().parse(data);
        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new AppError('Article not found', 404);
        }
        if (article.authorId !== authorId) {
            throw new AppError('Forbidden', 403, ['You are not authorized to edit this article']);
        }
        return await prisma.article.update({
            where: { id: articleId },
            data: validated,
        });
    }
    static async delete(articleId, authorId) {
        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new AppError('Article not found', 404);
        }
        if (article.authorId !== authorId) {
            throw new AppError('Forbidden', 403, ['You are not authorized to delete this article']);
        }
        return await prisma.article.update({
            where: { id: articleId },
            data: { deletedAt: new Date() },
        });
    }
    static async getPublicFeed(query) {
        const { category, author, q, page = 1, size = 10 } = query;
        const pageNum = parseInt(page);
        const pageSize = parseInt(size);
        const where = {
            status: 'Published',
            deletedAt: null,
        };
        if (category) {
            where.category = category;
        }
        if (author) {
            where.author = {
                name: { contains: author, mode: 'insensitive' },
            };
        }
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true } },
                },
            }),
            prisma.article.count({ where }),
        ]);
        return { articles, total, pageNum, pageSize };
    }
    static async getArticleById(articleId, readerId) {
        const article = await prisma.article.findUnique({
            where: { id: articleId },
            include: { author: { select: { id: true, name: true } } },
        });
        if (!article || article.deletedAt) {
            throw new AppError('News article no longer available', 404);
        }
        // Engagement Trigger: Fire and forget via queue
        readLogQueue.add('log-read', { articleId, readerId }).catch(err => console.error('Failed to log read:', err));
        return article;
    }
    static async getAuthorDashboard(authorId, query) {
        const { page = 1, size = 10 } = query;
        const pageNum = parseInt(page);
        const pageSize = parseInt(size);
        const where = {
            authorId,
            deletedAt: null,
        };
        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    analytics: {
                        select: {
                            viewCount: true,
                        },
                    },
                },
            }),
            prisma.article.count({ where }),
        ]);
        const dashboardData = articles.map((article) => ({
            title: article.title,
            createdAt: article.createdAt,
            totalViews: article.analytics.reduce((sum, record) => sum + record.viewCount, 0),
        }));
        return { data: dashboardData, total, pageNum, pageSize };
    }
}
//# sourceMappingURL=article.service.js.map
import { describe, it, expect, vi } from 'vitest';
import { ArticleService } from '../src/services/article.service.js';
import prisma from '../src/config/database.js';

vi.mock('../src/config/database.js', () => ({
  default: {
    article: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    dailyAnalytics: {
      groupBy: vi.fn(),
    },
  },
}));

describe('Author Dashboard Logic', () => {
  it('should correctly aggregate views from multiple analytics records', async () => {
    const authorId = 'author-1';
    const mockArticles = [
      {
        id: '1',
        title: 'Article 1',
        createdAt: new Date('2024-01-01'),
        analytics: [
          { viewCount: 10 },
          { viewCount: 25 },
        ],
      },
      {
        id: '2',
        title: 'Article 2',
        createdAt: new Date('2024-01-02'),
        analytics: [
          { viewCount: 5 },
        ],
      },
    ];

    (prisma.article.findMany as any).mockResolvedValue(mockArticles);
    (prisma.article.count as any).mockResolvedValue(2);
    (prisma.dailyAnalytics.groupBy as any).mockResolvedValue([
      { articleId: '1', _sum: { viewCount: 35 } },
      { articleId: '2', _sum: { viewCount: 5 } },
    ]);

    const result = await ArticleService.getAuthorDashboard(authorId, { page: 1, size: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].totalViews).toBe(35);
    expect(result.data[1].totalViews).toBe(5);
  });

  it('should return zero views if no analytics records exist', async () => {
    const authorId = 'author-1';
    const mockArticles = [
      {
        id: '1',
        title: 'Article 1',
        createdAt: new Date(),
        analytics: [],
      },
    ];

    (prisma.article.findMany as any).mockResolvedValue(mockArticles);
    (prisma.article.count as any).mockResolvedValue(1);
    (prisma.dailyAnalytics.groupBy as any).mockResolvedValue([]);

    const result = await ArticleService.getAuthorDashboard(authorId, { page: 1, size: 10 });

    expect(result.data[0].totalViews).toBe(0);
  });
});

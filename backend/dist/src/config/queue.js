import { Queue, Worker } from 'bullmq';
import prisma from './database.js';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const readLogQueue = new Queue('read-logs', {
    connection: { url: REDIS_URL },
});
export const analyticsQueue = new Queue('analytics', {
    connection: { url: REDIS_URL },
});
// Schedule daily aggregation at GMT midnight
analyticsQueue.add('daily-aggregation', {}, {
    repeat: { pattern: '0 0 * * *' } // Every day at 12:00 AM
});
// Worker for ReadLog creation
new Worker('read-logs', async (job) => {
    const { articleId, readerId } = job.data;
    await prisma.readLog.create({
        data: {
            articleId,
            readerId,
        },
    });
}, { connection: { url: REDIS_URL } });
new Worker('analytics', async (job) => {
    let date = job.data.date;
    if (!date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        date = yesterday.toISOString().split('T')[0];
    }
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);
    const logs = await prisma.readLog.groupBy({
        by: ['articleId'],
        where: {
            readAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        _count: {
            articleId: true,
        },
    });
    for (const log of logs) {
        await prisma.dailyAnalytics.upsert({
            where: {
                articleId_date: {
                    articleId: log.articleId,
                    date: startOfDay,
                },
            },
            update: {
                viewCount: log._count.articleId,
            },
            create: {
                articleId: log.articleId,
                date: startOfDay,
                viewCount: log._count.articleId,
            },
        });
    }
}, { connection: { url: REDIS_URL } });
//# sourceMappingURL=queue.js.map
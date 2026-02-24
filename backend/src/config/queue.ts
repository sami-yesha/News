import { Queue, Worker } from 'bullmq';
import prisma from './database.js';
import { env } from './env.js';

const connection = { url: env.REDIS_URL };

export const readLogQueue = new Queue('read-logs', { connection });
export const analyticsQueue = new Queue('analytics', { connection });

// Schedule daily aggregation at GMT midnight
analyticsQueue.add('daily-aggregation', {}, {
  repeat: { 
    pattern: '0 0 * * *',
    utc: true // Ensure GMT/UTC execution
  },
  jobId: 'daily-aggregation-fixed' // Idempotency
});

// Worker for ReadLog creation
new Worker('read-logs', async (job) => {
  const { articleId, readerId } = job.data;
  try {
    await prisma.readLog.create({
      data: { articleId, readerId },
    });
  } catch (error) {
    console.error(`Failed to record ReadLog for job ${job.id}:`, error);
    throw error;
  }
}, { connection });

new Worker('analytics', async (job) => {
  let dateString = job.data.date;
  if (!dateString) {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    dateString = yesterday.toISOString().split('T')[0];
  }
  
  // Strict GMT boundaries
  const startOfDay = new Date(`${dateString}T00:00:00Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

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

  // Batch process upserts for scalability
  await prisma.$transaction(
    logs.map(log => 
      prisma.dailyAnalytics.upsert({
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
      })
    )
  );
}, { connection });

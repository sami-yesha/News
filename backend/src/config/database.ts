import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    article: {
      async findMany({ args, query }) {
        args.where = { deletedAt: null, ...args.where };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { deletedAt: null, ...args.where };
        return query(args);
      },
      async findUnique({ args, query }) {
        // findUnique is trickier, we can't just spread where if it's a unique field
        // But for soft-delete safety, we usually want to ensure it's not deleted
        const result = await query(args);
        if (result && (result as any).deletedAt) return null;
        return result;
      },
      async count({ args, query }) {
        args.where = { deletedAt: null, ...args.where };
        return query(args);
      }
    }
  }
});

export { prisma };
export default prisma;

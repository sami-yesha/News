import { Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { AppError } from './error.js';
import { AuthRequest } from './auth.js';

const redis = new (Redis as any)(env.REDIS_URL);

export const engagementRateLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const identifier = req.user?.id || req.ip;
  const articleId = req.params.id;
  const key = `rate_limit:engagement:${identifier}:${articleId}`;

  try {
    const exists = await redis.get(key);
    if (exists) {
      (req as any).skipLogging = true;
      return next();
    }
    await redis.set(key, '1', 'EX', 60);
    next();
  } catch (error) {
    // Fail safe: if redis is down, allow the request but maybe don't skip logging
    console.error('Rate limit error:', error);
    next();
  }
};

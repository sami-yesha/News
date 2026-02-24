import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response.js';

import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map(e => `${e.path.join('.')}: ${e.message}`);
  }

  res.status(statusCode).json(
    ResponseHelper.error(message, errors)
  );
};

export class AppError extends Error {
  status: number;
  errors: string[] | null;

  constructor(message: string, status: number = 400, errors: string[] | null = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

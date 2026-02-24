import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

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

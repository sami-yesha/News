import { Response, NextFunction } from 'express';
import { ArticleService } from '../services/article.service.js';
import { ResponseHelper } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.js';

export class ArticleController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.create(req.user!.id, req.body);
      res.status(201).json(ResponseHelper.success('Article created successfully', article));
    } catch (error) {
      next(error);
    }
  }

  static async getPublicFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ArticleService.getPublicFeed(req.query);
      res.status(200).json(ResponseHelper.paginated(
        'Public feed retrieved successfully',
        result.articles,
        result.pageNum,
        result.pageSize,
        result.total
      ));
    } catch (error) {
      next(error);
    }
  }

  static async getArticleDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const readerId = req.user?.id; // Optional readerId
      const skipLogging = (req as any).skipLogging || false;
      const article = await ArticleService.getArticleById(req.params.id as string, readerId, skipLogging);
      res.status(200).json(ResponseHelper.success('Article retrieved successfully', article));
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ArticleService.getAuthorDashboard(req.user!.id, req.query);
      res.status(200).json(ResponseHelper.paginated(
        'Author dashboard retrieved successfully',
        result.data,
        result.pageNum,
        result.pageSize,
        result.total
      ));
    } catch (error) {
      next(error);
    }
  }

  static async getMyArticles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ArticleService.getMyArticles(req.user!.id, req.query);
      res.status(200).json(ResponseHelper.paginated(
        'Author articles retrieved successfully',
        result.articles,
        result.pageNum,
        result.pageSize,
        result.total
      ));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.update(req.params.id as string, req.user!.id, req.body);
      res.status(200).json(ResponseHelper.success('Article updated successfully', article));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ArticleService.delete(req.params.id as string, req.user!.id);
      res.status(200).json(ResponseHelper.success('Article deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

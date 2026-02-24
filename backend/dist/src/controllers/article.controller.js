import { ArticleService } from '../services/article.service.js';
import { ResponseHelper } from '../utils/response.js';
export class ArticleController {
    static async create(req, res, next) {
        try {
            const article = await ArticleService.create(req.user.id, req.body);
            res.status(201).json(ResponseHelper.success('Article created successfully', article));
        }
        catch (error) {
            next(error);
        }
    }
    static async getPublicFeed(req, res, next) {
        try {
            const result = await ArticleService.getPublicFeed(req.query);
            res.status(200).json(ResponseHelper.paginated('Public feed retrieved successfully', result.articles, result.pageNum, result.pageSize, result.total));
        }
        catch (error) {
            next(error);
        }
    }
    static async getArticleDetail(req, res, next) {
        try {
            const readerId = req.user?.id; // Optional readerId
            const article = await ArticleService.getArticleById(req.params.id, readerId);
            res.status(200).json(ResponseHelper.success('Article retrieved successfully', article));
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboard(req, res, next) {
        try {
            const result = await ArticleService.getAuthorDashboard(req.user.id, req.query);
            res.status(200).json(ResponseHelper.paginated('Author dashboard retrieved successfully', result.data, result.pageNum, result.pageSize, result.total));
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyArticles(req, res, next) {
        try {
            const result = await ArticleService.getMyArticles(req.user.id, req.query);
            res.status(200).json(ResponseHelper.paginated('Author articles retrieved successfully', result.articles, result.pageNum, result.pageSize, result.total));
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const article = await ArticleService.update(req.params.id, req.user.id, req.body);
            res.status(200).json(ResponseHelper.success('Article updated successfully', article));
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await ArticleService.delete(req.params.id, req.user.id);
            res.status(200).json(ResponseHelper.success('Article deleted successfully'));
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=article.controller.js.map
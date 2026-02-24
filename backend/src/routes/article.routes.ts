import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', optionalAuthenticate, ArticleController.getPublicFeed);
router.get('/:id', optionalAuthenticate, ArticleController.getArticleDetail);

// Author only routes
router.use(authenticate);
router.use(authorize(['author']));

router.post('/', ArticleController.create);
router.get('/me', ArticleController.getMyArticles);
router.put('/:id', ArticleController.update);
router.delete('/:id', ArticleController.delete);

export default router;

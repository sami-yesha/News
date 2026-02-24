import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['author']));

router.get('/', ArticleController.getDashboard);

export default router;

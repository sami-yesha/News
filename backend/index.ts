import { env } from './src/config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './src/middlewares/error.js';
import authRoutes from './src/routes/auth.routes.js';
import articleRoutes from './src/routes/article.routes.js';
import authorRoutes from './src/routes/author.routes.js';
import './src/config/queue.js';

const app = express();
const port = env.PORT;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/author/dashboard', authorRoutes);

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.js';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/article.routes.js';
import authorRoutes from './routes/author.routes.js';
import './config/queue.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

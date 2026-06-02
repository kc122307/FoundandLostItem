import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { requestLogger } from './src/middleware/requestLogger.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env at the very beginning
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import lostItemRoutes from './src/routes/lostItem.routes.js';
import foundItemRoutes from './src/routes/foundItem.routes.js';
import matchRoutes from './src/routes/match.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import claimRoutes from './src/routes/claim.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import questionRoutes from './src/routes/question.routes.js';
import challengeRoutes from './src/routes/challenge.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || './uploads')));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/challenges', challengeRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;

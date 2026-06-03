import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import app from './app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/sockets/index.js';
import { log } from './src/config/logger.js';

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const ENV_MODE = process.env.NODE_ENV || 'development';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log('error', 'UNCAUGHT EXCEPTION! Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Connect to DB then start server
connectDB().then(() => {
  initSocket(httpServer);
  
  httpServer.listen(PORT, () => {
    log('info', `Server started running on port ${PORT} in ${ENV_MODE} mode`);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  log('error', 'UNHANDLED REJECTION!', { error: err.message, stack: err.stack });
  // Don't crash the server on network errors (e.g. MongoDB connection resets)
  if (err.name !== 'MongoNetworkError' && err.name !== 'MongoServerError') {
    // Optional: could still crash for other critical errors, but usually better to let it run in dev
    // httpServer.close(() => process.exit(1));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'SIGTERM RECEIVED. Shutting down gracefully');
  httpServer.close(() => {
    log('info', 'Process terminated');
    process.exit(0);
  });
});

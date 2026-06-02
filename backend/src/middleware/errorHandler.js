import { log } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log all 500 errors
  if (!error.statusCode || error.statusCode === 500) {
    log('error', 'Unhandled Exception', { error: err.message, stack: err.stack, path: req.path });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = { message, statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.name === 'MulterError') {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large';
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    error: error.message || 'Server Error'
  });
};

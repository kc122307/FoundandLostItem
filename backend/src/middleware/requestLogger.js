import { log } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    log('info', 'HTTP Request', {
      method,
      path: originalUrl,
      statusCode,
      durationMs,
      ip
    });
  });

  next();
};

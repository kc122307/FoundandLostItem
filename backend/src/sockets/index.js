import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { log } from '../config/logger.js';
import { registerChatEvents } from './chat.socket.js';

export let io;

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive || user.isBanned) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    // Join personal room based on userId for direct notifications
    socket.join(socket.user._id.toString());
    
    // Update lastSeen
    socket.user.lastSeen = new Date();
    await socket.user.save();

    log('info', `Socket connected: User ${socket.user._id}`);

    // Register event handlers
    registerChatEvents(socket, io);

    socket.on('disconnect', async () => {
      socket.user.lastSeen = new Date();
      await socket.user.save();
      log('info', `Socket disconnected: User ${socket.user._id}`);
    });
  });

  return io;
};

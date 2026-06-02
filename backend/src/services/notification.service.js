import Notification from '../models/Notification.js';
import { io } from '../sockets/index.js';

export const createNotification = async ({ userId, title, body, type, data }) => {
  try {
    const notification = new Notification({
      userId,
      title,
      body,
      type,
      data
    });

    await notification.save();

    // Emit via Socket.IO to the user's room
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export const markAllRead = async (userId) => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { createNotification } from '../services/notification.service.js';

export const registerChatEvents = (socket, io) => {
  
  socket.on('join_chat', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      const isParticipant = chat && chat.participants.some(p => p.toString() === socket.user._id.toString());
      if (!chat || !isParticipant) {
        return; // Unauthorized or not found
      }
      
      socket.join('chat:' + chatId);
      socket.emit('joined_chat', chatId);
    } catch (error) {
      console.error('Join chat error:', error);
    }
  });

  socket.on('send_message', async ({ chatId, text, imageUrl }) => {
    try {
      const chat = await Chat.findById(chatId);
      const isParticipant = chat && chat.participants.some(p => p.toString() === socket.user._id.toString());
      if (!chat || !isParticipant) {
        return;
      }

      const messageType = imageUrl ? 'image' : 'text';
      
      const message = new Message({
        chatId,
        senderId: socket.user._id,
        text,
        imageUrl,
        type: messageType,
        readBy: [socket.user._id]
      });

      await message.save();

      chat.lastMessage = {
        text: messageType === 'image' ? '📸 Image' : text,
        senderId: socket.user._id,
        createdAt: new Date()
      };
      await chat.save();

      // Emit to room
      io.to('chat:' + chatId).emit('new_message', message);

      // Create notification for other participant
      const otherParticipantId = chat.participants.find(
        p => p.toString() !== socket.user._id.toString()
      );

      if (otherParticipantId) {
        await createNotification({
          userId: otherParticipantId,
          title: 'New Message',
          body: `You have a new message from ${socket.user.name}`,
          type: 'chat_message',
          data: { chatId }
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  });

  socket.on('typing_start', ({ chatId }) => {
    socket.to('chat:' + chatId).emit('user_typing', { 
      userId: socket.user._id, 
      chatId 
    });
  });

  socket.on('typing_stop', ({ chatId }) => {
    socket.to('chat:' + chatId).emit('user_stopped_typing', { 
      userId: socket.user._id, 
      chatId 
    });
  });

  socket.on('mark_read', async ({ chatId }) => {
    try {
      await Message.updateMany(
        { chatId, readBy: { $ne: socket.user._id } },
        { $push: { readBy: socket.user._id } }
      );
      
      io.to('chat:' + chatId).emit('messages_read', { 
        chatId, 
        userId: socket.user._id 
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });
};

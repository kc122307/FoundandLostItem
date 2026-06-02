import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import { io } from '../sockets/index.js';

export const getOrCreateChat = async (req, res, next) => {
  try {
    const { matchId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const isParticipant = 
      match.lostUserId.toString() === req.user._id.toString() || 
      match.foundUserId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized to start chat for this match' });
    }

    let chat = await Chat.findOne({ matchId });

    if (!chat) {
      chat = new Chat({
        participants: [match.lostUserId, match.foundUserId],
        matchId,
        lostItemId: match.lostItemId,
        foundItemId: match.foundItemId
      });
      await chat.save();
    }

    res.status(200).json({ chat });
  } catch (error) {
    next(error);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar isVerified')
      .populate('lostItemId', 'title images status')
      .populate('foundItemId', 'title images status')
      .sort({ 'lastMessage.createdAt': -1 });

    res.status(200).json({ chats });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    const isParticipant = chat && chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!chat || !isParticipant) {
      return res.status(403).json({ error: 'Unauthorized access to chat' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ chatId });

    // Mark as read in DB if fetching newest
    if (parseInt(page) === 1) {
      await Message.updateMany(
        { chatId, readBy: { $ne: req.user._id } },
        { $push: { readBy: req.user._id } }
      );
    }

    res.status(200).json({ 
      messages: messages.reverse(), 
      total, 
      page: parseInt(page) 
    });
  } catch (error) {
    next(error);
  }
};

export const sendImageMessage = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const chat = await Chat.findById(chatId);
    const isParticipant = chat && chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!chat || !isParticipant) {
      return res.status(403).json({ error: 'Unauthorized access to chat' });
    }

    const message = new Message({
      chatId,
      senderId: req.user._id,
      imageUrl: req.file.filename,
      type: 'image',
      readBy: [req.user._id]
    });

    await message.save();

    chat.lastMessage = {
      text: '📸 Image',
      senderId: req.user._id,
      createdAt: new Date()
    };
    await chat.save();

    if (io) {
      io.to('chat:' + chatId).emit('new_message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

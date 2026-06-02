import express from 'express';
import { getOrCreateChat, getChats, getMessages, sendImageMessage, hideChat } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadChatImage } from '../middleware/upload.js';

const router = express.Router();

router.use(verifyToken);

router.post('/start', verifyToken, getOrCreateChat);
router.get('/', verifyToken, getChats);
router.get('/:chatId/messages', verifyToken, getMessages);
router.post('/image', verifyToken, uploadChatImage, sendImageMessage);
router.delete('/:chatId', verifyToken, hideChat);

export default router;

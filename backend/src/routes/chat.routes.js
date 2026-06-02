import express from 'express';
import { getOrCreateChat, getChats, getMessages, sendImageMessage } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadChatImage } from '../middleware/upload.js';

const router = express.Router();

router.use(verifyToken);

router.post('/start', getOrCreateChat);
router.get('/', getChats);
router.get('/:chatId/messages', getMessages);
router.post('/image', uploadChatImage, sendImageMessage);

export default router;

import express from 'express';
import { 
  getMyNotifications, 
  markRead, 
  markAllRead, 
  deleteNotification 
} from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;

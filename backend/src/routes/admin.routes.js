import express from 'express';
import { 
  getAnalytics, 
  getUsers, 
  banUser, 
  unbanUser, 
  verifyUser, 
  deleteItem, 
  getPendingItems 
} from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.post('/users/:id/verify', verifyUser);
router.delete('/items/:itemType/:itemId', deleteItem);
router.get('/pending-items', getPendingItems);

export default router;

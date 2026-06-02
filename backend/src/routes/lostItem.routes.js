import express from 'express';
import { create, getAll, getById, update, remove, getNearby } from '../controllers/lostItem.controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { uploadItemImages } from '../middleware/upload.js';

const router = express.Router();

router.post('/', verifyToken, uploadItemImages, create);
router.get('/', optionalAuth, getAll);
router.get('/nearby', optionalAuth, getNearby);
router.get('/:id', optionalAuth, getById);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

export default router;

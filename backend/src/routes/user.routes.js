import express from 'express';
import { updateProfile, getUserProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.put('/profile', verifyToken, uploadAvatar, updateProfile);
router.get('/:id', getUserProfile);

export default router;

import express from 'express';
import { body } from 'express-validator';
import { 
  register, login, refreshToken, getMe, 
  forgotPassword, resetPassword, verifyEmail 
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('city').notEmpty().withMessage('City is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshToken);
router.get('/me', verifyToken, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

export default router;

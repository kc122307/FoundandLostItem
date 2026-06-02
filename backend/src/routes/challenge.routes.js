import express from 'express';
import { 
  createChallenge, 
  answerChallenge, 
  getMyChallenges, 
  getChallengeById 
} from '../controllers/challenge.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createChallenge);
router.post('/:id/answer', answerChallenge);
router.get('/mine', getMyChallenges);
router.get('/:id', getChallengeById);

export default router;

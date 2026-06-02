import express from 'express';
import { 
  getMatchesForLostItem, 
  getMatchesForFoundItem, 
  getMyMatches, 
  triggerManualMatch 
} from '../controllers/match.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/my-matches', getMyMatches);
router.get('/lost/:id', getMatchesForLostItem);
router.get('/found/:id', getMatchesForFoundItem);
router.post('/manual', triggerManualMatch);

export default router;

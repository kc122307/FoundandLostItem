import express from 'express';
import { 
  submitClaim, resubmitClaim, 
  getMyClaims, getClaimsForMyItem, getClaimById 
} from '../controllers/claim.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken); // All routes require auth

router.post('/', submitClaim);
router.post('/resubmit', resubmitClaim);
router.get('/mine', getMyClaims);
router.get('/for-my-items', getClaimsForMyItem);
router.get('/:id', getClaimById);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireProposalMember } from '../middleware/teamAuth.js';
import { exportProposal } from '../controllers/exportController.js';
import { heavyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// An export contains the full description, every comment and every author name,
// so it is restricted to members of the proposal's team.
router.get('/proposal/:id', protect, heavyLimiter, requireProposalMember, exportProposal);

export default router;

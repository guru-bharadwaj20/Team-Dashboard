import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { exportProposal } from '../controllers/exportController.js';
import { heavyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/proposal/:id', protect, heavyLimiter, exportProposal);

export default router;

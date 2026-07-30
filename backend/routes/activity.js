import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validatePagination } from '../middleware/validate.js';
import { getActivityFeed } from '../controllers/activityController.js';

const router = express.Router();

router.get('/', protect, validatePagination, getActivityFeed);

export default router;

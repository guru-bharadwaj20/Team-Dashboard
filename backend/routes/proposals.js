import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProposalById,
  addComment,
  getComments,
} from '../controllers/proposalController.js';

const router = express.Router();

router.route('/:id').get(protect, getProposalById);
router.route('/:id/comments').get(protect, getComments).post(protect, addComment);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProposalById,
  vote,
  getResults,
  addComment,
  getComments,
} from '../controllers/proposalController.js';

const router = express.Router();

router.route('/:id').get(protect, getProposalById);
router.route('/:id/votes').post(protect, vote);
router.route('/:id/results').get(protect, getResults);
router.route('/:id/comments').get(protect, getComments).post(protect, addComment);

export default router;

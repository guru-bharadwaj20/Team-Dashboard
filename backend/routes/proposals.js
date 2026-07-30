import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireProposalMember } from '../middleware/teamAuth.js';
import {
  getProposalById,
  deleteProposal,
  addComment,
  getComments,
  voteOnProposal,
} from '../controllers/proposalController.js';

const router = express.Router();

// Every proposal route is scoped to members of the proposal's parent team.
router
  .route('/:id')
  .get(protect, requireProposalMember, getProposalById)
  .delete(protect, requireProposalMember, deleteProposal);

router.route('/:id/vote').post(protect, requireProposalMember, voteOnProposal);

router
  .route('/:id/comments')
  .get(protect, requireProposalMember, getComments)
  .post(protect, requireProposalMember, addComment);

export default router;

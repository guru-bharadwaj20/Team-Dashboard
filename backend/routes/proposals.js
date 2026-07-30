import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireProposalMember } from '../middleware/teamAuth.js';
import {
  validateProposalId,
  validateVote,
  validateAddComment,
  validatePagination,
} from '../middleware/validate.js';
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
  .get(protect, validateProposalId, requireProposalMember, getProposalById)
  .delete(protect, validateProposalId, requireProposalMember, deleteProposal);

router.route('/:id/vote').post(protect, validateVote, requireProposalMember, voteOnProposal);

router
  .route('/:id/comments')
  .get(protect, validateProposalId, validatePagination, requireProposalMember, getComments)
  .post(protect, validateAddComment, requireProposalMember, addComment);

export default router;

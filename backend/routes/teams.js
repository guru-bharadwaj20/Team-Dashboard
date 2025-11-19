import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, getTeams, getTeamById, joinTeam, deleteTeam } from '../controllers/teamController.js';
import { createProposal, getProposalsByTeam } from '../controllers/proposalController.js';

const router = express.Router();

router.route('/').get(protect, getTeams).post(protect, createTeam);
router.route('/:id').get(protect, getTeamById).post(protect, joinTeam).delete(protect, deleteTeam);

// Nested: /api/teams/:teamId/proposals
router.route('/:teamId/proposals').get(protect, getProposalsByTeam).post(protect, createProposal);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireTeamMember, requireTeamCreator } from '../middleware/teamAuth.js';
import { createTeam, getTeams, getTeamById, joinTeam, deleteTeam } from '../controllers/teamController.js';
import { createProposal, getProposalsByTeam } from '../controllers/proposalController.js';

const router = express.Router();

router.route('/').get(protect, getTeams).post(protect, createTeam);

// Join by share code. Declared before '/:id' so 'join' is not parsed as an id.
router.post('/join', protect, joinTeam);

router
  .route('/:id')
  .get(protect, requireTeamMember, getTeamById)
  .delete(protect, requireTeamCreator, deleteTeam);

// Nested: /api/teams/:teamId/proposals
router
  .route('/:teamId/proposals')
  .get(protect, requireTeamMember, getProposalsByTeam)
  .post(protect, requireTeamMember, createProposal);

export default router;

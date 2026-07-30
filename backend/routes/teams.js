import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireTeamMember, requireTeamCreator } from '../middleware/teamAuth.js';
import {
  validateCreateTeam,
  validateUpdateTeam,
  validateJoinTeam,
  validateTeamId,
  validateTeamIdParam,
  validateCreateProposal,
  validatePagination,
} from '../middleware/validate.js';
import { createTeam, getTeams, getTeamById, joinTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { createProposal, getProposalsByTeam } from '../controllers/proposalController.js';

const router = express.Router();

router.route('/').get(protect, getTeams).post(protect, validateCreateTeam, createTeam);

// Join by share code. Declared before '/:id' so 'join' is not parsed as an id.
router.post('/join', protect, validateJoinTeam, joinTeam);

router
  .route('/:id')
  .get(protect, validateTeamId, validatePagination, requireTeamMember, getTeamById)
  .put(protect, validateUpdateTeam, requireTeamCreator, updateTeam)
  .delete(protect, validateTeamId, requireTeamCreator, deleteTeam);

// Nested: /api/teams/:teamId/proposals
router
  .route('/:teamId/proposals')
  .get(protect, validateTeamIdParam, validatePagination, requireTeamMember, getProposalsByTeam)
  .post(protect, validateCreateProposal, requireTeamMember, createProposal);

export default router;

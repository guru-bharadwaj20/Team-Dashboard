import express from 'express';
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';

const router = express.Router();

// Public route - anyone can submit a contact message
router.post('/', submitContact);

// Admin routes (could be protected with middleware later)
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.put('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

export default router;

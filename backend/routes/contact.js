import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  validateContact,
  validateContactId,
  validateContactStatus,
} from '../middleware/validate.js';
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';

const router = express.Router();

// Public route - anyone can submit a contact message
router.post('/', validateContact, submitContact);

// Admin routes - contact submissions contain third-party PII (name, email, message
// body) and must never be readable or mutable by unauthenticated callers.
router.get('/', protect, adminOnly, getAllContacts);
router.get('/:id', protect, adminOnly, validateContactId, getContactById);
router.put('/:id/status', protect, adminOnly, validateContactStatus, updateContactStatus);
router.delete('/:id', protect, adminOnly, validateContactId, deleteContact);

export default router;

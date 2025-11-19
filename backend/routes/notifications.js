import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAll,
} from '../controllers/notificationController.js';

const router = express.Router();

router.route('/').get(protect, getNotifications).delete(protect, clearAll);
router.route('/:id').patch(protect, markAsRead).delete(protect, deleteNotification);

export default router;

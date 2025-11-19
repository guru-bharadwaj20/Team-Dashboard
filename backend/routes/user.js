import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, changePassword, deleteAccount, getNotifications } from '../controllers/userController.js';

const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/change-password').post(protect, changePassword);
router.route('/account').delete(protect, deleteAccount);
router.route('/notifications').get(protect, getNotifications);

export default router;

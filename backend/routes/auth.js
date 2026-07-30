import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

export default router;

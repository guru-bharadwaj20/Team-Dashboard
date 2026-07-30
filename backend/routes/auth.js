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
import { registerLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} from '../middleware/validate.js';

const router = express.Router();

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/password', protect, validateChangePassword, changePassword);
router.delete('/account', protect, deleteAccount);

export default router;

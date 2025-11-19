import express from 'express';
import { register, login, updateProfile, changePassword, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

export default router;

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js';
import { isValidEmail, normalizeEmail, validatePassword, validateText } from '../utils/validators.js';
import { cascadeUserDelete, withTransaction } from '../services/cascadeService.js';
import { logger } from '../utils/logger.js';

/** The only user fields ever sent to a client. */
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const nameError = validateText(name, 'Name', { min: 1, max: 80 });
    if (nameError) return res.status(400).json({ message: nameError });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const normalizedEmail = normalizeEmail(email);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    await user.save();

    setAuthCookie(res, generateToken({ id: user._id }));

    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    logger.error('Error during registration:', error);
    res.status(500).json({ message: 'Failed to register' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ message: 'Provide email and password' });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    setAuthCookie(res, generateToken({ id: user._id }));
    res.json({ user: publicUser(user) });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
};

/** Clears the auth cookie. Required now that the token is not client-readable. */
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};

/** Returns the authenticated user, letting the SPA verify its session on boot. */
export const getMe = (req, res) => res.json({ user: publicUser(req.user) });

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: 'Please provide name or email to update' });
    }

    const updateData = {};

    if (name !== undefined) {
      const nameError = validateText(name, 'Name', { min: 1, max: 80 });
      if (nameError) return res.status(400).json({ message: nameError });
      updateData.name = String(name).trim();
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      const normalizedEmail = normalizeEmail(email);
      if (normalizedEmail !== req.user.email) {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      updateData.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    res.json({ user: publicUser(updatedUser), message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Seven unordered deletes with no transaction previously left the database
    // inconsistent on any mid-way failure, and orphaned every notification and
    // activity row that referenced the removed records. The cascade now runs as
    // one unit, transactionally wherever the deployment supports it.
    await withTransaction(async (session) => {
      await cascadeUserDelete(userId, session);
      await User.findByIdAndDelete(userId, session ? { session } : {});
    });

    clearAuthCookie(res);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

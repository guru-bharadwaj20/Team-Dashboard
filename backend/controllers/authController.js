import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = generateToken({ id: user._id });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Failed to register', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user._id });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: 'Please provide name or email to update' });
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    res.json({ 
      user: { 
        id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email 
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

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
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's notifications
    await Notification.deleteMany({ userId });

    // Find teams created by the user
    const createdTeams = await Team.find({ creator: userId });
    const teamIds = createdTeams.map(t => t._id);

    // Delete proposals in those teams
    await Proposal.deleteMany({ teamId: { $in: teamIds } });

    // Delete teams created by the user
    await Team.deleteMany({ creator: userId });

    // Remove user from other teams
    await Team.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete proposals created by the user in other teams
    await Proposal.deleteMany({ creator: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

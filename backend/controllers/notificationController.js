import { asyncHandler } from '../middleware/asyncHandler.js';
import Notification from '../models/Notification.js';

// Get all notifications for the logged-in user
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  if (notification.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  notification.read = true;
  await notification.save();
  
  res.json({ message: 'Notification marked as read' });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  if (notification.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  await Notification.findByIdAndDelete(id);
  res.json({ message: 'Notification deleted' });
});

// Clear all notifications for user
export const clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.json({ message: 'All notifications cleared' });
});


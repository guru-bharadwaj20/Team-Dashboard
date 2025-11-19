import Notification from '../models/Notification.js';

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to mark notification as read' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete notification' });
  }
};

// Clear all notifications for user
export const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to clear notifications' });
  }
};

// Helper function to create a notification (used by other controllers)
export const createNotification = async (userId, type, title, message, link = null, relatedId = null, relatedType = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link,
      relatedId,
      relatedType,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

import { useState, useEffect } from 'react';
import { notificationApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/constants.js';
import Loader from '../components/common/Loader.jsx';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, [socket, connected]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      const data = res?.data ?? res;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕',
    };
    return icons[type] || 'ℹ️';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await notificationApi.clearAll();
        setNotifications([]);
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-gradient-to-r from-danger-600 to-danger-700 hover:from-danger-700 hover:to-danger-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List or Empty State */}
        {notifications.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-white">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 p-6 flex items-start gap-4"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  notification.type === 'success' 
                    ? 'bg-green-100 text-green-600'
                    : notification.type === 'error'
                    ? 'bg-danger-100 text-danger-600'
                    : notification.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {notification.title}
                  </div>
                  <div className="text-gray-700 mb-2">
                    {notification.message}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTimeAgo(notification.createdAt)}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;


import { useState } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Proposal',
      message: 'A new proposal "Implement Dark Mode" was created in Product Team',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'success',
      title: 'Vote Recorded',
      message: 'Your vote on "Migrate to TypeScript" has been recorded',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'New Comment',
      message: 'Jane commented on "Upgrade Node.js Version"',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Voting Deadline',
      message: 'Voting for "Implement Dark Mode" ends in 2 days',
      time: '2 days ago',
    },
    {
      id: 5,
      type: 'success',
      title: 'Proposal Closed',
      message: 'Voting closed on "Upgrade Node.js Version"',
      time: '3 days ago',
    },
  ]);

  const getIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕',
    };
    return icons[type] || 'ℹ️';
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
        {notifications.length > 0 && (
          <button
            className="notifications-button danger"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <p className="notifications-empty-text">No notifications</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              <div className={`notification-icon ${notification.type}`}>
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {notification.time}
                </div>
              </div>
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

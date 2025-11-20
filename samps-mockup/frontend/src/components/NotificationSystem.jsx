import { useEffect } from 'react';
import { useAppStore } from '../store/globalStore';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useAppStore();

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: getNotificationColor(notification.type),
            color: 'white',
            maxWidth: '400px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              marginLeft: '10px'
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
    case 'error': return 'linear-gradient(135deg, #dc3545, #c82333)';
    case 'warning': return 'linear-gradient(135deg, #ffc107, #e0a800)';
    default: return 'linear-gradient(135deg, #003d7a, #0056b3)';
  }
};

export default NotificationSystem;
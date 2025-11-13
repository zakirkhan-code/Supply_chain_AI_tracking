import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import socketService from '@services/socket';
import { notificationAPI } from '@services/api';
import { useAuth } from '@hooks/useAuth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      setupSocketListeners();
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [user]);

  const setupSocketListeners = () => {
    // Listen for new notifications
    socketService.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast(notification);
    });

    // Listen for checkpoint added
    socketService.onCheckpointAdded((data) => {
      toast.info(`New checkpoint added at ${data.checkpoint.location}`);
    });

    // Listen for shipment updates
    socketService.onShipmentUpdated((data) => {
      toast.info(`Shipment #${data.shipmentId} status updated`);
    });
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications({
        page: 1,
        limit: 20,
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const showToast = (notification) => {
    const options = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (notification.priority) {
      case 'Urgent':
        toast.error(notification.message, options);
        break;
      case 'High':
        toast.warning(notification.message, options);
        break;
      default:
        toast.info(notification.message, options);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
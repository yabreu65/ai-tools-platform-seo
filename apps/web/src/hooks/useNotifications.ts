import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

export const useNotifications = (): NotificationState => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
  };
};

// Utility functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Legacy compatibility function
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', options?: Partial<Notification>) => {
    return addNotification({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      persistent: type === 'error',
      ...options,
    });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
  };
};
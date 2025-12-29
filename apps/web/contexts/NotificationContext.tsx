'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Wifi, 
  WifiOff,
  Undo2,
  RefreshCw,
  X
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

export interface NotificationOptions {
  id?: string;
  title?: string;
  description?: string;
  type: NotificationType;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  priority?: 'low' | 'medium' | 'high';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  dismissible?: boolean;
  onDismiss?: () => void;
  data?: any;
}

export interface QueuedNotification extends NotificationOptions {
  id: string;
  timestamp: number;
  dismissed: boolean;
}

interface NotificationContextType {
  // Basic notifications
  showNotification: (options: NotificationOptions) => string;
  showSuccess: (message: string, options?: Partial<NotificationOptions>) => string;
  showError: (message: string, options?: Partial<NotificationOptions>) => string;
  showWarning: (message: string, options?: Partial<NotificationOptions>) => string;
  showInfo: (message: string, options?: Partial<NotificationOptions>) => string;
  showLoading: (message: string, options?: Partial<NotificationOptions>) => string;
  
  // Advanced features
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
  updateNotification: (id: string, options: Partial<NotificationOptions>) => void;
  
  // Connection status
  isOnline: boolean;
  showConnectionStatus: (online: boolean) => void;
  
  // Queue management
  notifications: QueuedNotification[];
  clearQueue: () => void;
  
  // Undo functionality
  showUndoNotification: (message: string, undoAction: () => void, options?: Partial<NotificationOptions>) => string;
  
  // Retry functionality
  showRetryNotification: (message: string, retryAction: () => void, options?: Partial<NotificationOptions>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'loading':
      return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<QueuedNotification[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showConnectionStatus(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      showConnectionStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToQueue = useCallback((notification: QueuedNotification) => {
    setNotifications(prev => {
      // Remove old notifications if queue is too large
      const filtered = prev.filter(n => !n.dismissed).slice(-50);
      return [...filtered, notification];
    });
  }, []);

  const showNotification = useCallback((options: NotificationOptions): string => {
    const id = options.id || generateId();
    const duration = options.persistent ? Infinity : (options.duration || 4000);

    const queuedNotification: QueuedNotification = {
      ...options,
      id,
      timestamp: Date.now(),
      dismissed: false,
    };

    addToQueue(queuedNotification);

    const content = (
      <div className="flex items-start gap-3 w-full">
        {getIcon(options.type)}
        <div className="flex-1 min-w-0">
          {options.title && (
            <div className="font-semibold text-sm mb-1">{options.title}</div>
          )}
          {options.description && (
            <div className="text-sm text-muted-foreground">{options.description}</div>
          )}
          {options.actions && options.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {options.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    if (options.dismissible !== false) {
                      toast.dismiss(id);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    action.variant === 'destructive'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {options.dismissible !== false && (
          <button
            onClick={() => {
              toast.dismiss(id);
              options.onDismiss?.();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    // Show toast with appropriate styling
    const toastOptions = {
      id,
      duration,
      position: options.position || 'top-right',
      className: `notification-${options.type} ${options.priority === 'high' ? 'notification-high-priority' : ''}`,
    };

    switch (options.type) {
      case 'success':
        toast.success(content, toastOptions);
        break;
      case 'error':
        toast.error(content, toastOptions);
        break;
      case 'warning':
        toast.warning(content, toastOptions);
        break;
      case 'loading':
        toast.loading(content, toastOptions);
        break;
      default:
        toast(content, toastOptions);
    }

    return id;
  }, [addToQueue]);

  const showSuccess = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      type: 'success',
      description: message,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      type: 'error',
      description: message,
      duration: 6000, // Longer duration for errors
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      type: 'warning',
      description: message,
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      type: 'info',
      description: message,
      ...options,
    });
  }, [showNotification]);

  const showLoading = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      type: 'loading',
      description: message,
      persistent: true,
      dismissible: false,
      ...options,
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    toast.dismiss(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
    setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
  }, []);

  const updateNotification = useCallback((id: string, options: Partial<NotificationOptions>) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...options } : n)
    );
    
    // Update the toast
    showNotification({ ...options, id } as NotificationOptions);
  }, [showNotification]);

  const showConnectionStatus = useCallback((online: boolean) => {
    const message = online ? 'Conexión restaurada' : 'Sin conexión a internet';
    const type = online ? 'success' : 'warning';
    
    showNotification({
      type,
      title: online ? 'Conectado' : 'Desconectado',
      description: message,
      duration: online ? 3000 : Infinity,
      persistent: !online,
      priority: 'high',
    });
  }, [showNotification]);

  const clearQueue = useCallback(() => {
    setNotifications([]);
  }, []);

  const showUndoNotification = useCallback((
    message: string, 
    undoAction: () => void, 
    options?: Partial<NotificationOptions>
  ) => {
    return showNotification({
      type: 'info',
      description: message,
      duration: 8000,
      actions: [
        {
          label: 'Deshacer',
          action: undoAction,
        }
      ],
      ...options,
    });
  }, [showNotification]);

  const showRetryNotification = useCallback((
    message: string, 
    retryAction: () => void, 
    options?: Partial<NotificationOptions>
  ) => {
    return showNotification({
      type: 'error',
      description: message,
      duration: 10000,
      actions: [
        {
          label: 'Reintentar',
          action: retryAction,
        }
      ],
      ...options,
    });
  }, [showNotification]);

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissNotification,
    dismissAll,
    updateNotification,
    isOnline,
    showConnectionStatus,
    notifications,
    clearQueue,
    showUndoNotification,
    showRetryNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Hook for connection status
export function useConnectionStatus() {
  const { isOnline } = useNotifications();
  return isOnline;
}

// Hook for notification queue
export function useNotificationQueue() {
  const { notifications, clearQueue } = useNotifications();
  return { notifications, clearQueue };
}
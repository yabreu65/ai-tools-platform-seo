'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type ConnectionStatus = 'online' | 'offline' | 'slow' | 'reconnecting' | 'unstable';

interface ConnectionInfo {
  status: ConnectionStatus;
  lastOnline?: Date;
  downtime?: number; // in milliseconds
  speed?: 'slow' | 'fast' | 'unknown';
  latency?: number; // in milliseconds
}

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number; // in milliseconds
  position?: 'top' | 'bottom';
  onRetry?: () => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

interface ConnectionStatusProps {
  status: ConnectionStatus;
  info?: ConnectionInfo;
  className?: string;
  variant?: 'badge' | 'full' | 'minimal';
  showIcon?: boolean;
  showText?: boolean;
}

const statusConfig = {
  online: {
    icon: Wifi,
    label: 'En línea',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  offline: {
    icon: WifiOff,
    label: 'Sin conexión',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  slow: {
    icon: AlertTriangle,
    label: 'Conexión lenta',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  reconnecting: {
    icon: RefreshCw,
    label: 'Reconectando...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  unstable: {
    icon: AlertTriangle,
    label: 'Conexión inestable',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

export function ConnectionStatus({
  status,
  info,
  className = '',
  variant = 'badge',
  showIcon = true,
  showText = true
}: ConnectionStatusProps) {
  const config = statusConfig[status] || statusConfig.online;
  const Icon = config.icon;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && (
          <Icon 
            className={`h-3 w-3 ${config.color} ${status === 'reconnecting' ? 'animate-spin' : ''}`} 
          />
        )}
        {showText && (
          <span className={`text-xs ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline" 
        className={`${config.bgColor} ${config.borderColor} ${config.color} ${className}`}
      >
        {showIcon && (
          <Icon 
            className={`h-3 w-3 mr-1 ${status === 'reconnecting' ? 'animate-spin' : ''}`} 
          />
        )}
        {showText && config.label}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      {showIcon && (
        <Icon 
          className={`h-4 w-4 ${config.color} ${status === 'reconnecting' ? 'animate-spin' : ''}`} 
        />
      )}
      <div className="flex-1">
        {showText && (
          <div className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </div>
        )}
        {info && (
          <div className="text-xs text-gray-500 mt-1">
            {info.lastOnline && status === 'offline' && (
              <div>Última conexión: {info.lastOnline.toLocaleTimeString()}</div>
            )}
            {info.downtime && status === 'offline' && (
              <div>Sin conexión por: {Math.round(info.downtime / 1000)}s</div>
            )}
            {info.latency && (
              <div>Latencia: {info.latency}ms</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function OfflineIndicator({
  className = '',
  showDetails = false,
  autoHide = true,
  autoHideDelay = 5000,
  position = 'top',
  onRetry,
  onStatusChange
}: OfflineIndicatorProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'online'
  });
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const newStatus: ConnectionStatus = navigator.onLine ? 'online' : 'offline';
      
      setConnectionInfo(prev => ({
        ...prev,
        status: newStatus,
        lastOnline: newStatus === 'offline' ? new Date() : undefined
      }));

      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Show indicator when offline or hide when online
      if (newStatus === 'offline') {
        setIsVisible(true);
      } else if (autoHide) {
        setTimeout(() => setIsVisible(false), autoHideDelay);
      }
    };

    // Initial check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [autoHide, autoHideDelay, onStatusChange]);

  // Monitor connection quality
  useEffect(() => {
    if (!navigator.onLine) return;

    const checkConnectionQuality = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const latency = Date.now() - startTime;

        if (response.ok) {
          const speed = latency > 1000 ? 'slow' : 'fast';
          const status: ConnectionStatus = latency > 2000 ? 'slow' : 'online';

          setConnectionInfo(prev => ({
            ...prev,
            status,
            speed,
            latency
          }));

          if (status === 'slow' && !isVisible) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        // Network error - might be offline or very slow
        setConnectionInfo(prev => ({
          ...prev,
          status: 'unstable'
        }));
        setIsVisible(true);
      }
    };

    // Check connection quality periodically
    const interval = setInterval(checkConnectionQuality, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  // Track downtime
  useEffect(() => {
    if (connectionInfo.status === 'offline' && connectionInfo.lastOnline) {
      const interval = setInterval(() => {
        setConnectionInfo(prev => ({
          ...prev,
          downtime: Date.now() - (prev.lastOnline?.getTime() || Date.now())
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [connectionInfo.status, connectionInfo.lastOnline]);

  const handleRetry = async () => {
    setConnectionInfo(prev => ({ ...prev, status: 'reconnecting' }));
    setRetryCount(prev => prev + 1);

    try {
      // Attempt to reconnect by making a test request
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (response.ok) {
        setConnectionInfo(prev => ({ ...prev, status: 'online' }));
        if (autoHide) {
          setTimeout(() => setIsVisible(false), autoHideDelay);
        }
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      setConnectionInfo(prev => ({ ...prev, status: 'offline' }));
    }

    if (onRetry) {
      onRetry();
    }
  };

  const positionClasses = {
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Don't show indicator if online and auto-hide is enabled
  if (connectionInfo.status === 'online' && autoHide && !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isVisible || connectionInfo.status !== 'online') && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          className={`fixed ${positionClasses[position]} z-50 ${className}`}
        >
          <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-between gap-3">
              <ConnectionStatus
                status={connectionInfo.status}
                info={showDetails ? connectionInfo : undefined}
                variant="full"
              />
              
              {(connectionInfo.status === 'offline' || connectionInfo.status === 'reconnecting') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={connectionInfo.status === 'reconnecting'}
                  className="shrink-0"
                >
                  {connectionInfo.status === 'reconnecting' ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reintentar
                    </>
                  )}
                </Button>
              )}
            </div>

            {showDetails && retryCount > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Intentos de reconexión: {retryCount}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for using connection status in other components
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setStatus(online ? 'online' : 'offline');
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return { status, isOnline };
}
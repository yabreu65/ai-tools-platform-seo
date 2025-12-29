import { useEffect, useState, useCallback } from 'react';
import { useNotificationHelpers } from './useNotifications';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface CacheStatus {
  [cacheName: string]: number;
}

interface SyncQueueItem {
  url: string;
  method: string;
  timestamp: number;
}

export const useServiceWorker = () => {
  const { showNotification } = useNotificationHelpers();
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    updateAvailable: false,
    registration: null
  });
  
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({});
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      setState(prev => ({ ...prev, isSupported: true, isInstalling: true }));
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', registration);
      
      setState(prev => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        registration
      }));

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, updateAvailable: true }));
              showNotification(
                'Nueva versión disponible. Recarga la página para actualizar.',
                'info',
                {
                  persistent: true,
                  action: {
                    label: 'Actualizar',
                    onClick: () => window.location.reload()
                  }
                }
              );
            }
          });
        }
      });

      // Verificar si hay un worker esperando
      if (registration.waiting) {
        setState(prev => ({ ...prev, isWaiting: true, updateAvailable: true }));
      }

      // Verificar si está controlando
      if (registration.active) {
        setState(prev => ({ ...prev, isControlling: true }));
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setState(prev => ({ ...prev, isInstalling: false }));
      showNotification('Error al registrar Service Worker', 'error');
    }
  }, [showNotification]);

  // Activar actualización
  const activateUpdate = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [state.registration]);

  // Obtener estado del cache
  const getCacheStatus = useCallback(async () => {
    if (!state.registration?.active) return;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<CacheStatus>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          setCacheStatus(event.data);
          resolve(event.data);
        };
        
        state.registration.active?.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error getting cache status:', error);
    }
  }, [state.registration]);

  // Limpiar cache
  const clearCache = useCallback(async () => {
    if (!state.registration?.active) return;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            setCacheStatus({});
            showNotification('Cache limpiado correctamente', 'success');
            resolve(true);
          } else {
            showNotification('Error al limpiar cache', 'error');
            resolve(false);
          }
        };
        
        state.registration.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      showNotification('Error al limpiar cache', 'error');
      return false;
    }
  }, [state.registration, showNotification]);

  // Forzar sincronización
  const forceSync = useCallback(async () => {
    if (!state.registration?.active) return;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            showNotification('Sincronización completada', 'success');
            setSyncQueue([]);
            resolve(true);
          } else {
            showNotification('Error en la sincronización', 'error');
            resolve(false);
          }
        };
        
        state.registration.active?.postMessage(
          { type: 'FORCE_SYNC' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error forcing sync:', error);
      showNotification('Error en la sincronización', 'error');
      return false;
    }
  }, [state.registration, showNotification]);

  // Escuchar mensajes del Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, url } = event.data;

      switch (type) {
        case 'OFFLINE_DATA':
          showNotification(
            'Mostrando datos offline. Algunos datos pueden no estar actualizados.',
            'warning',
            { duration: 5000 }
          );
          break;

        case 'SYNC_SUCCESS':
          showNotification(
            'Datos sincronizados correctamente',
            'success'
          );
          // Actualizar cola de sincronización
          setSyncQueue(prev => prev.filter(item => item.url !== url));
          break;

        case 'UPDATE_AVAILABLE':
          setState(prev => ({ ...prev, updateAvailable: true }));
          break;

        default:
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [showNotification]);

  // Escuchar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Conexión restaurada', 'success');
      // Intentar sincronizar automáticamente
      if (syncQueue.length > 0) {
        forceSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification(
        'Sin conexión. Los datos se guardarán y sincronizarán cuando vuelva la conexión.',
        'warning',
        { duration: 8000 }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification, syncQueue.length, forceSync]);

  // Registrar Service Worker al montar
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  // Obtener estado del cache periódicamente
  useEffect(() => {
    if (state.isRegistered) {
      getCacheStatus();
      const interval = setInterval(getCacheStatus, 30000); // Cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [state.isRegistered, getCacheStatus]);

  return {
    ...state,
    isOnline,
    cacheStatus,
    syncQueue,
    activateUpdate,
    getCacheStatus,
    clearCache,
    forceSync,
    registerServiceWorker
  };
};

// Hook específico para funcionalidad offline
export const useOfflineMode = () => {
  const { isOnline, syncQueue, forceSync } = useServiceWorker();
  const { showNotification } = useNotificationHelpers();

  // Guardar datos offline
  const saveOfflineData = useCallback(async (key: string, data: any) => {
    try {
      const offlineData = {
        data,
        timestamp: Date.now(),
        synced: false
      };
      
      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
      
      showNotification(
        'Datos guardados offline. Se sincronizarán cuando vuelva la conexión.',
        'info'
      );
      
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      showNotification('Error al guardar datos offline', 'error');
      return false;
    }
  }, [showNotification]);

  // Obtener datos offline
  const getOfflineData = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }, []);

  // Limpiar datos offline sincronizados
  const clearSyncedOfflineData = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('offline_')
      );
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.synced) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error clearing synced offline data:', error);
    }
  }, []);

  return {
    isOnline,
    syncQueue,
    hasPendingSync: syncQueue.length > 0,
    saveOfflineData,
    getOfflineData,
    clearSyncedOfflineData,
    forceSync
  };
};

export default useServiceWorker;
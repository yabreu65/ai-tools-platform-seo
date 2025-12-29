'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePWA, useOfflineSync } from '@/hooks/usePWA';
import { toast } from 'sonner';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  supportsPWA: boolean;
  updateAvailable: boolean;
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<void>;
  shareApp: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  cacheOfflineData: (type: 'analytics' | 'feedback', data: any) => Promise<void>;
  pendingSync: boolean;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const pwa = usePWA();
  const { cacheOfflineData, pendingSync } = useOfflineSync();
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);
  const [hasShownOnlineToast, setHasShownOnlineToast] = useState(false);

  // Handle online/offline status changes
  useEffect(() => {
    if (!pwa.isOnline && !hasShownOfflineToast) {
      toast.warning('Sin conexión a internet', {
        description: 'Trabajando en modo offline. Los datos se sincronizarán cuando vuelvas a estar online.',
        duration: 5000,
      });
      setHasShownOfflineToast(true);
      setHasShownOnlineToast(false);
    } else if (pwa.isOnline && hasShownOfflineToast && !hasShownOnlineToast) {
      toast.success('Conexión restaurada', {
        description: 'Sincronizando datos pendientes...',
        duration: 3000,
      });
      setHasShownOnlineToast(true);
      setHasShownOfflineToast(false);
    }
  }, [pwa.isOnline, hasShownOfflineToast, hasShownOnlineToast]);

  // Handle app updates
  useEffect(() => {
    if (pwa.updateAvailable) {
      toast.info('Actualización disponible', {
        description: 'Nueva versión de YA Tools disponible',
        action: {
          label: 'Actualizar',
          onClick: () => pwa.updateApp(),
        },
        duration: 10000,
      });
    }
  }, [pwa.updateAvailable, pwa.updateApp]);

  // Handle successful installation
  useEffect(() => {
    if (pwa.isInstalled && pwa.isStandalone) {
      // Show welcome message for first-time app users
      const hasShownWelcome = localStorage.getItem('pwa-welcome-shown');
      if (!hasShownWelcome) {
        setTimeout(() => {
          toast.success('¡Bienvenido a YA Tools!', {
            description: 'La app se ha instalado correctamente. Ahora puedes acceder más rápido a todas las herramientas.',
            duration: 5000,
          });
          localStorage.setItem('pwa-welcome-shown', 'true');
        }, 1000);
      }
    }
  }, [pwa.isInstalled, pwa.isStandalone]);

  // Handle pending sync notifications
  useEffect(() => {
    if (pendingSync && pwa.isOnline) {
      toast.info('Sincronizando datos...', {
        description: 'Enviando datos guardados mientras estabas offline',
        duration: 3000,
      });
    }
  }, [pendingSync, pwa.isOnline]);

  const contextValue: PWAContextType = {
    ...pwa,
    cacheOfflineData,
    pendingSync,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

// Hook for offline-first data operations
export function useOfflineFirst() {
  const { isOnline, cacheOfflineData } = usePWAContext();

  const saveData = async (type: 'analytics' | 'feedback', data: any, endpoint: string) => {
    if (isOnline) {
      try {
        // Try to send immediately if online
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Network request failed');
        }

        return await response.json();
      } catch (error) {
        // If network fails, cache for later
        console.warn('Network request failed, caching for offline sync:', error);
        await cacheOfflineData(type, data);
        throw error;
      }
    } else {
      // Cache for later sync when offline
      await cacheOfflineData(type, data);
      toast.info('Datos guardados offline', {
        description: 'Se sincronizarán cuando vuelvas a estar online',
      });
      return { cached: true };
    }
  };

  return { saveData, isOnline };
}

// Component for PWA status indicator
export function PWAStatusIndicator() {
  const { isOnline, isStandalone, updateAvailable, pendingSync } = usePWAContext();

  if (!isStandalone) {
    return null; // Only show in standalone mode
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {!isOnline && (
        <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Offline
        </div>
      )}
      
      {updateAvailable && (
        <div className="bg-blue-100 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Actualización disponible
        </div>
      )}
      
      {pendingSync && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          Sincronizando...
        </div>
      )}
    </div>
  );
}
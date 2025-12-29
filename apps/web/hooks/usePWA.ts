'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  supportsPWA: boolean;
  updateAvailable: boolean;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<void>;
  shareApp: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
}

export function usePWA(): PWAState & PWAActions {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check PWA support
  useEffect(() => {
    const checkPWASupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = 'manifest' in document.createElement('link');
      const hasNotifications = 'Notification' in window;
      
      setSupportsPWA(hasServiceWorker && hasManifest);
    };

    checkPWASupport();
  }, []);

  // Check if app is installed/standalone
  useEffect(() => {
    const checkInstallStatus = () => {
      // Check if running in standalone mode
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkInstallStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA: App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    if (!supportsPWA) return;

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                console.log('PWA: Update available');
              }
            });
          }
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        console.log('PWA: Service Worker registered successfully');
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [supportsPWA]);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('PWA: Install prompt not available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Update app
  const updateApp = useCallback(async (): Promise<void> => {
    if (!registration || !updateAvailable) return;

    try {
      const waitingWorker = registration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error('PWA: Update failed:', error);
    }
  }, [registration, updateAvailable]);

  // Share app
  const shareApp = useCallback(async (): Promise<boolean> => {
    if (!navigator.share) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        return true;
      } catch (error) {
        console.error('PWA: Share fallback failed:', error);
        return false;
      }
    }

    try {
      await navigator.share({
        title: 'YA Tools - Herramientas SEO',
        text: 'Suite completa de herramientas SEO y marketing digital',
        url: window.location.origin,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('PWA: Share failed:', error);
      }
      return false;
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('PWA: Notification permission request failed:', error);
      return 'denied';
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!registration || !('PushManager' in window)) {
      console.warn('PWA: Push notifications not supported');
      return false;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      console.log('PWA: Push notification subscription successful');
      return true;
    } catch (error) {
      console.error('PWA: Push notification subscription failed:', error);
      return false;
    }
  }, [registration, requestNotificationPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      return false;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        console.log('PWA: Push notification unsubscription successful');
      }
      return true;
    } catch (error) {
      console.error('PWA: Push notification unsubscription failed:', error);
      return false;
    }
  }, [registration]);

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    supportsPWA,
    updateAvailable,
    
    // Actions
    installApp,
    updateApp,
    shareApp,
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };
}

// Hook for offline data sync
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync) {
        triggerBackgroundSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const triggerBackgroundSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-analytics');
        await registration.sync.register('background-sync-feedback');
        setPendingSync(false);
        console.log('PWA: Background sync registered');
      } catch (error) {
        console.error('PWA: Background sync registration failed:', error);
      }
    }
  }, []);

  const cacheOfflineData = useCallback(async (type: 'analytics' | 'feedback', data: any) => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: `CACHE_${type.toUpperCase()}`,
            payload: data,
          });
          setPendingSync(true);
          console.log(`PWA: ${type} data cached for offline sync`);
        }
      } catch (error) {
        console.error(`PWA: Failed to cache ${type} data:`, error);
      }
    }
  }, []);

  return {
    isOnline,
    pendingSync,
    cacheOfflineData,
    triggerBackgroundSync,
  };
}
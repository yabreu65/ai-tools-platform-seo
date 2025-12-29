'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationHelpers } from '@/hooks/useNotifications';

// Tipos para Analytics
interface AnalyticsEvent {
  id: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

interface PageView {
  id: string;
  url: string;
  title: string;
  referrer: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  duration?: number;
  userAgent: string;
}

interface ToolUsage {
  id: string;
  toolName: string;
  toolCategory: string;
  action: 'start' | 'complete' | 'error' | 'cancel';
  userId?: string;
  sessionId: string;
  timestamp: number;
  duration?: number;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

interface ConversionEvent {
  id: string;
  type: 'signup' | 'login' | 'upgrade' | 'export' | 'save' | 'share';
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  toolUsage: number;
  conversions: number;
  avgSessionDuration: number;
  bounceRate: number;
  topTools: Array<{ name: string; usage: number }>;
  topPages: Array<{ url: string; views: number }>;
  conversionRate: number;
}

interface AnalyticsContextType {
  // Tracking methods
  trackEvent: (event: string, category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackToolUsage: (toolName: string, action: 'start' | 'complete' | 'error' | 'cancel', metadata?: any) => void;
  trackConversion: (type: ConversionEvent['type'], value?: number, metadata?: Record<string, any>) => void;
  
  // Data retrieval
  getMetrics: (timeRange?: 'day' | 'week' | 'month' | 'year') => Promise<AnalyticsMetrics>;
  getEvents: (filters?: any) => Promise<AnalyticsEvent[]>;
  getPageViews: (filters?: any) => Promise<PageView[]>;
  getToolUsage: (filters?: any) => Promise<ToolUsage[]>;
  getConversions: (filters?: any) => Promise<ConversionEvent[]>;
  
  // Session management
  sessionId: string;
  startSession: () => void;
  endSession: () => void;
  
  // Settings
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  
  // Real-time metrics
  currentMetrics: AnalyticsMetrics | null;
  isLoading: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showInfo } = useNotificationHelpers();
  
  const [sessionId, setSessionId] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [currentMetrics, setCurrentMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageStartTime, setPageStartTime] = useState<number>(Date.now());

  // Refs para funciones para evitar bucles infinitos en useEffect
  const startSessionRef = useRef<() => void>(() => {});
  const syncOfflineDataRef = useRef<() => void>(() => {});
  const trackPageViewRef = useRef<(url?: string, title?: string) => void>(() => {});
  const endSessionRef = useRef<() => void>(() => {});

  // Generar session ID único
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Inicializar sesión
  const startSession = useCallback(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    localStorage.setItem('analytics_session_id', newSessionId);
    localStorage.setItem('analytics_session_start', Date.now().toString());
  }, [generateSessionId]);
  
  // Actualizar ref
  startSessionRef.current = startSession;

  // Finalizar sesión
  const endSession = useCallback(() => {
    const sessionStart = localStorage.getItem('analytics_session_start');
    if (sessionStart) {
      const duration = Date.now() - parseInt(sessionStart);
      trackEvent('session', 'engagement', 'end', 'session_duration', duration);
    }
    localStorage.removeItem('analytics_session_id');
    localStorage.removeItem('analytics_session_start');
  }, []);
  
  // Actualizar ref
  endSessionRef.current = endSession;

  // Enviar datos a la API
  const sendAnalyticsData = useCallback(async (endpoint: string, data: any) => {
    if (!isEnabled) return;

    try {
      const response = await fetch(`/api/analytics/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics error:', error);
      
      // Guardar offline para sincronizar después
      const offlineData = JSON.parse(localStorage.getItem('analytics_offline') || '[]');
      offlineData.push({ endpoint, data, timestamp: Date.now() });
      localStorage.setItem('analytics_offline', JSON.stringify(offlineData));
    }
  }, [isEnabled]);

  // Sincronizar datos offline
  const syncOfflineData = useCallback(async () => {
    const offlineData = JSON.parse(localStorage.getItem('analytics_offline') || '[]');
    if (offlineData.length === 0) return;

    try {
      for (const item of offlineData) {
        await sendAnalyticsData(item.endpoint, item.data);
      }
      localStorage.removeItem('analytics_offline');
      console.log('Analytics offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline analytics data:', error);
    }
  }, [sendAnalyticsData]);
  
  // Actualizar ref
  syncOfflineDataRef.current = syncOfflineData;

  // Tracking de eventos
  const trackEvent = useCallback((
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    const eventData: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      event,
      category,
      action,
      label,
      value,
      userId: user?.id,
      sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      metadata
    };

    sendAnalyticsData('events', eventData);
  }, [user?.id, sessionId, sendAnalyticsData]);

  // Tracking de page views
  const trackPageView = useCallback((url?: string, title?: string) => {
    const currentUrl = url || window.location.href;
    const currentTitle = title || document.title;
    const referrer = document.referrer;

    // Calcular duración de la página anterior
    const duration = Date.now() - pageStartTime;
    if (duration > 1000) { // Solo si estuvo más de 1 segundo
      trackEvent('page', 'engagement', 'time_on_page', currentUrl, duration);
    }

    const pageViewData: PageView = {
      id: `pageview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      url: currentUrl,
      title: currentTitle,
      referrer,
      userId: user?.id,
      sessionId,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
    };

    sendAnalyticsData('pageviews', pageViewData);
    setPageStartTime(Date.now());
  }, [user?.id, sessionId, sendAnalyticsData, pageStartTime, trackEvent]);
  
  // Actualizar ref
  trackPageViewRef.current = trackPageView;

  // Tracking de uso de herramientas
  const trackToolUsage = useCallback((
    toolName: string,
    action: 'start' | 'complete' | 'error' | 'cancel',
    metadata?: any
  ) => {
    const toolUsageData: ToolUsage = {
      id: `tool_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      toolName,
      toolCategory: metadata?.category || 'seo',
      action,
      userId: user?.id,
      sessionId,
      timestamp: Date.now(),
      duration: metadata?.duration,
      inputData: metadata?.input,
      outputData: metadata?.output,
      errorMessage: metadata?.error,
      metadata
    };

    sendAnalyticsData('tools', toolUsageData);

    // Tracking adicional para conversiones
    if (action === 'complete') {
      trackConversion('export', undefined, { toolName });
    }
  }, [user?.id, sessionId, sendAnalyticsData]);

  // Tracking de conversiones
  const trackConversion = useCallback((
    type: ConversionEvent['type'],
    value?: number,
    metadata?: Record<string, any>
  ) => {
    const conversionData: ConversionEvent = {
      id: `conversion_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      value,
      userId: user?.id,
      sessionId,
      timestamp: Date.now(),
      metadata
    };

    sendAnalyticsData('conversions', conversionData);
  }, [user?.id, sessionId, sendAnalyticsData]);

  // Obtener métricas
  const getMetrics = useCallback(async (timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<AnalyticsMetrics> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/metrics?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const metrics = await response.json();
      setCurrentMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      showInfo('Error al cargar métricas de analytics', 'Error al cargar métricas de analytics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showInfo]);

  // Obtener eventos
  const getEvents = useCallback(async (filters?: any): Promise<AnalyticsEvent[]> => {
    try {
      const queryParams = new URLSearchParams(filters || {});
      const response = await fetch(`/api/analytics/events?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }, []);

  // Obtener page views
  const getPageViews = useCallback(async (filters?: any): Promise<PageView[]> => {
    try {
      const queryParams = new URLSearchParams(filters || {});
      const response = await fetch(`/api/analytics/pageviews?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch page views');
      return await response.json();
    } catch (error) {
      console.error('Error fetching page views:', error);
      return [];
    }
  }, []);

  // Obtener uso de herramientas
  const getToolUsage = useCallback(async (filters?: any): Promise<ToolUsage[]> => {
    try {
      const queryParams = new URLSearchParams(filters || {});
      const response = await fetch(`/api/analytics/tools?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch tool usage');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tool usage:', error);
      return [];
    }
  }, []);

  // Obtener conversiones
  const getConversions = useCallback(async (filters?: any): Promise<ConversionEvent[]> => {
    try {
      const queryParams = new URLSearchParams(filters || {});
      const response = await fetch(`/api/analytics/conversions?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch conversions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversions:', error);
      return [];
    }
  }, []);

  // Inicializar analytics
  useEffect(() => {
    // Recuperar o crear session ID
    const existingSessionId = localStorage.getItem('analytics_session_id');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      startSessionRef.current?.();
    }

    // Sincronizar datos offline al conectarse
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncOfflineDataRef.current?.();
    }

    // Tracking automático de page view inicial
    trackPageViewRef.current?.();

    // Cleanup al cerrar la ventana
    const handleBeforeUnload = () => {
      endSessionRef.current?.();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Removidas dependencias para evitar bucles infinitos

  // Tracking automático de cambios de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      trackPageViewRef.current?.();
    };

    // Escuchar cambios de URL (para SPAs)
    window.addEventListener('popstate', handleRouteChange);
    
    // Observer para cambios en el DOM (título de página)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.head) {
          const titleElement = document.querySelector('title');
          if (titleElement && titleElement.textContent !== document.title) {
            trackPageViewRef.current?.();
          }
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, []); // Removida dependencia para evitar bucles infinitos

  // Cargar métricas iniciales
  useEffect(() => {
    if (user && isEnabled) {
      getMetrics('week').catch(console.error);
    }
  }, [user, isEnabled]); // Removido getMetrics para evitar bucle infinito

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackToolUsage,
    trackConversion,
    getMetrics,
    getEvents,
    getPageViews,
    getToolUsage,
    getConversions,
    sessionId,
    startSession,
    endSession,
    isEnabled,
    setEnabled: setIsEnabled,
    currentMetrics,
    isLoading
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
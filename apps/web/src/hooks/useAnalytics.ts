import { useContext, useCallback, useEffect, useState } from 'react';
import AnalyticsContext from '@/src/contexts/AnalyticsContext';

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
};

// Hook específico para tracking de herramientas SEO
export const useSEOToolAnalytics = () => {
  const { trackToolUsage, trackEvent, trackConversion } = useAnalytics();
  
  return {
    // Iniciar análisis de herramienta
    startAnalysis: (toolName: string, inputData?: any) => {
      trackToolUsage(toolName, 'start', {
        category: 'seo',
        input: inputData,
        startTime: Date.now()
      });
      
      trackEvent('tool', 'seo', 'analysis_start', toolName);
    },
    
    // Completar análisis exitosamente
    completeAnalysis: (toolName: string, inputData?: any, outputData?: any, duration?: number) => {
      trackToolUsage(toolName, 'complete', {
        category: 'seo',
        input: inputData,
        output: outputData,
        duration
      });
      
      trackEvent('tool', 'seo', 'analysis_complete', toolName, duration);
      trackConversion('export', undefined, { toolName, success: true });
    },
    
    // Error en análisis
    errorAnalysis: (toolName: string, error: string, inputData?: any) => {
      trackToolUsage(toolName, 'error', {
        category: 'seo',
        input: inputData,
        error
      });
      
      trackEvent('tool', 'seo', 'analysis_error', toolName, undefined, { error });
    },
    
    // Cancelar análisis
    cancelAnalysis: (toolName: string, reason?: string) => {
      trackToolUsage(toolName, 'cancel', {
        category: 'seo',
        reason
      });
      
      trackEvent('tool', 'seo', 'analysis_cancel', toolName, undefined, { reason });
    },
    
    // Guardar resultado
    saveResult: (toolName: string, resultId: string) => {
      trackEvent('tool', 'seo', 'result_save', toolName, undefined, { resultId });
      trackConversion('save', undefined, { toolName, resultId });
    },
    
    // Exportar resultado
    exportResult: (toolName: string, format: string, resultId: string) => {
      trackEvent('tool', 'seo', 'result_export', toolName, undefined, { format, resultId });
      trackConversion('export', undefined, { toolName, format, resultId });
    },
    
    // Compartir resultado
    shareResult: (toolName: string, platform: string, resultId: string) => {
      trackEvent('tool', 'seo', 'result_share', toolName, undefined, { platform, resultId });
      trackConversion('share', undefined, { toolName, platform, resultId });
    }
  };
};

// Hook para tracking de engagement
export const useEngagementAnalytics = () => {
  const { trackEvent } = useAnalytics();
  const [startTime] = useState(Date.now());
  
  return {
    // Tiempo en página
    trackTimeOnPage: useCallback((pageName: string) => {
      const timeSpent = Date.now() - startTime;
      trackEvent('engagement', 'time', 'page_duration', pageName, timeSpent);
    }, [trackEvent, startTime]),
    
    // Scroll depth
    trackScrollDepth: useCallback((depth: number, pageName: string) => {
      trackEvent('engagement', 'scroll', 'depth', pageName, depth);
    }, [trackEvent]),
    
    // Clicks en elementos
    trackElementClick: useCallback((elementType: string, elementId: string, pageName: string) => {
      trackEvent('engagement', 'click', elementType, `${pageName}:${elementId}`);
    }, [trackEvent]),
    
    // Formularios
    trackFormInteraction: useCallback((formName: string, action: 'start' | 'complete' | 'abandon') => {
      trackEvent('engagement', 'form', action, formName);
    }, [trackEvent]),
    
    // Búsquedas
    trackSearch: useCallback((query: string, results: number) => {
      trackEvent('engagement', 'search', 'query', query, results);
    }, [trackEvent])
  };
};

// Hook para tracking de conversiones
export const useConversionAnalytics = () => {
  const { trackConversion, trackEvent } = useAnalytics();
  
  return {
    // Registro de usuario
    trackSignup: (method: string = 'email') => {
      trackConversion('signup', undefined, { method });
      trackEvent('conversion', 'auth', 'signup', method);
    },
    
    // Login
    trackLogin: (method: string = 'email') => {
      trackConversion('login', undefined, { method });
      trackEvent('conversion', 'auth', 'login', method);
    },
    
    // Upgrade de plan
    trackUpgrade: (fromPlan: string, toPlan: string, value?: number) => {
      trackConversion('upgrade', value, { fromPlan, toPlan });
      trackEvent('conversion', 'subscription', 'upgrade', `${fromPlan}_to_${toPlan}`, value);
    },
    
    // Uso de herramienta premium
    trackPremiumFeatureUse: (feature: string, planRequired: string) => {
      trackEvent('conversion', 'premium', 'feature_attempt', feature, undefined, { planRequired });
    },
    
    // Límite de plan alcanzado
    trackPlanLimitReached: (planName: string, limitType: string) => {
      trackEvent('conversion', 'limit', 'reached', `${planName}_${limitType}`);
    }
  };
};

// Hook para métricas en tiempo real
export const useRealTimeMetrics = (refreshInterval: number = 30000) => {
  const { getMetrics, currentMetrics, isLoading } = useAnalytics();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        await getMetrics('day');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading metrics');
      }
    };
    
    // Fetch inicial
    fetchMetrics();
    
    // Refresh periódico
    const interval = setInterval(fetchMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [getMetrics, refreshInterval]);
  
  return {
    metrics: currentMetrics,
    isLoading,
    error,
    refresh: () => getMetrics('day')
  };
};

// Hook para tracking automático de scroll
export const useScrollTracking = (pageName: string) => {
  const { trackScrollDepth } = useEngagementAnalytics();
  const [maxScroll, setMaxScroll] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        setMaxScroll(scrollPercent);
        trackScrollDepth(scrollPercent, pageName);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScroll, trackScrollDepth, pageName]);
};

// Hook para tracking de performance
export const usePerformanceTracking = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Web Vitals tracking
    if ('web-vital' in window) {
      // @ts-ignore
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          trackEvent('performance', 'web-vitals', 'CLS', 'cumulative-layout-shift', metric.value);
        });
        
        getFID((metric) => {
          trackEvent('performance', 'web-vitals', 'FID', 'first-input-delay', metric.value);
        });
        
        getFCP((metric) => {
          trackEvent('performance', 'web-vitals', 'FCP', 'first-contentful-paint', metric.value);
        });
        
        getLCP((metric) => {
          trackEvent('performance', 'web-vitals', 'LCP', 'largest-contentful-paint', metric.value);
        });
        
        getTTFB((metric) => {
          trackEvent('performance', 'web-vitals', 'TTFB', 'time-to-first-byte', metric.value);
        });
      }).catch(console.error);
    }
    
    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        
        trackEvent('performance', 'timing', 'page-load', window.location.pathname, loadTime);
        trackEvent('performance', 'timing', 'dom-content-loaded', window.location.pathname, domContentLoaded);
      }
    }
  }, [trackEvent]);
};

export default useAnalytics;
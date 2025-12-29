'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableCSSOptimization: boolean;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  enableCaching: boolean;
  enablePerformanceMonitoring: boolean;
}

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  loadTime: number;
  domContentLoaded: number;
  resourceCount: number;
  bundleSize: number;
  cacheHitRate: number;
  imageOptimizationRate: number;
  fontLoadTime: number;
  cssLoadTime: number;
  performanceScore: number;
}

interface OptimizationState {
  isOptimized: boolean;
  isLoading: boolean;
  metrics: PerformanceMetrics;
  config: OptimizationConfig;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Default configuration
const defaultConfig: OptimizationConfig = {
  enableImageOptimization: true,
  enableFontOptimization: true,
  enableCSSOptimization: true,
  enableLazyLoading: true,
  enablePreloading: true,
  enableCaching: true,
  enablePerformanceMonitoring: true,
};

// Default metrics
const defaultMetrics: PerformanceMetrics = {
  lcp: 0,
  fid: 0,
  cls: 0,
  fcp: 0,
  ttfb: 0,
  loadTime: 0,
  domContentLoaded: 0,
  resourceCount: 0,
  bundleSize: 0,
  cacheHitRate: 0,
  imageOptimizationRate: 0,
  fontLoadTime: 0,
  cssLoadTime: 0,
  performanceScore: 0,
};

export function useOptimization(initialConfig?: Partial<OptimizationConfig>) {
  const [state, setState] = useState<OptimizationState>({
    isOptimized: false,
    isLoading: true,
    metrics: defaultMetrics,
    config: { ...defaultConfig, ...initialConfig },
    errors: [],
    warnings: [],
    suggestions: [],
  });

  const metricsRef = useRef<PerformanceMetrics>(defaultMetrics);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');
      
      if (!navigation) return;

      // Basic timing metrics
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      const ttfb = navigation.responseStart - navigation.navigationStart;
      
      // Resource analysis
      const resourceCount = resources.length;
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const fontResources = resources.filter(r => 
        r.name.includes('font') || r.name.includes('.woff') || r.name.includes('.ttf')
      );
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.webp') || r.name.includes('.avif') || r.name.includes('.svg')
      );

      // Bundle size calculation
      const bundleSize = jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);

      // Cache hit rate
      const cachedResources = resources.filter(r => r.transferSize === 0);
      const cacheHitRate = resourceCount > 0 ? (cachedResources.length / resourceCount) * 100 : 0;

      // Font load time
      const fontLoadTime = fontResources.reduce((max, resource) => {
        return Math.max(max, resource.responseEnd - resource.startTime);
      }, 0);

      // CSS load time
      const cssLoadTime = cssResources.reduce((max, resource) => {
        return Math.max(max, resource.responseEnd - resource.startTime);
      }, 0);

      // Image optimization rate
      const optimizedImages = imageResources.filter(r => 
        r.name.includes('.webp') || r.name.includes('.avif')
      );
      const imageOptimizationRate = imageResources.length > 0 
        ? (optimizedImages.length / imageResources.length) * 100 
        : 100;

      // Update metrics
      const newMetrics: PerformanceMetrics = {
        ...metricsRef.current,
        loadTime,
        domContentLoaded,
        ttfb,
        resourceCount,
        bundleSize,
        cacheHitRate,
        fontLoadTime,
        cssLoadTime,
        imageOptimizationRate,
        performanceScore: calculatePerformanceScore({
          loadTime,
          bundleSize,
          cacheHitRate,
          imageOptimizationRate,
          ttfb,
        }),
      };

      metricsRef.current = newMetrics;
      
      setState(prev => ({
        ...prev,
        metrics: newMetrics,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error collecting metrics:', error);
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, 'Error collecting performance metrics'],
        isLoading: false,
      }));
    }
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = useCallback((metrics: {
    loadTime: number;
    bundleSize: number;
    cacheHitRate: number;
    imageOptimizationRate: number;
    ttfb: number;
  }) => {
    let score = 100;

    // Load time scoring
    if (metrics.loadTime > 4000) score -= 40;
    else if (metrics.loadTime > 3000) score -= 25;
    else if (metrics.loadTime > 2000) score -= 15;
    else if (metrics.loadTime > 1000) score -= 5;

    // Bundle size scoring
    if (metrics.bundleSize > 2000000) score -= 30; // 2MB
    else if (metrics.bundleSize > 1000000) score -= 20; // 1MB
    else if (metrics.bundleSize > 500000) score -= 10; // 500KB

    // Cache hit rate scoring
    if (metrics.cacheHitRate < 30) score -= 20;
    else if (metrics.cacheHitRate < 50) score -= 10;
    else if (metrics.cacheHitRate < 70) score -= 5;

    // Image optimization scoring
    if (metrics.imageOptimizationRate < 50) score -= 15;
    else if (metrics.imageOptimizationRate < 80) score -= 8;

    // TTFB scoring
    if (metrics.ttfb > 800) score -= 15;
    else if (metrics.ttfb > 600) score -= 10;
    else if (metrics.ttfb > 400) score -= 5;

    return Math.max(0, Math.min(100, score));
  }, []);

  // Generate optimization suggestions
  const generateSuggestions = useCallback((metrics: PerformanceMetrics) => {
    const suggestions: string[] = [];

    if (metrics.loadTime > 3000) {
      suggestions.push('Reducir el tiempo de carga general de la página');
    }

    if (metrics.bundleSize > 1000000) {
      suggestions.push('Implementar code splitting para reducir el tamaño del bundle');
    }

    if (metrics.cacheHitRate < 50) {
      suggestions.push('Mejorar la estrategia de caché para recursos estáticos');
    }

    if (metrics.imageOptimizationRate < 80) {
      suggestions.push('Convertir más imágenes a formatos modernos (WebP, AVIF)');
    }

    if (metrics.fontLoadTime > 1000) {
      suggestions.push('Optimizar la carga de fuentes con preload y font-display');
    }

    if (metrics.cssLoadTime > 500) {
      suggestions.push('Implementar critical CSS y lazy loading para CSS no crítico');
    }

    if (metrics.ttfb > 600) {
      suggestions.push('Optimizar el tiempo de respuesta del servidor');
    }

    if (metrics.performanceScore >= 90) {
      suggestions.push('¡Excelente! Tu aplicación está bien optimizada');
    }

    return suggestions;
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (!state.config.enablePerformanceMonitoring) return;

    // Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              metricsRef.current.lcp = entry.startTime;
            } else if (entry.entryType === 'first-input') {
              metricsRef.current.fid = (entry as any).processingStart - entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              if (!(entry as any).hadRecentInput) {
                metricsRef.current.cls += (entry as any).value;
              }
            } else if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              metricsRef.current.fcp = entry.startTime;
            }
          }

          setState(prev => ({
            ...prev,
            metrics: { ...metricsRef.current },
          }));
        });

        observerRef.current.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Collect initial metrics
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('load', collectMetrics);
    };
  }, [state.config.enablePerformanceMonitoring, collectMetrics]);

  // Update suggestions when metrics change
  useEffect(() => {
    const suggestions = generateSuggestions(state.metrics);
    setState(prev => ({
      ...prev,
      suggestions,
      isOptimized: state.metrics.performanceScore >= 80,
    }));
  }, [state.metrics, generateSuggestions]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<OptimizationConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }));
  }, []);

  // Refresh metrics
  const refreshMetrics = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    setTimeout(collectMetrics, 100);
  }, [collectMetrics]);

  // Clear errors and warnings
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
      warnings: [],
    }));
  }, []);

  // Export performance data
  const exportMetrics = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: state.metrics,
      config: state.config,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.metrics, state.config]);

  return {
    ...state,
    updateConfig,
    refreshMetrics,
    clearMessages,
    exportMetrics,
    collectMetrics,
  };
}

// Hook for specific optimization features
export function useImageOptimization() {
  const [isSupported, setIsSupported] = useState(false);
  const [formats, setFormats] = useState<string[]>([]);

  useEffect(() => {
    const checkSupport = async () => {
      const supportedFormats: string[] = [];

      // Check WebP support
      const webpSupported = await new Promise<boolean>((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => resolve(webP.height === 2);
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });

      if (webpSupported) supportedFormats.push('webp');

      // Check AVIF support
      const avifSupported = await new Promise<boolean>((resolve) => {
        const avif = new Image();
        avif.onload = avif.onerror = () => resolve(avif.height === 2);
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });

      if (avifSupported) supportedFormats.push('avif');

      setFormats(supportedFormats);
      setIsSupported(supportedFormats.length > 0);
    };

    checkSupport();
  }, []);

  const getOptimalFormat = useCallback((originalFormat: string) => {
    if (formats.includes('avif')) return 'avif';
    if (formats.includes('webp')) return 'webp';
    return originalFormat;
  }, [formats]);

  const generateSrcSet = useCallback((src: string, sizes: number[]) => {
    const format = getOptimalFormat('webp');
    return sizes
      .map(size => `${src}?w=${size}&f=${format} ${size}w`)
      .join(', ');
  }, [getOptimalFormat]);

  return {
    isSupported,
    formats,
    getOptimalFormat,
    generateSrcSet,
  };
}

// Hook for font optimization
export function useFontOptimization() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState<string[]>([]);

  useEffect(() => {
    if ('fonts' in document) {
      const checkFonts = async () => {
        try {
          await document.fonts.ready;
          setFontsLoaded(true);
        } catch (error) {
          console.warn('Font loading check failed:', error);
        }
      };

      checkFonts();

      // Listen for font load events
      document.fonts.addEventListener('loadingdone', () => {
        setFontsLoaded(true);
        setLoadingFonts([]);
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        console.warn('Font loading error:', event);
      });
    }
  }, []);

  const preloadFont = useCallback((fontFamily: string, fontWeight = '400', fontStyle = 'normal') => {
    setLoadingFonts(prev => [...prev, fontFamily]);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = `/fonts/${fontFamily}-${fontWeight}-${fontStyle}.woff2`;

    link.onload = () => {
      setLoadingFonts(prev => prev.filter(f => f !== fontFamily));
    };

    link.onerror = () => {
      setLoadingFonts(prev => prev.filter(f => f !== fontFamily));
      console.warn(`Failed to preload font: ${fontFamily}`);
    };

    document.head.appendChild(link);
  }, []);

  return {
    fontsLoaded,
    loadingFonts,
    preloadFont,
  };
}
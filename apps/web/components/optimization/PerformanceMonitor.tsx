'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  jsExecutionTime?: number;
  
  // Memory usage
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  
  // Network information
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface PerformanceEntry {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetrics;
  errors?: string[];
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [entries, setEntries] = useState<PerformanceEntry[]>([]);

  // Collect Core Web Vitals
  const collectWebVitals = useCallback(() => {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FCP - First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

      } catch (error) {
        console.error('Error setting up performance observers:', error);
      }
    }
  }, []);

  // Collect navigation timing
  const collectNavigationTiming = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
        }));
      }
    }
  }, []);

  // Collect resource timing
  const collectResourceTiming = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const totalResourceTime = resources.reduce((total, resource) => {
        return total + (resource.responseEnd - resource.startTime);
      }, 0);

      setMetrics(prev => ({
        ...prev,
        resourceLoadTime: totalResourceTime,
      }));
    }
  }, []);

  // Collect memory information
  const collectMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      }));
    }
  }, []);

  // Collect network information
  const collectNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({
        ...prev,
        connectionType: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      }));
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    collectWebVitals();
    collectNavigationTiming();
    collectResourceTiming();
    collectMemoryInfo();
    collectNetworkInfo();

    // Collect metrics periodically
    const interval = setInterval(() => {
      collectMemoryInfo();
      collectResourceTiming();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [collectWebVitals, collectNavigationTiming, collectResourceTiming, collectMemoryInfo, collectNetworkInfo]);

  // Save performance entry
  const saveEntry = useCallback(async (additionalData?: Partial<PerformanceEntry>) => {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      ...additionalData,
    };

    setEntries(prev => [...prev, entry]);

    // Send to analytics endpoint
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }, [metrics]);

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // LCP scoring (0-2.5s = good, 2.5-4s = needs improvement, >4s = poor)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (0-100ms = good, 100-300ms = needs improvement, >300ms = poor)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring (0-0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // FCP scoring (0-1.8s = good, 1.8-3s = needs improvement, >3s = poor)
    if (metrics.fcp) {
      if (metrics.fcp > 3000) score -= 20;
      else if (metrics.fcp > 1800) score -= 10;
    }

    return Math.max(0, score);
  }, [metrics]);

  return {
    metrics,
    isMonitoring,
    entries,
    startMonitoring,
    saveEntry,
    getPerformanceScore,
  };
}

// Performance monitor component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  const { startMonitoring, metrics, getPerformanceScore } = usePerformanceMonitor();
  const [showWarnings, setShowWarnings] = useState(true);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  // Show performance warnings
  useEffect(() => {
    if (!showWarnings) return;

    const checkPerformance = () => {
      const score = getPerformanceScore();
      
      if (score < 50) {
        toast.warning('Rendimiento bajo detectado', {
          description: 'La página está cargando lentamente. Considera optimizar recursos.',
          action: {
            label: 'Ver detalles',
            onClick: () => console.log('Performance metrics:', metrics),
          },
        });
      }

      // Check specific metrics
      if (metrics.lcp && metrics.lcp > 4000) {
        toast.error('LCP muy alto', {
          description: `Largest Contentful Paint: ${(metrics.lcp / 1000).toFixed(2)}s`,
        });
      }

      if (metrics.cls && metrics.cls > 0.25) {
        toast.error('CLS muy alto', {
          description: `Cumulative Layout Shift: ${metrics.cls.toFixed(3)}`,
        });
      }
    };

    const timeout = setTimeout(checkPerformance, 5000);
    return () => clearTimeout(timeout);
  }, [metrics, getPerformanceScore, showWarnings]);

  return <>{children}</>;
}

// Performance dashboard component
export function PerformanceDashboard() {
  const { metrics, getPerformanceScore, entries } = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  const score = getPerformanceScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (time?: number) => {
    if (!time) return 'N/A';
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Ver métricas de rendimiento"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Rendimiento</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Puntuación:</span>
          <span className={`font-bold ${getScoreColor(score)}`}>
            {score}/100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500">LCP</div>
            <div className="font-mono">{formatTime(metrics.lcp)}</div>
          </div>
          <div>
            <div className="text-gray-500">FID</div>
            <div className="font-mono">{formatTime(metrics.fid)}</div>
          </div>
          <div>
            <div className="text-gray-500">CLS</div>
            <div className="font-mono">{metrics.cls?.toFixed(3) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-500">FCP</div>
            <div className="font-mono">{formatTime(metrics.fcp)}</div>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="text-xs text-gray-500 mb-1">Memoria JS</div>
          <div className="text-xs font-mono">
            {formatBytes(metrics.usedJSHeapSize)} / {formatBytes(metrics.totalJSHeapSize)}
          </div>
        </div>

        {metrics.connectionType && (
          <div className="border-t pt-2">
            <div className="text-xs text-gray-500 mb-1">Conexión</div>
            <div className="text-xs">
              {metrics.effectiveType} ({metrics.downlink}Mbps)
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400">
          {entries.length} entradas registradas
        </div>
      </div>
    </div>
  );
}

// Critical Resource Preloader Component
export const CriticalResourcePreloader: React.FC = () => {
  useEffect(() => {
    // Preload critical resources with error handling
    const preloadResource = (href: string, as: string, type?: string) => {
      // Check if already preloaded
      const existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      
      // Add error handling
      link.onerror = () => {
        console.warn(`Failed to preload resource: ${href}`);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
      
      document.head.appendChild(link);
    };

    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      // Add other external domains you actually use
    ];

    preconnectDomains.forEach(domain => {
      const existingLink = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Only preload resources that actually exist
    const resourcesToPreload = [
      // Add only resources that exist in your project
      // { href: '/styles/globals.css', as: 'style' },
      // { href: '/_next/static/chunks/main.js', as: 'script' },
    ];

    resourcesToPreload.forEach(({ href, as, type }) => {
      preloadResource(href, as, type);
    });
  }, []);

  return null;
};
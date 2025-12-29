'use client';

import React from 'react';
import { PerformanceMonitor, PerformanceDashboard, CriticalResourcePreloader } from './PerformanceMonitor';
import { FontOptimizer, CriticalFontPreloader, FontLoadingIndicator } from './FontOptimizer';
import { CriticalCSSInjector, CSSLoadingOptimizer, CSSOptimizationReport } from './CriticalCSS';

interface OptimizationProviderProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableFontOptimization?: boolean;
  enableCSSOptimization?: boolean;
  enableDashboard?: boolean;
  showLoadingIndicators?: boolean;
}

export function OptimizationProvider({
  children,
  enablePerformanceMonitoring = true,
  enableFontOptimization = true,
  enableCSSOptimization = true,
  enableDashboard = process.env.NODE_ENV === 'development',
  showLoadingIndicators = true,
}: OptimizationProviderProps) {
  return (
    <>
      {/* Critical resource preloading */}
      <CriticalResourcePreloader />
      
      {/* Font optimization */}
      {enableFontOptimization && (
        <>
          <CriticalFontPreloader />
          {showLoadingIndicators && <FontLoadingIndicator />}
        </>
      )}
      
      {/* CSS optimization */}
      {enableCSSOptimization && (
        <>
          <CriticalCSSInjector />
          <CSSLoadingOptimizer />
        </>
      )}
      
      {/* Performance monitoring wrapper */}
      {enablePerformanceMonitoring ? (
        <PerformanceMonitor>
          {enableFontOptimization ? (
            <FontOptimizer>
              {children}
            </FontOptimizer>
          ) : (
            children
          )}
        </PerformanceMonitor>
      ) : enableFontOptimization ? (
        <FontOptimizer>
          {children}
        </FontOptimizer>
      ) : (
        children
      )}
      
      {/* Development dashboards */}
      {enableDashboard && (
        <>
          <PerformanceDashboard />
          <CSSOptimizationReport />
        </>
      )}
    </>
  );
}

// Hook for optimization metrics
export function useOptimizationMetrics() {
  const [metrics, setMetrics] = React.useState({
    performanceScore: 0,
    loadTime: 0,
    resourceCount: 0,
    cacheHitRate: 0,
    bundleSize: 0,
    imageOptimization: 0,
    fontLoadTime: 0,
    cssLoadTime: 0,
  });

  React.useEffect(() => {
    const collectMetrics = () => {
      // Performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');
      
      // Calculate metrics
      const loadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
      const resourceCount = resources.length;
      
      // Font load time
      const fontResources = resources.filter(r => r.name.includes('font') || r.name.includes('.woff'));
      const fontLoadTime = fontResources.reduce((max, resource) => {
        return Math.max(max, resource.responseEnd - resource.startTime);
      }, 0);
      
      // CSS load time
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const cssLoadTime = cssResources.reduce((max, resource) => {
        return Math.max(max, resource.responseEnd - resource.startTime);
      }, 0);
      
      // Bundle size estimation
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const bundleSize = jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      // Cache hit rate
      const cachedResources = resources.filter(r => r.transferSize === 0);
      const cacheHitRate = resourceCount > 0 ? (cachedResources.length / resourceCount) * 100 : 0;
      
      // Image optimization score
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.webp') || r.name.includes('.avif')
      );
      const webpImages = imageResources.filter(r => r.name.includes('.webp') || r.name.includes('.avif'));
      const imageOptimization = imageResources.length > 0 ? (webpImages.length / imageResources.length) * 100 : 100;
      
      // Performance score calculation
      let performanceScore = 100;
      if (loadTime > 3000) performanceScore -= 30;
      else if (loadTime > 2000) performanceScore -= 15;
      
      if (bundleSize > 1000000) performanceScore -= 20; // 1MB
      else if (bundleSize > 500000) performanceScore -= 10; // 500KB
      
      if (cacheHitRate < 50) performanceScore -= 15;
      if (imageOptimization < 80) performanceScore -= 10;
      
      setMetrics({
        performanceScore: Math.max(0, performanceScore),
        loadTime,
        resourceCount,
        cacheHitRate,
        bundleSize,
        imageOptimization,
        fontLoadTime,
        cssLoadTime,
      });
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  return metrics;
}

// Optimization status component
export function OptimizationStatus() {
  const metrics = useOptimizationMetrics();
  const [isVisible, setIsVisible] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 left-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
        title="Ver estado de optimización"
      >
        ⚡
      </button>
    );
  }

  return (
    <div className="fixed bottom-36 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Optimización</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Performance Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Puntuación:</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(metrics.performanceScore)}`}></div>
            <span className="font-bold">{metrics.performanceScore}/100</span>
          </div>
        </div>

        {/* Load Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tiempo de carga:</span>
          <span className="text-sm font-mono">{(metrics.loadTime / 1000).toFixed(2)}s</span>
        </div>

        {/* Bundle Size */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tamaño bundle:</span>
          <span className="text-sm font-mono">{formatBytes(metrics.bundleSize)}</span>
        </div>

        {/* Cache Hit Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cache hit rate:</span>
          <span className="text-sm font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
        </div>

        {/* Image Optimization */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Imágenes optimizadas:</span>
          <span className="text-sm font-mono">{metrics.imageOptimization.toFixed(1)}%</span>
        </div>

        {/* Resource Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Recursos:</span>
          <span className="text-sm font-mono">{metrics.resourceCount}</span>
        </div>

        {/* Font Load Time */}
        {metrics.fontLoadTime > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Carga fuentes:</span>
            <span className="text-sm font-mono">{(metrics.fontLoadTime / 1000).toFixed(2)}s</span>
          </div>
        )}

        {/* CSS Load Time */}
        {metrics.cssLoadTime > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Carga CSS:</span>
            <span className="text-sm font-mono">{(metrics.cssLoadTime / 1000).toFixed(2)}s</span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500 space-y-1">
          {metrics.performanceScore < 70 && (
            <div className="text-red-600">• Optimizar rendimiento general</div>
          )}
          {metrics.bundleSize > 500000 && (
            <div className="text-yellow-600">• Reducir tamaño del bundle</div>
          )}
          {metrics.cacheHitRate < 50 && (
            <div className="text-yellow-600">• Mejorar estrategia de cache</div>
          )}
          {metrics.imageOptimization < 80 && (
            <div className="text-yellow-600">• Optimizar más imágenes</div>
          )}
          {metrics.performanceScore >= 90 && (
            <div className="text-green-600">• ¡Excelente optimización!</div>
          )}
        </div>
      </div>
    </div>
  );
}
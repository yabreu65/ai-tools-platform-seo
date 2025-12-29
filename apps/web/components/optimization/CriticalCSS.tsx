'use client';

import React, { useEffect, useState } from 'react';

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Critical layout styles */
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .hero-section {
    padding: 4rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
  
  .cta-button {
    display: inline-block;
    padding: 0.75rem 2rem;
    background-color: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  .cta-button:hover {
    background-color: #2563eb;
  }
  
  /* Loading states */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Grid system */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .grid {
    display: grid;
    gap: 1rem;
  }
  
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  
  @media (min-width: 768px) {
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  
  @media (min-width: 1024px) {
    .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  
  /* Utility classes */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  
  .text-sm { font-size: 0.875rem; }
  .text-base { font-size: 1rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }
  
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  
  .rounded { border-radius: 0.25rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  
  .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
  
  .bg-white { background-color: white; }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-gray-100 { background-color: #f3f4f6; }
  
  .text-gray-600 { color: #4b5563; }
  .text-gray-900 { color: #111827; }
  
  .border { border-width: 1px; }
  .border-gray-200 { border-color: #e5e7eb; }
  
  /* Responsive utilities */
  .hidden { display: none; }
  .block { display: block; }
  .flex { display: flex; }
  .inline-flex { display: inline-flex; }
  
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  
  @media (min-width: 768px) {
    .md\\:block { display: block; }
    .md\\:hidden { display: none; }
    .md\\:flex { display: flex; }
  }
`;

// Critical CSS Injector Component
export const CriticalCSSInjector: React.FC = () => {
  useEffect(() => {
    // Inject critical CSS
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    // Load non-critical CSS asynchronously with error handling
    const loadNonCriticalCSS = () => {
      // Only load CSS files that actually exist
      const cssFiles = [
        // Add only CSS files that exist in your project
        // '/styles/non-critical.css',
      ];

      cssFiles.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        
        // Add error handling
        link.onerror = () => {
          console.warn(`Failed to load CSS: ${href}`);
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        };
        
        link.onload = () => {
          link.media = 'all';
        };
        
        document.head.appendChild(link);
      });
    };

    // Load after a short delay
    setTimeout(loadNonCriticalCSS, 100);

    return () => {
      // Cleanup
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};

// CSS Loading Optimizer Component
export const CSSLoadingOptimizer: React.FC = () => {
  useEffect(() => {
    // Preload CSS files with error handling
    const preloadCSS = (href: string) => {
      // Check if already preloaded
      const existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      
      // Add error handling
      link.onerror = () => {
        console.warn(`Failed to preload CSS: ${href}`);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
      
      document.head.appendChild(link);
    };

    // Only preload CSS files that actually exist
    const cssFilesToPreload = [
      // Add only CSS files that exist in your project
      // '/styles/components.css',
      // '/styles/utilities.css',
    ];

    cssFilesToPreload.forEach(preloadCSS);

    // Remove unused CSS (simplified approach)
    const removeUnusedCSS = () => {
      const stylesheets = document.styleSheets;
      
      for (let i = 0; i < stylesheets.length; i++) {
        try {
          const stylesheet = stylesheets[i];
          if (!stylesheet.cssRules) continue;
          
          const rules = Array.from(stylesheet.cssRules);
          const usedSelectors = new Set<string>();
          
          rules.forEach((rule: any) => {
            if (rule.selectorText) {
              const selectors = rule.selectorText.split(',');
              selectors.forEach((selector: string) => {
                const trimmedSelector = selector.trim();
                try {
                  if (document.querySelector(trimmedSelector)) {
                    usedSelectors.add(trimmedSelector);
                  }
                } catch (e) {
                  // Invalid selector, skip
                }
              });
            }
          });
        } catch (e) {
          // Cross-origin or other errors, skip
          console.warn('Could not analyze stylesheet:', e);
        }
      }
    };

    // Run unused CSS removal after page load
    setTimeout(removeUnusedCSS, 2000);
  }, []);

  return null;
};

// Above-the-fold CSS optimizer
export function AboveTheFoldOptimizer({ children }: { children: React.ReactNode }) {
  const [isAboveTheFold, setIsAboveTheFold] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAboveTheFold(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    // Observe the fold line (approximately 600px from top)
    const foldMarker = document.createElement('div');
    foldMarker.style.position = 'absolute';
    foldMarker.style.top = '600px';
    foldMarker.style.height = '1px';
    foldMarker.style.width = '1px';
    foldMarker.style.opacity = '0';
    foldMarker.style.pointerEvents = 'none';
    document.body.appendChild(foldMarker);

    observer.observe(foldMarker);

    return () => {
      observer.disconnect();
      if (document.body.contains(foldMarker)) {
        document.body.removeChild(foldMarker);
      }
    };
  }, []);

  return (
    <div data-above-fold={isAboveTheFold}>
      {children}
    </div>
  );
}

// CSS metrics collector
export function useCSSMetrics() {
  const [metrics, setMetrics] = useState({
    totalStylesheets: 0,
    totalRules: 0,
    unusedRules: 0,
    criticalCSS: 0,
    loadTime: 0,
  });

  useEffect(() => {
    const collectMetrics = () => {
      const stylesheets = Array.from(document.styleSheets);
      let totalRules = 0;
      let criticalRules = 0;

      stylesheets.forEach(stylesheet => {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          totalRules += rules.length;

          // Count critical CSS rules (simplified)
          rules.forEach(rule => {
            if (rule.cssText.includes('above-fold') || 
                rule.cssText.includes('critical') ||
                rule.cssText.includes('hero') ||
                rule.cssText.includes('navbar')) {
              criticalRules++;
            }
          });
        } catch (error) {
          // Cross-origin stylesheets can't be accessed
          console.warn('Cannot access stylesheet:', error);
        }
      });

      setMetrics({
        totalStylesheets: stylesheets.length,
        totalRules,
        unusedRules: 0, // Would need more complex analysis
        criticalCSS: criticalRules,
        loadTime: performance.now(),
      });
    };

    // Collect metrics after stylesheets load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  return metrics;
}

// CSS optimization report
export function CSSOptimizationReport() {
  const metrics = useCSSMetrics();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Ver reporte de CSS"
      >
        🎨
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">CSS Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Stylesheets:</span>
          <span className="font-mono">{metrics.totalStylesheets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Rules:</span>
          <span className="font-mono">{metrics.totalRules}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Critical Rules:</span>
          <span className="font-mono">{metrics.criticalCSS}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Load Time:</span>
          <span className="font-mono">{metrics.loadTime.toFixed(2)}ms</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500">
          Critical CSS: {((metrics.criticalCSS / metrics.totalRules) * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
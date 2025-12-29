import puppeteer, { Browser, Page } from 'puppeteer';

export interface CoreWebVitalsMetrics {
  url: string;
  timestamp: number;
  metrics: {
    // Core Web Vitals
    largestContentfulPaint: number | null; // LCP - should be < 2.5s
    firstInputDelay: number | null; // FID - should be < 100ms
    cumulativeLayoutShift: number | null; // CLS - should be < 0.1
    
    // Additional Performance Metrics
    firstContentfulPaint: number | null; // FCP - should be < 1.8s
    timeToInteractive: number | null; // TTI - should be < 3.8s
    totalBlockingTime: number | null; // TBT - should be < 200ms
    speedIndex: number | null; // SI - should be < 3.4s
    
    // Loading Performance
    domContentLoaded: number;
    loadComplete: number;
    
    // Resource Metrics
    resourceCount: {
      total: number;
      images: number;
      scripts: number;
      stylesheets: number;
      fonts: number;
      other: number;
    };
    
    // Size Metrics
    transferSize: number;
    resourceSize: number;
    
    // Network Metrics
    serverResponseTime: number;
    
    // Mobile Performance
    mobileScore?: number;
    desktopScore?: number;
  };
  
  // Performance Grades
  grades: {
    lcp: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
    fcp: 'good' | 'needs-improvement' | 'poor';
    overall: 'good' | 'needs-improvement' | 'poor';
  };
  
  // Recommendations
  recommendations: {
    category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
  }[];
  
  // Opportunities
  opportunities: {
    title: string;
    description: string;
    savings: number; // in milliseconds
    resources?: string[];
  }[];
}

export interface WebVitalsOptions {
  device?: 'mobile' | 'desktop';
  throttling?: 'none' | '3g' | '4g';
  timeout?: number;
  collectResourceMetrics?: boolean;
}

export class CoreWebVitalsAnalyzer {
  private browser: Browser | null = null;
  
  private readonly mobileViewport = { width: 375, height: 667 };
  private readonly desktopViewport = { width: 1920, height: 1080 };
  
  private readonly mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
  private readonly desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async analyzeWebVitals(url: string, options: WebVitalsOptions = {}): Promise<CoreWebVitalsMetrics> {
    const {
      device = 'desktop',
      throttling = 'none',
      timeout = 60000,
      collectResourceMetrics = true,
    } = options;

    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Configurar dispositivo
      const viewport = device === 'mobile' ? this.mobileViewport : this.desktopViewport;
      const userAgent = device === 'mobile' ? this.mobileUserAgent : this.desktopUserAgent;
      
      await page.setViewport(viewport);
      await page.setUserAgent(userAgent);

      // Enable performance monitoring
      await page.setCacheEnabled(false);

      // Configurar throttling de red
      if (throttling !== 'none') {
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');
        
        const throttlingConfig = this.getThrottlingConfig(throttling);
        await client.send('Network.emulateNetworkConditions', throttlingConfig);
      }

      // Configurar interceptación de recursos si es necesario
      const resourceMetrics = {
        total: 0,
        images: 0,
        scripts: 0,
        stylesheets: 0,
        fonts: 0,
        other: 0,
        transferSize: 0,
        resourceSize: 0,
      };

      if (collectResourceMetrics) {
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
          resourceMetrics.total++;
          
          const resourceType = request.resourceType();
          switch (resourceType) {
            case 'image':
              resourceMetrics.images++;
              break;
            case 'script':
              resourceMetrics.scripts++;
              break;
            case 'stylesheet':
              resourceMetrics.stylesheets++;
              break;
            case 'font':
              resourceMetrics.fonts++;
              break;
            default:
              resourceMetrics.other++;
          }
          
          request.continue();
        });

        page.on('response', (response) => {
          const headers = response.headers();
          const contentLength = headers['content-length'];
          if (contentLength) {
            resourceMetrics.transferSize += parseInt(contentLength, 10);
          }
        });
      }

      // Inicializar métricas de rendimiento
      await page.evaluateOnNewDocument(() => {
        // Configurar PerformanceObserver para Core Web Vitals
        window.webVitalsData = {
          lcp: null,
          fid: null,
          cls: null,
          fcp: null,
          tti: null,
          tbt: null,
        };

        // LCP Observer
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              window.webVitalsData.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            console.warn('LCP observer not supported');
          }

          // FCP Observer
          try {
            const fcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              for (const entry of entries) {
                if (entry.name === 'first-contentful-paint') {
                  window.webVitalsData.fcp = entry.startTime;
                }
              }
            });
            fcpObserver.observe({ type: 'paint', buffered: true });
          } catch (e) {
            console.warn('FCP observer not supported');
          }

          // CLS Observer
          try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                  window.webVitalsData.cls = clsValue;
                }
              }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            console.warn('CLS observer not supported');
          }
        }
      });

      // Navegar y medir tiempos
      const startTime = Date.now();
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout,
      });

      const serverResponseTime = Date.now() - startTime;

      // Esperar un poco más para que se capturen las métricas
      await page.waitForTimeout(3000);

      // Extraer métricas de rendimiento
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          // Timing básico
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          
          // Core Web Vitals desde observers
          webVitals: (window as any).webVitalsData || {},
          
          // Métricas adicionales
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
          
          // Calcular TTI aproximado
          timeToInteractive: navigation.domInteractive - navigation.navigationStart,
          
          // Resource timing
          resourceTiming: performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            duration: entry.duration,
            transferSize: (entry as any).transferSize || 0,
            encodedBodySize: (entry as any).encodedBodySize || 0,
          })),
        };
      });

      // Calcular métricas finales
      const metrics: CoreWebVitalsMetrics['metrics'] = {
        largestContentfulPaint: performanceMetrics.webVitals.lcp,
        firstInputDelay: performanceMetrics.webVitals.fid,
        cumulativeLayoutShift: performanceMetrics.webVitals.cls,
        firstContentfulPaint: performanceMetrics.webVitals.fcp || performanceMetrics.firstContentfulPaint,
        timeToInteractive: performanceMetrics.timeToInteractive,
        totalBlockingTime: null, // Requiere cálculo más complejo
        speedIndex: null, // Requiere análisis visual
        domContentLoaded: performanceMetrics.domContentLoaded,
        loadComplete: performanceMetrics.loadComplete,
        resourceCount: resourceMetrics,
        transferSize: resourceMetrics.transferSize,
        resourceSize: performanceMetrics.resourceTiming.reduce((sum, r) => sum + r.encodedBodySize, 0),
        serverResponseTime,
      };

      // Calcular grades
      const grades = this.calculateGrades(metrics);
      
      // Generar recomendaciones
      const recommendations = this.generateRecommendations(metrics, grades);
      
      // Generar oportunidades
      const opportunities = this.generateOpportunities(metrics, performanceMetrics.resourceTiming);

      return {
        url,
        timestamp: Date.now(),
        metrics,
        grades,
        recommendations,
        opportunities,
      };

    } catch (error) {
      console.error(`Error analyzing Core Web Vitals for ${url}:`, error);
      throw new Error(`Failed to analyze Core Web Vitals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private getThrottlingConfig(throttling: '3g' | '4g') {
    const configs = {
      '3g': {
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 40, // 40ms
      },
      '4g': {
        offline: false,
        downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
        uploadThroughput: 3 * 1024 * 1024 / 8, // 3 Mbps
        latency: 20, // 20ms
      },
    };
    
    return configs[throttling];
  }

  private calculateGrades(metrics: CoreWebVitalsMetrics['metrics']): CoreWebVitalsMetrics['grades'] {
    const gradeMetric = (value: number | null, good: number, poor: number) => {
      if (value === null) return 'needs-improvement';
      if (value <= good) return 'good';
      if (value <= poor) return 'needs-improvement';
      return 'poor';
    };

    const lcpGrade = gradeMetric(metrics.largestContentfulPaint, 2500, 4000);
    const fidGrade = gradeMetric(metrics.firstInputDelay, 100, 300);
    const clsGrade = gradeMetric(metrics.cumulativeLayoutShift, 0.1, 0.25);
    const fcpGrade = gradeMetric(metrics.firstContentfulPaint, 1800, 3000);

    // Calcular grade general
    const grades = [lcpGrade, fidGrade, clsGrade, fcpGrade];
    const poorCount = grades.filter(g => g === 'poor').length;
    const goodCount = grades.filter(g => g === 'good').length;

    let overall: 'good' | 'needs-improvement' | 'poor';
    if (poorCount > 0) {
      overall = 'poor';
    } else if (goodCount >= 3) {
      overall = 'good';
    } else {
      overall = 'needs-improvement';
    }

    return {
      lcp: lcpGrade,
      fid: fidGrade,
      cls: clsGrade,
      fcp: fcpGrade,
      overall,
    };
  }

  private generateRecommendations(
    metrics: CoreWebVitalsMetrics['metrics'],
    grades: CoreWebVitalsMetrics['grades']
  ): CoreWebVitalsMetrics['recommendations'] {
    const recommendations: CoreWebVitalsMetrics['recommendations'] = [];

    // LCP Recommendations
    if (grades.lcp !== 'good') {
      recommendations.push({
        category: 'performance',
        title: 'Optimize Largest Contentful Paint (LCP)',
        description: 'Improve server response times, optimize images, and eliminate render-blocking resources.',
        impact: 'high',
        effort: 'medium',
      });
    }

    // FID Recommendations
    if (grades.fid !== 'good') {
      recommendations.push({
        category: 'performance',
        title: 'Reduce First Input Delay (FID)',
        description: 'Minimize JavaScript execution time and break up long tasks.',
        impact: 'high',
        effort: 'medium',
      });
    }

    // CLS Recommendations
    if (grades.cls !== 'good') {
      recommendations.push({
        category: 'performance',
        title: 'Minimize Cumulative Layout Shift (CLS)',
        description: 'Set size attributes on images and videos, avoid inserting content above existing content.',
        impact: 'high',
        effort: 'low',
      });
    }

    // Resource Recommendations
    if (metrics.resourceCount.total > 100) {
      recommendations.push({
        category: 'performance',
        title: 'Reduce Number of Requests',
        description: 'Combine files, use CSS sprites, and implement resource bundling.',
        impact: 'medium',
        effort: 'medium',
      });
    }

    // Size Recommendations
    if (metrics.transferSize > 3 * 1024 * 1024) { // 3MB
      recommendations.push({
        category: 'performance',
        title: 'Optimize Resource Sizes',
        description: 'Compress images, minify CSS/JS, and enable gzip compression.',
        impact: 'high',
        effort: 'low',
      });
    }

    return recommendations;
  }

  private generateOpportunities(
    metrics: CoreWebVitalsMetrics['metrics'],
    resourceTiming: any[]
  ): CoreWebVitalsMetrics['opportunities'] {
    const opportunities: CoreWebVitalsMetrics['opportunities'] = [];

    // Image Optimization
    const imageResources = resourceTiming.filter(r => 
      r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    );
    
    if (imageResources.length > 0) {
      const totalImageSize = imageResources.reduce((sum, r) => sum + r.transferSize, 0);
      if (totalImageSize > 1024 * 1024) { // 1MB
        opportunities.push({
          title: 'Optimize Images',
          description: 'Convert images to modern formats (WebP, AVIF) and implement responsive images.',
          savings: Math.min(2000, totalImageSize / 1024), // Estimate savings
          resources: imageResources.slice(0, 5).map(r => r.name),
        });
      }
    }

    // JavaScript Optimization
    const jsResources = resourceTiming.filter(r => 
      r.name.match(/\.js$/i) && r.duration > 100
    );
    
    if (jsResources.length > 0) {
      opportunities.push({
        title: 'Reduce JavaScript Execution Time',
        description: 'Remove unused JavaScript, implement code splitting, and defer non-critical scripts.',
        savings: jsResources.reduce((sum, r) => sum + r.duration, 0) * 0.3, // 30% improvement estimate
        resources: jsResources.slice(0, 5).map(r => r.name),
      });
    }

    // CSS Optimization
    const cssResources = resourceTiming.filter(r => 
      r.name.match(/\.css$/i)
    );
    
    if (cssResources.length > 3) {
      opportunities.push({
        title: 'Minimize CSS',
        description: 'Combine CSS files, remove unused CSS, and inline critical CSS.',
        savings: 500, // Estimate
        resources: cssResources.slice(0, 3).map(r => r.name),
      });
    }

    return opportunities;
  }

  async analyzeBatch(urls: string[], options: WebVitalsOptions = {}): Promise<CoreWebVitalsMetrics[]> {
    const results: CoreWebVitalsMetrics[] = [];
    
    for (const url of urls) {
      try {
        const metrics = await this.analyzeWebVitals(url, options);
        results.push(metrics);
        
        // Pausa entre análisis para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to analyze ${url}:`, error);
      }
    }

    return results;
  }
}

// Singleton instance
let vitalsAnalyzerInstance: CoreWebVitalsAnalyzer | null = null;

export const getCoreWebVitalsAnalyzer = (): CoreWebVitalsAnalyzer => {
  if (!vitalsAnalyzerInstance) {
    vitalsAnalyzerInstance = new CoreWebVitalsAnalyzer();
  }
  return vitalsAnalyzerInstance;
};

export const closeCoreWebVitalsAnalyzer = async (): Promise<void> => {
  if (vitalsAnalyzerInstance) {
    await vitalsAnalyzerInstance.close();
    vitalsAnalyzerInstance = null;
  }
};
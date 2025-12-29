import puppeteer, { Browser, Page } from 'puppeteer';

export interface TechnologyDetection {
  name: string;
  version?: string;
  confidence: number;
  category: 'cms' | 'framework' | 'library' | 'analytics' | 'ecommerce' | 'hosting' | 'other';
}

export interface StructuredData {
  type: string;
  data: any;
  isValid: boolean;
}

export interface SecurityAnalysis {
  hasSSL: boolean;
  sslGrade?: string;
  securityHeaders: {
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
  };
  mixedContent: boolean;
  vulnerabilities: string[];
}

export interface MobileFriendliness {
  isMobileFriendly: boolean;
  viewport: string;
  touchTargets: number;
  fontSizes: {
    tooSmall: number;
    appropriate: number;
  };
  tapTargetIssues: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  speedIndex?: number;
  totalBlockingTime?: number;
  resourceSizes: {
    html: number;
    css: number;
    javascript: number;
    images: number;
    fonts: number;
    other: number;
  };
  requestCounts: {
    total: number;
    html: number;
    css: number;
    javascript: number;
    images: number;
    fonts: number;
    other: number;
  };
}

export interface SEOMetrics {
  url: string;
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    altTexts: string[];
    lazyLoaded: number;
    optimized: number;
  };
  links: {
    internal: number;
    external: number;
    internalLinks: string[];
    externalLinks: string[];
    nofollow: number;
    broken: number;
  };
  performance: PerformanceMetrics;
  technical: {
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    hasStructuredData: boolean;
    structuredDataTypes: StructuredData[];
    technologies: TechnologyDetection[];
    charset: string;
    viewport: string;
    canonicalUrl?: string;
    hreflang: string[];
    openGraphTags: number;
    twitterCardTags: number;
    metaRobots: string;
    statusCode: number;
    redirectChain: string[];
  };
  content: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: { [key: string]: number };
    contentStructure: {
      paragraphs: number;
      lists: number;
      tables: number;
      forms: number;
    };
    duplicateContent: number;
    contentQuality: {
      uniqueness: number;
      depth: number;
      expertise: number;
    };
  };
  social: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterSite?: string;
  };
  security: SecurityAnalysis;
  mobile: MobileFriendliness;
  accessibility: {
    score: number;
    issues: string[];
    altTextCoverage: number;
    headingStructure: boolean;
    colorContrast: number;
    keyboardNavigation: boolean;
  };
}

export interface ScrapingOptions {
  timeout?: number;
  waitForNetworkIdle?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export class SEOScraper {
  private browser: Browser | null = null;
  private options: ScrapingOptions;

  constructor(options: ScrapingOptions = {}) {
    this.options = {
      timeout: 30000,
      waitForNetworkIdle: true,
      userAgent: 'Mozilla/5.0 (compatible; SEOBot/1.0)',
      viewport: { width: 1920, height: 1080 },
      ...options
    };
  }

  private async detectTechnologies(page: Page): Promise<TechnologyDetection[]> {
    return await page.evaluate(() => {
      const technologies: TechnologyDetection[] = [];
      
      // WordPress detection
      if (document.querySelector('meta[name="generator"][content*="WordPress"]') ||
          document.querySelector('link[href*="wp-content"]') ||
          document.querySelector('script[src*="wp-content"]')) {
        const version = document.querySelector('meta[name="generator"]')?.getAttribute('content')?.match(/WordPress\s+([\d.]+)/)?.[1];
        technologies.push({
          name: 'WordPress',
          version,
          confidence: 0.9,
          category: 'cms'
        });
      }

      // React detection
      if ((window as any).React || document.querySelector('[data-reactroot]') || 
          document.querySelector('script[src*="react"]')) {
        technologies.push({
          name: 'React',
          confidence: 0.8,
          category: 'framework'
        });
      }

      // Vue.js detection
      if ((window as any).Vue || document.querySelector('[data-v-]')) {
        technologies.push({
          name: 'Vue.js',
          confidence: 0.8,
          category: 'framework'
        });
      }

      // Angular detection
      if ((window as any).angular || document.querySelector('[ng-app]') || 
          document.querySelector('script[src*="angular"]')) {
        technologies.push({
          name: 'Angular',
          confidence: 0.8,
          category: 'framework'
        });
      }

      // jQuery detection
      if ((window as any).jQuery || (window as any).$) {
        const version = (window as any).jQuery?.fn?.jquery;
        technologies.push({
          name: 'jQuery',
          version,
          confidence: 0.9,
          category: 'library'
        });
      }

      // Google Analytics detection
      if (document.querySelector('script[src*="google-analytics"]') ||
          document.querySelector('script[src*="gtag"]') ||
          (window as any).gtag || (window as any).ga) {
        technologies.push({
          name: 'Google Analytics',
          confidence: 0.9,
          category: 'analytics'
        });
      }

      // Shopify detection
      if ((window as any).Shopify || document.querySelector('script[src*="shopify"]')) {
        technologies.push({
          name: 'Shopify',
          confidence: 0.9,
          category: 'ecommerce'
        });
      }

      // WooCommerce detection
      if (document.querySelector('script[src*="woocommerce"]') ||
          document.querySelector('.woocommerce')) {
        technologies.push({
          name: 'WooCommerce',
          confidence: 0.8,
          category: 'ecommerce'
        });
      }

      // Bootstrap detection
      if (document.querySelector('link[href*="bootstrap"]') ||
          document.querySelector('script[src*="bootstrap"]') ||
          document.querySelector('.container, .row, .col-')) {
        technologies.push({
          name: 'Bootstrap',
          confidence: 0.7,
          category: 'framework'
        });
      }

      return technologies;
    });
  }

  private async analyzeStructuredData(page: Page): Promise<StructuredData[]> {
    return await page.evaluate(() => {
      const structuredData: StructuredData[] = [];
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          const type = data['@type'] || 'Unknown';
          structuredData.push({
            type,
            data,
            isValid: true
          });
        } catch (error) {
          structuredData.push({
            type: 'Invalid JSON-LD',
            data: script.textContent,
            isValid: false
          });
        }
      });

      return structuredData;
    });
  }

  private async analyzeSecurityHeaders(page: Page): Promise<SecurityAnalysis> {
    const response = page.mainFrame().childFrames().length > 0 ? 
      await page.mainFrame().childFrames()[0].goto(page.url()) : 
      await page.goto(page.url());
    
    const headers = response?.headers() || {};
    const url = new URL(page.url());
    
    return {
      hasSSL: url.protocol === 'https:',
      securityHeaders: {
        contentSecurityPolicy: !!headers['content-security-policy'],
        strictTransportSecurity: !!headers['strict-transport-security'],
        xFrameOptions: !!headers['x-frame-options'],
        xContentTypeOptions: !!headers['x-content-type-options'],
        referrerPolicy: !!headers['referrer-policy']
      },
      mixedContent: await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img[src^="http:"]'));
        const scripts = Array.from(document.querySelectorAll('script[src^="http:"]'));
        const links = Array.from(document.querySelectorAll('link[href^="http:"]'));
        return images.length + scripts.length + links.length > 0;
      }),
      vulnerabilities: []
    };
  }

  private async analyzeMobileFriendliness(page: Page): Promise<MobileFriendliness> {
    return await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
      const touchTargets = document.querySelectorAll('button, a, input, select, textarea').length;
      
      // Analyze font sizes
      const elements = Array.from(document.querySelectorAll('*'));
      let tooSmall = 0;
      let appropriate = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        if (fontSize > 0) {
          if (fontSize < 12) tooSmall++;
          else appropriate++;
        }
      });

      return {
        isMobileFriendly: !!viewport && viewport.includes('width=device-width'),
        viewport,
        touchTargets,
        fontSizes: { tooSmall, appropriate },
        tapTargetIssues: 0 // Simplified for now
      };
    });
  }

  private async analyzeAccessibility(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '').length;
      const altTextCoverage = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;
      
      // Check heading structure
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
      let headingStructure = true;
      
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i-1] + 1) {
          headingStructure = false;
          break;
        }
      }

      const issues: string[] = [];
      if (altTextCoverage < 90) issues.push('Missing alt text on images');
      if (!headingStructure) issues.push('Improper heading hierarchy');
      if (!document.querySelector('h1')) issues.push('Missing H1 tag');

      return {
        score: Math.max(0, 100 - issues.length * 20),
        issues,
        altTextCoverage,
        headingStructure,
        colorContrast: 85, // Simplified
        keyboardNavigation: true // Simplified
      };
    });
  }

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeURL(url: string): Promise<SEOMetrics> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    // Set viewport and user agent
    await page.setViewport(this.options.viewport!);
    await page.setUserAgent(this.options.userAgent!);

    // Enable request interception for performance analysis
    await page.setRequestInterception(true);
    const resourceSizes = {
      html: 0,
      css: 0,
      javascript: 0,
      images: 0,
      fonts: 0,
      other: 0
    };
    const requestCounts = {
      total: 0,
      html: 0,
      css: 0,
      javascript: 0,
      images: 0,
      fonts: 0,
      other: 0
    };

    page.on('request', request => {
      requestCounts.total++;
      const resourceType = request.resourceType();
      
      switch (resourceType) {
        case 'document':
          requestCounts.html++;
          break;
        case 'stylesheet':
          requestCounts.css++;
          break;
        case 'script':
          requestCounts.javascript++;
          break;
        case 'image':
          requestCounts.images++;
          break;
        case 'font':
          requestCounts.fonts++;
          break;
        default:
          requestCounts.other++;
      }
      
      request.continue();
    });

    page.on('response', response => {
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      const resourceType = response.request().resourceType();
      
      switch (resourceType) {
        case 'document':
          resourceSizes.html += contentLength;
          break;
        case 'stylesheet':
          resourceSizes.css += contentLength;
          break;
        case 'script':
          resourceSizes.javascript += contentLength;
          break;
        case 'image':
          resourceSizes.images += contentLength;
          break;
        case 'font':
          resourceSizes.fonts += contentLength;
          break;
        default:
          resourceSizes.other += contentLength;
      }
    });

    try {
      const startTime = Date.now();
      
      // Navigate to the page
      const response = await page.goto(url, {
        waitUntil: this.options.waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded',
        timeout: this.options.timeout
      });

      const loadTime = Date.now() - startTime;

      // Get Core Web Vitals and performance metrics
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Wait for performance data to be available
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paint = performance.getEntriesByType('paint');
            
            const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
            const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
            
            resolve({
              domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
              firstContentfulPaint: fcp?.startTime,
              largestContentfulPaint: lcp?.startTime,
              timeToInteractive: navigation?.loadEventEnd - navigation?.fetchStart || 0
            });
          }, 1000);
        });
      });

      // Extract comprehensive SEO data
      const seoData = await page.evaluate(() => {
        // Basic meta data
        const title = document.title || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        // Headings
        const headings = {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || ''),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || ''),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || ''),
          h4: Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim() || ''),
          h5: Array.from(document.querySelectorAll('h5')).map(h => h.textContent?.trim() || ''),
          h6: Array.from(document.querySelectorAll('h6')).map(h => h.textContent?.trim() || '')
        };

        // Enhanced Images analysis
        const images = Array.from(document.querySelectorAll('img'));
        const imageData = {
          total: images.length,
          withAlt: images.filter(img => img.alt && img.alt.trim() !== '').length,
          withoutAlt: images.filter(img => !img.alt || img.alt.trim() === '').length,
          altTexts: images.map(img => img.alt || '').filter(alt => alt.trim() !== ''),
          lazyLoaded: images.filter(img => img.loading === 'lazy' || img.hasAttribute('data-src')).length,
          optimized: images.filter(img => {
            const src = img.src || img.getAttribute('data-src') || '';
            return src.includes('.webp') || src.includes('.avif') || src.includes('w_auto') || src.includes('q_auto');
          }).length
        };

        // Enhanced Links analysis
        const links = Array.from(document.querySelectorAll('a[href]'));
        const currentDomain = window.location.hostname;
        const internalLinks: string[] = [];
        const externalLinks: string[] = [];
        let nofollowCount = 0;

        links.forEach(link => {
          const href = link.getAttribute('href');
          const rel = link.getAttribute('rel') || '';
          
          if (rel.includes('nofollow')) nofollowCount++;
          
          if (href) {
            try {
              const linkUrl = new URL(href, window.location.href);
              if (linkUrl.hostname === currentDomain) {
                internalLinks.push(href);
              } else {
                externalLinks.push(href);
              }
            } catch (e) {
              internalLinks.push(href);
            }
          }
        });

        const linkData = {
          internal: internalLinks.length,
          external: externalLinks.length,
          internalLinks,
          externalLinks,
          nofollow: nofollowCount,
          broken: 0 // Would need additional checking
        };

        // Enhanced Content analysis
        const textContent = document.body.textContent || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Keyword density analysis
        const wordFreq: { [key: string]: number } = {};
        words.forEach(word => {
          const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
          if (cleanWord.length > 3) {
            wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
          }
        });

        const keywordDensity = Object.entries(wordFreq)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [word, count]) => {
            acc[word] = (count / wordCount) * 100;
            return acc;
          }, {} as { [key: string]: number });

        // Enhanced content structure
        const contentStructure = {
          paragraphs: document.querySelectorAll('p').length,
          lists: document.querySelectorAll('ul, ol').length,
          tables: document.querySelectorAll('table').length,
          forms: document.querySelectorAll('form').length
        };

        // Content quality metrics
        const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
        const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (wordCount / sentences.length))));

        const contentQuality = {
          uniqueness: Math.min(100, wordCount / 10), // Simplified
          depth: Math.min(100, wordCount / 50),
          expertise: Math.min(100, (headings.h1.length + headings.h2.length + headings.h3.length) * 10)
        };

        // Enhanced Social meta tags
        const social = {
          ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
          ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
          ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
          ogType: document.querySelector('meta[property="og:type"]')?.getAttribute('content'),
          ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
          twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
          twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
          twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
          twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
          twitterSite: document.querySelector('meta[name="twitter:site"]')?.getAttribute('content')
        };

        // Enhanced Technical analysis
        const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        const hreflangLinks = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
        const hreflang = hreflangLinks.map(link => link.getAttribute('hreflang') || '');
        
        const openGraphTags = document.querySelectorAll('meta[property^="og:"]').length;
        const twitterCardTags = document.querySelectorAll('meta[name^="twitter:"]').length;
        const metaRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';

        const technical = {
          hasRobotsTxt: false, // Will be checked separately
          hasSitemap: !!document.querySelector('link[rel="sitemap"]'),
          hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
          structuredDataTypes: [], // Will be filled by analyzeStructuredData
          technologies: [], // Will be filled by detectTechnologies
          charset: document.characterSet || 'UTF-8',
          viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
          canonicalUrl,
          hreflang,
          openGraphTags,
          twitterCardTags,
          metaRobots,
          statusCode: 200, // Will be set from response
          redirectChain: [] // Simplified for now
        };

        return {
          title,
          metaDescription,
          headings,
          images: imageData,
          links: linkData,
          content: {
            wordCount,
            readabilityScore,
            keywordDensity,
            contentStructure,
            duplicateContent: 0, // Simplified
            contentQuality
          },
          social,
          technical
        };
      });

      // Run advanced analyses
      const [technologies, structuredData, security, mobile, accessibility] = await Promise.all([
        this.detectTechnologies(page),
        this.analyzeStructuredData(page),
        this.analyzeSecurityHeaders(page),
        this.analyzeMobileFriendliness(page),
        this.analyzeAccessibility(page)
      ]);

      // Set technical data from response
      seoData.technical.statusCode = response?.status() || 200;
      seoData.technical.technologies = technologies;
      seoData.technical.structuredDataTypes = structuredData;

      // Check robots.txt
      try {
        const robotsResponse = await page.goto(`${new URL(url).origin}/robots.txt`);
        seoData.technical.hasRobotsTxt = robotsResponse?.status() === 200;
      } catch (error) {
        seoData.technical.hasRobotsTxt = false;
      }

      return {
        url,
        ...seoData,
        performance: {
          loadTime,
          domContentLoaded: (performanceMetrics as any).domContentLoaded || loadTime,
          firstContentfulPaint: (performanceMetrics as any).firstContentfulPaint,
          largestContentfulPaint: (performanceMetrics as any).largestContentfulPaint,
          timeToInteractive: (performanceMetrics as any).timeToInteractive,
          cumulativeLayoutShift: undefined, // Would need additional measurement
          firstInputDelay: undefined, // Would need user interaction simulation
          speedIndex: undefined, // Would need additional calculation
          totalBlockingTime: undefined, // Would need additional measurement
          resourceSizes,
          requestCounts
        },
        security,
        mobile,
        accessibility
      };

    } finally {
      await page.close();
    }
  }
}

export const getSEOScraper = () => new SEOScraper();
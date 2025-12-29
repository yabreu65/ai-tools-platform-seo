import puppeteer, { Browser, Page } from 'puppeteer';
import { ICompetitorData, IKeywordData, IPageData, ITechnicalMetrics } from '../db/models/CompetitorAnalysis';

export interface ScrapingConfig {
  headless: boolean;
  timeout: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  waitForSelector?: string;
  delay?: number;
}

export interface ScrapingResult {
  success: boolean;
  data?: any;
  error?: string;
  metrics: {
    loadTime: number;
    responseTime: number;
    resourceCount: number;
  };
}

export class ScrapingService {
  private browser: Browser | null = null;
  private config: ScrapingConfig;

  constructor(config?: Partial<ScrapingConfig>) {
    this.config = {
      headless: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      delay: 1000,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.browser) return;

    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
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
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeCompetitorData(domain: string): Promise<ScrapingResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      // Configure page
      await page.setUserAgent(this.config.userAgent);
      await page.setViewport(this.config.viewport);

      // Enable request interception for performance monitoring
      await page.setRequestInterception(true);
      let resourceCount = 0;
      
      page.on('request', (request) => {
        resourceCount++;
        request.continue();
      });

      // Navigate to domain
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()}`);
      }

      const responseTime = Date.now() - startTime;

      // Wait for additional content if specified
      if (this.config.waitForSelector) {
        await page.waitForSelector(this.config.waitForSelector, {
          timeout: 5000
        }).catch(() => {}); // Ignore timeout
      }

      // Add delay if specified
      if (this.config.delay) {
        await new Promise(resolve => setTimeout(resolve, this.config.delay));
      }

      // Extract SEO data
      const seoData = await this.extractSEOData(page);
      
      // Extract technical metrics
      const technicalMetrics = await this.extractTechnicalMetrics(page);

      // Extract content structure
      const contentStructure = await this.extractContentStructure(page);

      const loadTime = Date.now() - startTime;

      await page.close();

      return {
        success: true,
        data: {
          domain: domain,
          seoData,
          technicalMetrics,
          contentStructure,
          scrapedAt: new Date()
        },
        metrics: {
          loadTime,
          responseTime,
          resourceCount
        }
      };

    } catch (error) {
      await page.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        metrics: {
          loadTime: Date.now() - startTime,
          responseTime: 0,
          resourceCount: 0
        }
      };
    }
  }

  private async extractSEOData(page: Page): Promise<any> {
    return await page.evaluate(() => {
      // Extract title
      const title = document.title || '';

      // Extract meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      // Extract meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

      // Extract headings
      const headings = {
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || ''),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || ''),
        h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || ''),
      };

      // Extract images with alt text
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || ''
      }));

      // Extract internal links
      const internalLinks = Array.from(document.querySelectorAll('a[href]'))
        .filter(link => {
          const href = link.getAttribute('href');
          return href && (href.startsWith('/') || href.includes(window.location.hostname));
        })
        .map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim() || '',
          title: link.getAttribute('title') || ''
        }));

      // Extract external links
      const externalLinks = Array.from(document.querySelectorAll('a[href]'))
        .filter(link => {
          const href = link.getAttribute('href');
          return href && href.startsWith('http') && !href.includes(window.location.hostname);
        })
        .map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim() || '',
          title: link.getAttribute('title') || ''
        }));

      // Extract structured data
      const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent || '');
          } catch {
            return null;
          }
        })
        .filter(data => data !== null);

      // Extract canonical URL
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

      // Extract robots meta
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';

      // Extract Open Graph data
      const openGraph = {
        title: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        description: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        url: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || ''
      };

      // Extract Twitter Card data
      const twitterCard = {
        card: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '',
        title: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '',
        description: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '',
        image: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || ''
      };

      return {
        title,
        metaDescription,
        metaKeywords,
        headings,
        images,
        internalLinks,
        externalLinks,
        structuredData,
        canonical,
        robots,
        openGraph,
        twitterCard,
        wordCount: document.body.textContent?.split(/\s+/).length || 0
      };
    });
  }

  private async extractTechnicalMetrics(page: Page): Promise<ITechnicalMetrics> {
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: 0, // Would need additional setup for real FCP
        largestContentfulPaint: 0, // Would need additional setup for real LCP
        cumulativeLayoutShift: 0, // Would need additional setup for real CLS
        firstInputDelay: 0 // Would need additional setup for real FID
      };
    });

    // Check technical SEO elements
    const technicalChecks = await page.evaluate(() => {
      return {
        httpsEnabled: window.location.protocol === 'https:',
        mobileFriendly: document.querySelector('meta[name="viewport"]') !== null,
        structuredData: document.querySelectorAll('script[type="application/ld+json"]').length > 0,
        xmlSitemap: false, // Would need to check /sitemap.xml
        robotsTxt: false, // Would need to check /robots.txt
        hasH1: document.querySelectorAll('h1').length > 0,
        hasMetaDescription: document.querySelector('meta[name="description"]') !== null,
        hasCanonical: document.querySelector('link[rel="canonical"]') !== null
      };
    });

    // Calculate SEO score based on technical checks
    const seoScore = Object.values(technicalChecks).filter(Boolean).length * 12.5; // Max 100

    return {
      pageSpeed: {
        desktop: Math.max(0, 100 - (performanceMetrics.loadTime / 100)), // Simplified calculation
        mobile: Math.max(0, 90 - (performanceMetrics.loadTime / 100)) // Mobile typically slower
      },
      coreWebVitals: {
        lcp: performanceMetrics.largestContentfulPaint,
        fid: performanceMetrics.firstInputDelay,
        cls: performanceMetrics.cumulativeLayoutShift
      },
      seoScore,
      mobileFriendly: technicalChecks.mobileFriendly,
      httpsEnabled: technicalChecks.httpsEnabled,
      structuredData: technicalChecks.structuredData,
      xmlSitemap: technicalChecks.xmlSitemap,
      robotsTxt: technicalChecks.robotsTxt
    };
  }

  private async extractContentStructure(page: Page): Promise<any> {
    return await page.evaluate(() => {
      // Extract content sections
      const sections = Array.from(document.querySelectorAll('section, article, div[class*="content"], main'))
        .map(section => ({
          tagName: section.tagName.toLowerCase(),
          className: section.className,
          textLength: section.textContent?.length || 0,
          headingCount: section.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          linkCount: section.querySelectorAll('a').length,
          imageCount: section.querySelectorAll('img').length
        }));

      // Extract navigation structure
      const navigation = Array.from(document.querySelectorAll('nav, [role="navigation"]'))
        .map(nav => ({
          className: nav.className,
          linkCount: nav.querySelectorAll('a').length,
          links: Array.from(nav.querySelectorAll('a')).map(link => ({
            text: link.textContent?.trim() || '',
            href: link.getAttribute('href') || ''
          }))
        }));

      // Extract footer information
      const footer = document.querySelector('footer');
      const footerInfo = footer ? {
        linkCount: footer.querySelectorAll('a').length,
        textLength: footer.textContent?.length || 0,
        hasContactInfo: /contact|email|phone|address/i.test(footer.textContent || ''),
        hasSocialLinks: footer.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]').length > 0
      } : null;

      return {
        sections,
        navigation,
        footer: footerInfo,
        totalTextLength: document.body.textContent?.length || 0,
        totalLinkCount: document.querySelectorAll('a').length,
        totalImageCount: document.querySelectorAll('img').length
      };
    });
  }

  async scrapeMultipleCompetitors(domains: string[], concurrency: number = 3): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    // Process domains in batches to avoid overwhelming the system
    for (let i = 0; i < domains.length; i += concurrency) {
      const batch = domains.slice(i, i + concurrency);
      const batchPromises = batch.map(domain => this.scrapeCompetitorData(domain));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to be respectful
      if (i + concurrency < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  async checkSitemap(domain: string): Promise<{ exists: boolean; urls?: string[]; error?: string }> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      const sitemapUrl = domain.startsWith('http') ? `${domain}/sitemap.xml` : `https://${domain}/sitemap.xml`;
      const response = await page.goto(sitemapUrl, { timeout: 10000 });

      if (!response || !response.ok()) {
        return { exists: false };
      }

      const content = await page.content();
      
      // Parse sitemap URLs (simplified)
      const urlMatches = content.match(/<loc>(.*?)<\/loc>/g);
      const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];

      await page.close();

      return {
        exists: true,
        urls: urls.slice(0, 100) // Limit to first 100 URLs
      };

    } catch (error) {
      await page.close();
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkRobotsTxt(domain: string): Promise<{ exists: boolean; content?: string; error?: string }> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      const robotsUrl = domain.startsWith('http') ? `${domain}/robots.txt` : `https://${domain}/robots.txt`;
      const response = await page.goto(robotsUrl, { timeout: 10000 });

      if (!response || !response.ok()) {
        return { exists: false };
      }

      const content = await page.content();
      // Extract text content from the page
      const textContent = await page.evaluate(() => document.body.textContent || '');

      await page.close();

      return {
        exists: true,
        content: textContent
      };

    } catch (error) {
      await page.close();
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default ScrapingService;
import puppeteer, { Browser, Page } from 'puppeteer';

export interface TechnologyDetection {
  cms: string[];
  frameworks: string[];
  analytics: string[];
  advertising: string[];
  ecommerce: string[];
  cdn: string[];
  webServer: string[];
  programmingLanguages: string[];
  databases: string[];
  jsLibraries: string[];
}

export interface StructuralAnalysis {
  htmlStructure: {
    doctype: string;
    htmlLang: string;
    headElements: number;
    bodyElements: number;
    totalElements: number;
  };
  navigation: {
    mainNavigation: boolean;
    breadcrumbs: boolean;
    footerNavigation: boolean;
    sitemapLink: boolean;
  };
  accessibility: {
    altTexts: number;
    ariaLabels: number;
    headingStructure: string[];
    skipLinks: boolean;
  };
  seo: {
    canonicalUrl: string | null;
    robotsMeta: string | null;
    openGraph: Record<string, string>;
    twitterCard: Record<string, string>;
    jsonLd: any[];
  };
}

export interface PerformanceMetrics {
  resourceCounts: {
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    videos: number;
  };
  resourceSizes: {
    totalSize: number;
    imageSize: number;
    scriptSize: number;
    stylesheetSize: number;
  };
  optimizations: {
    imageOptimization: boolean;
    minification: boolean;
    compression: boolean;
    caching: boolean;
  };
}

export interface AdvancedSEOMetrics {
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
    optimized: number;
  };
  links: {
    internal: number;
    external: number;
    nofollow: number;
    dofollow: number;
  };
  content: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
  };
  technical: {
    loadTime: number;
    pageSize: number;
    httpStatus: number;
    redirects: number;
    ssl: boolean;
  };
  technologies: TechnologyDetection;
  structure: StructuralAnalysis;
  performance: PerformanceMetrics;
}

export class AdvancedSEOScraper {
  private browser: Browser | null = null;
  private config: {
    timeout: number;
    waitForNetworkIdle: boolean;
    userAgent: string;
    viewport: { width: number; height: number };
  };

  constructor(config?: Partial<AdvancedSEOScraper['config']>) {
    this.config = {
      timeout: 30000,
      waitForNetworkIdle: true,
      userAgent: 'Mozilla/5.0 (compatible; SEOBot/1.0; +https://example.com/bot)',
      viewport: { width: 1920, height: 1080 },
      ...config
    };
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

  async scrapeURL(url: string): Promise<AdvancedSEOMetrics> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      await page.setUserAgent(this.config.userAgent);
      await page.setViewport(this.config.viewport);

      // Track performance metrics
      const startTime = Date.now();
      
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: this.config.waitForNetworkIdle ? 'networkidle0' : 'domcontentloaded',
        timeout: this.config.timeout
      });

      const loadTime = Date.now() - startTime;

      // Extract basic SEO data
      const seoData = await page.evaluate(() => {
        // Title and meta description
        const title = document.querySelector('title')?.textContent || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        // Headings
        const headings = {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent || ''),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent || ''),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent || ''),
          h4: Array.from(document.querySelectorAll('h4')).map(h => h.textContent || ''),
          h5: Array.from(document.querySelectorAll('h5')).map(h => h.textContent || ''),
          h6: Array.from(document.querySelectorAll('h6')).map(h => h.textContent || '')
        };

        // Images analysis
        const images = document.querySelectorAll('img');
        const imageData = {
          total: images.length,
          withAlt: Array.from(images).filter(img => img.alt && img.alt.trim() !== '').length,
          withoutAlt: Array.from(images).filter(img => !img.alt || img.alt.trim() === '').length,
          optimized: Array.from(images).filter(img => 
            img.loading === 'lazy' || 
            img.getAttribute('srcset') || 
            img.src.includes('.webp')
          ).length
        };

        // Links analysis
        const linkElements = document.querySelectorAll('a[href]');
        const linkData = {
          internal: 0,
          external: 0,
          nofollow: 0,
          dofollow: 0
        };

        Array.from(linkElements).forEach(link => {
          const href = link.getAttribute('href') || '';
          const rel = link.getAttribute('rel') || '';
          
          if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            linkData.external++;
          } else if (href.startsWith('/') || href.includes(window.location.hostname)) {
            linkData.internal++;
          }

          if (rel.includes('nofollow')) {
            linkData.nofollow++;
          } else {
            linkData.dofollow++;
          }
        });

        // Content analysis
        const bodyText = document.body.textContent || '';
        const wordCount = bodyText.trim().split(/\s+/).length;

        // Technology detection
        const technologies = {
          cms: [] as string[],
          frameworks: [] as string[],
          analytics: [] as string[],
          advertising: [] as string[],
          ecommerce: [] as string[],
          cdn: [] as string[],
          webServer: [] as string[],
          programmingLanguages: [] as string[],
          databases: [] as string[],
          jsLibraries: [] as string[]
        };

        // Detect technologies from various sources
        const scriptElements = Array.from(document.querySelectorAll('script[src]'));
        const linkStyleElements = Array.from(document.querySelectorAll('link[href]'));
        const metaElements = Array.from(document.querySelectorAll('meta'));

        // WordPress detection
        if (document.querySelector('meta[name="generator"][content*="WordPress"]') ||
            scriptElements.some(s => (s as HTMLScriptElement).src.includes('wp-content')) ||
            linkStyleElements.some(l => (l as HTMLLinkElement).href.includes('wp-content'))) {
          technologies.cms.push('WordPress');
        }

        // React detection
        if ((window as any).React || document.querySelector('[data-reactroot]') || 
            scriptElements.some(s => (s as HTMLScriptElement).src.includes('react'))) {
          technologies.frameworks.push('React');
        }

        // Vue.js detection
        if ((window as any).Vue || document.querySelector('[data-v-]')) {
          technologies.frameworks.push('Vue.js');
        }

        // Angular detection
        if ((window as any).ng || document.querySelector('[ng-app]') || 
            scriptElements.some(s => (s as HTMLScriptElement).src.includes('angular'))) {
          technologies.frameworks.push('Angular');
        }

        // Google Analytics detection
        if (scriptElements.some(s => {
          const src = (s as HTMLScriptElement).src;
          return src.includes('google-analytics') || src.includes('gtag');
        })) {
          technologies.analytics.push('Google Analytics');
        }

        // jQuery detection
        if ((window as any).jQuery || (window as any).$ || 
            scriptElements.some(s => (s as HTMLScriptElement).src.includes('jquery'))) {
          technologies.jsLibraries.push('jQuery');
        }

        // Shopify detection
        if ((window as any).Shopify || 
            scriptElements.some(s => (s as HTMLScriptElement).src.includes('shopify'))) {
          technologies.ecommerce.push('Shopify');
        }

        // Structural analysis
        const structure = {
          htmlStructure: {
            doctype: document.doctype ? document.doctype.name : '',
            htmlLang: document.documentElement.lang || '',
            headElements: document.head.children.length,
            bodyElements: document.body.children.length,
            totalElements: document.querySelectorAll('*').length
          },
          navigation: {
            mainNavigation: !!document.querySelector('nav, [role="navigation"]'),
            breadcrumbs: !!document.querySelector('[aria-label*="breadcrumb"], .breadcrumb'),
            footerNavigation: !!document.querySelector('footer nav, footer [role="navigation"]'),
            sitemapLink: !!document.querySelector('a[href*="sitemap"]')
          },
          accessibility: {
            altTexts: Array.from(document.querySelectorAll('img[alt]')).length,
            ariaLabels: Array.from(document.querySelectorAll('[aria-label]')).length,
            headingStructure: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => h.tagName),
            skipLinks: !!document.querySelector('a[href="#main"], a[href="#content"]')
          },
          seo: {
            canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
            robotsMeta: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
            openGraph: {} as Record<string, string>,
            twitterCard: {} as Record<string, string>,
            jsonLd: [] as any[]
          }
        };

        // Extract Open Graph data
        metaElements.forEach(meta => {
          const property = meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (property && property.startsWith('og:') && content) {
            structure.seo.openGraph[property] = content;
          }
          if (property && property.startsWith('twitter:') && content) {
            structure.seo.twitterCard[property] = content;
          }
        });

        // Extract JSON-LD
        const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        jsonLdScripts.forEach(script => {
          try {
            const data = JSON.parse(script.textContent || '');
            structure.seo.jsonLd.push(data);
          } catch (e) {
            // Invalid JSON-LD
          }
        });

        // Performance metrics
        const performance = {
          resourceCounts: {
            images: document.querySelectorAll('img').length,
            scripts: document.querySelectorAll('script').length,
            stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
            fonts: document.querySelectorAll('link[href*="font"]').length,
            videos: document.querySelectorAll('video').length
          },
          resourceSizes: {
            totalSize: 0, // Will be calculated separately
            imageSize: 0,
            scriptSize: 0,
            stylesheetSize: 0
          },
          optimizations: {
            imageOptimization: Array.from(document.querySelectorAll('img')).some(img => 
              img.loading === 'lazy' || img.getAttribute('srcset')
            ),
            minification: scriptElements.some(s => (s as HTMLScriptElement).src.includes('.min.')),
            compression: false, // Will be detected from headers
            caching: false // Will be detected from headers
          }
        };

        return {
          title,
          metaDescription,
          headings,
          images: imageData,
          links: linkData,
          content: {
            wordCount,
            readabilityScore: 0, // Will be calculated separately
            keywordDensity: {} as Record<string, number>
          },
          technologies,
          structure,
          performance
        };
      });

      // Calculate keyword density
      const bodyText = await page.evaluate(() => document.body.textContent || '');
      const words = bodyText.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFreq: Record<string, number> = {};
      
      words.forEach(word => {
        if (word.length > 3) { // Only count words longer than 3 characters
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      // Get top 10 keywords by frequency
      const sortedKeywords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [word, count]) => {
          obj[word] = (count / words.length) * 100;
          return obj;
        }, {} as Record<string, number>);

      seoData.content.keywordDensity = sortedKeywords;

      // Calculate readability score (simplified Flesch Reading Ease)
      const sentences = bodyText.split(/[.!?]+/).length;
      const syllables = words.reduce((count, word) => {
        return count + this.countSyllables(word);
      }, 0);

      if (sentences > 0 && words.length > 0) {
        const avgWordsPerSentence = words.length / sentences;
        const avgSyllablesPerWord = syllables / words.length;
        seoData.content.readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
      }

      // Get response headers for additional analysis
      const headers = response?.headers() || {};
      seoData.performance.optimizations.compression = !!(headers['content-encoding']);
      seoData.performance.optimizations.caching = !!(headers['cache-control'] || headers['expires']);

      // Technical metrics
      const technical = {
        loadTime,
        pageSize: parseInt(headers['content-length'] || '0'),
        httpStatus: response?.status() || 0,
        redirects: response?.request().redirectChain().length || 0,
        ssl: url.startsWith('https://')
      };

      return {
        url,
        ...seoData,
        technical
      } as AdvancedSEOMetrics;

    } finally {
      await page.close();
    }
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  }
}

export const getAdvancedSEOScraper = () => new AdvancedSEOScraper();
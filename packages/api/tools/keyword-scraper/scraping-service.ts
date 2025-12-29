import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapingResult, KeywordAnalysisConfig } from './types';

export class ScrapingService {
  private browser: Browser | null = null;

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
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeUrl(url: string, config: KeywordAnalysisConfig): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      const page = await this.browser.newPage();
      
      // Configure page
      await page.setUserAgent(
        config.userAgent || 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set timeout and navigate
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Extract content
      const content = await this.extractContent(page, config);
      
      // Get title and meta description
      const title = await page.title();
      const metaDescriptionRaw = await page.$eval(
        'meta[name="description"]', 
        (el) => el.getAttribute('content')
      ).catch(() => undefined);
      const metaDescription: string | undefined = metaDescriptionRaw ?? undefined;

      await page.close();

      const processingTime = Date.now() - startTime;

      return {
        url,
        success: true,
        title,
        metaDescription,
        content,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      };
    }
  }

  private async extractContent(page: Page, config: KeywordAnalysisConfig) {
    const content: any = {
      headings: {},
      metaTags: {},
      paragraphs: [],
      links: []
    };

    try {
      // Extract headings if enabled
      if (config.includeHeadings) {
        const headings = await page.evaluate(() => {
          const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const headings: { [key: string]: string[] } = {};
          
          headingElements.forEach((el) => {
            const tag = el.tagName.toLowerCase();
            const text = el.textContent?.trim() || '';
            
            if (text) {
              if (!headings[tag]) {
                headings[tag] = [];
              }
              headings[tag].push(text);
            }
          });
          
          return headings;
        });
        
        content.headings = headings;
      }

      // Extract meta tags if enabled
      if (config.includeMetaTags) {
        const metaTags = await page.evaluate(() => {
          const metas = document.querySelectorAll('meta');
          const metaData: { [key: string]: string } = {};
          
          metas.forEach((meta) => {
            const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
            const content = meta.getAttribute('content') || '';
            
            if (name && content) {
              metaData[name] = content;
            }
          });
          
          return metaData;
        });
        
        content.metaTags = metaTags;
      }

      // Extract paragraph content if enabled
      if (config.includeContent) {
        const paragraphs = await page.evaluate((excludeElements) => {
          // Remove excluded elements
          if (excludeElements && excludeElements.length > 0) {
            excludeElements.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => el.remove());
            });
          }

          const paragraphElements = document.querySelectorAll('p, div, span, article, section');
          const paragraphs: string[] = [];
          
          paragraphElements.forEach((el) => {
            const text = el.textContent?.trim() || '';
            
            // Filter out short text and common UI elements
            if (text.length > 20 && 
                !text.match(/^(menu|navigation|footer|header|sidebar)/i) &&
                !text.match(/^(click|read more|learn more|contact)/i)) {
              paragraphs.push(text);
            }
          });
          
          return paragraphs;
        }, config.excludeElements || []);
        
        content.paragraphs = paragraphs;

        // Extract links
        const links = await page.evaluate(() => {
          const linkElements = document.querySelectorAll('a[href]');
          const links: { text: string; href: string }[] = [];
          
          linkElements.forEach((link) => {
            const text = link.textContent?.trim() || '';
            const href = link.getAttribute('href') || '';
            
            if (text && href && text.length > 2 && text.length < 100) {
              links.push({ text, href });
            }
          });
          
          return links;
        });
        
        content.links = links;
      }

    } catch (error) {
      console.error('Error extracting content:', error);
    }

    return content;
  }

  async scrapeMultipleUrls(
    urls: string[], 
    config: KeywordAnalysisConfig,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const result = await this.scrapeUrl(url, config);
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, urls.length);
        }
        
        // Add delay between requests to be respectful
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: 0
        });
      }
    }

    return results;
  }

  async scrapeWithDepth(
    baseUrl: string, 
    config: KeywordAnalysisConfig,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ScrapingResult[]> {
    const urlsToScrape = new Set<string>([baseUrl]);
    const scrapedUrls = new Set<string>();
    const results: ScrapingResult[] = [];
    
    let currentDepth = 0;
    
    while (currentDepth < config.depth && urlsToScrape.size > 0) {
      const currentLevelUrls = Array.from(urlsToScrape);
      urlsToScrape.clear();
      
      for (const url of currentLevelUrls) {
        if (scrapedUrls.has(url)) continue;
        
        const result = await this.scrapeUrl(url, config);
        results.push(result);
        scrapedUrls.add(url);
        
        // Extract internal links for next depth level
        if (result.success && result.content && currentDepth < config.depth - 1) {
          const baseUrlObj = new URL(baseUrl);
          
          result.content.links?.forEach(link => {
            try {
              const linkUrl = new URL(link.href, baseUrl);
              
              // Only add internal links from the same domain
              if (linkUrl.hostname === baseUrlObj.hostname && 
                  !scrapedUrls.has(linkUrl.href) &&
                  !linkUrl.href.includes('#') &&
                  !linkUrl.href.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i)) {
                urlsToScrape.add(linkUrl.href);
              }
            } catch (e) {
              // Invalid URL, skip
            }
          });
        }
        
        if (onProgress) {
          onProgress(scrapedUrls.size, Math.min(scrapedUrls.size + urlsToScrape.size, 50));
        }
        
        // Limit total URLs to prevent infinite crawling
        if (scrapedUrls.size >= 50) break;
      }
      
      currentDepth++;
    }
    
    return results;
  }
}
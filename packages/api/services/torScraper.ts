import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export async function getPageWithTor(url: string): Promise<{ $: cheerio.CheerioAPI; html: string }> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
    });
  
    const page = await browser.newPage();
    try {
      // Configurar user agent para evitar detección
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      const html = await page.content();
      const $ = cheerio.load(html);
      return { $, html };
    } catch (err) {
      console.error('[Page Scraper Error]', `Failed to scrape ${url}:`, err instanceof Error ? err.message : err);
      throw new Error(`No se pudo acceder a la página: ${url}. Verifica que la URL sea válida y esté accesible.`);
    } finally {
      await browser.close();
    }
  }
  

export const scrapeWithTor = async (url: string): Promise<cheerio.CheerioAPI | null> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
  });

  const page = await browser.newPage();

  try {
    // Configurar user agent y headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    });
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    return $;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error instanceof Error ? error.message : error);
    return null;
  } finally {
    await browser.close();
  }
};

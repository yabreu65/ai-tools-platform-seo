import puppeteer from 'puppeteer';

export async function deepAudit(url: string, includeMedia = false): Promise<{
  loadTime: number;
  totalRequests: number;
  totalBytes: number;
  scriptCount: number;
  hasH1: boolean;
  hasMetaDescription: boolean;
}> {
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

  if (!includeMedia) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resource = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resource)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  let totalBytes = 0;
  let requestCount = 0;

  page.on('requestfinished', async (req) => {
    requestCount++;
    try {
      const res = await req.response();
      const buffer = await res?.buffer();
      totalBytes += buffer?.length || 0;
    } catch {}
  });

  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const loadTime = Date.now() - start;

  const scriptCount = await page.$$eval('script', els => els.length);
  const hasH1 = await page.$('h1') !== null;
  const hasMetaDescription = await page.$('meta[name="description"]') !== null;

  await browser.close();

  return {
    loadTime,
    totalRequests: requestCount,
    totalBytes,
    scriptCount,
    hasH1,
    hasMetaDescription,
  };
}

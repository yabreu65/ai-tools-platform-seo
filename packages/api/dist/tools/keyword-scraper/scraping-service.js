"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class ScrapingService {
    constructor() {
        this.browser = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer_1.default.launch({
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
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
                this.browser = null;
            }
        });
    }
    scrapeUrl(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            try {
                yield this.initialize();
                if (!this.browser) {
                    throw new Error('Failed to initialize browser');
                }
                const page = yield this.browser.newPage();
                // Configure page
                yield page.setUserAgent(config.userAgent ||
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                yield page.setViewport({ width: 1920, height: 1080 });
                // Set timeout and navigate
                yield page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                // Extract content
                const content = yield this.extractContent(page, config);
                // Get title and meta description
                const title = yield page.title();
                const metaDescriptionRaw = yield page.$eval('meta[name="description"]', (el) => el.getAttribute('content')).catch(() => undefined);
                const metaDescription = metaDescriptionRaw !== null && metaDescriptionRaw !== void 0 ? metaDescriptionRaw : undefined;
                yield page.close();
                const processingTime = Date.now() - startTime;
                return {
                    url,
                    success: true,
                    title,
                    metaDescription,
                    content,
                    processingTime
                };
            }
            catch (error) {
                const processingTime = Date.now() - startTime;
                return {
                    url,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    processingTime
                };
            }
        });
    }
    extractContent(page, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = {
                headings: {},
                metaTags: {},
                paragraphs: [],
                links: []
            };
            try {
                // Extract headings if enabled
                if (config.includeHeadings) {
                    const headings = yield page.evaluate(() => {
                        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                        const headings = {};
                        headingElements.forEach((el) => {
                            var _a;
                            const tag = el.tagName.toLowerCase();
                            const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
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
                    const metaTags = yield page.evaluate(() => {
                        const metas = document.querySelectorAll('meta');
                        const metaData = {};
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
                    const paragraphs = yield page.evaluate((excludeElements) => {
                        // Remove excluded elements
                        if (excludeElements && excludeElements.length > 0) {
                            excludeElements.forEach(selector => {
                                const elements = document.querySelectorAll(selector);
                                elements.forEach(el => el.remove());
                            });
                        }
                        const paragraphElements = document.querySelectorAll('p, div, span, article, section');
                        const paragraphs = [];
                        paragraphElements.forEach((el) => {
                            var _a;
                            const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
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
                    const links = yield page.evaluate(() => {
                        const linkElements = document.querySelectorAll('a[href]');
                        const links = [];
                        linkElements.forEach((link) => {
                            var _a;
                            const text = ((_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                            const href = link.getAttribute('href') || '';
                            if (text && href && text.length > 2 && text.length < 100) {
                                links.push({ text, href });
                            }
                        });
                        return links;
                    });
                    content.links = links;
                }
            }
            catch (error) {
                console.error('Error extracting content:', error);
            }
            return content;
        });
    }
    scrapeMultipleUrls(urls, config, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                try {
                    const result = yield this.scrapeUrl(url, config);
                    results.push(result);
                    if (onProgress) {
                        onProgress(i + 1, urls.length);
                    }
                    // Add delay between requests to be respectful
                    if (i < urls.length - 1) {
                        yield new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                catch (error) {
                    results.push({
                        url,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        processingTime: 0
                    });
                }
            }
            return results;
        });
    }
    scrapeWithDepth(baseUrl, config, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const urlsToScrape = new Set([baseUrl]);
            const scrapedUrls = new Set();
            const results = [];
            let currentDepth = 0;
            while (currentDepth < config.depth && urlsToScrape.size > 0) {
                const currentLevelUrls = Array.from(urlsToScrape);
                urlsToScrape.clear();
                for (const url of currentLevelUrls) {
                    if (scrapedUrls.has(url))
                        continue;
                    const result = yield this.scrapeUrl(url, config);
                    results.push(result);
                    scrapedUrls.add(url);
                    // Extract internal links for next depth level
                    if (result.success && result.content && currentDepth < config.depth - 1) {
                        const baseUrlObj = new URL(baseUrl);
                        (_a = result.content.links) === null || _a === void 0 ? void 0 : _a.forEach(link => {
                            try {
                                const linkUrl = new URL(link.href, baseUrl);
                                // Only add internal links from the same domain
                                if (linkUrl.hostname === baseUrlObj.hostname &&
                                    !scrapedUrls.has(linkUrl.href) &&
                                    !linkUrl.href.includes('#') &&
                                    !linkUrl.href.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i)) {
                                    urlsToScrape.add(linkUrl.href);
                                }
                            }
                            catch (e) {
                                // Invalid URL, skip
                            }
                        });
                    }
                    if (onProgress) {
                        onProgress(scrapedUrls.size, Math.min(scrapedUrls.size + urlsToScrape.size, 50));
                    }
                    // Limit total URLs to prevent infinite crawling
                    if (scrapedUrls.size >= 50)
                        break;
                }
                currentDepth++;
            }
            return results;
        });
    }
}
exports.ScrapingService = ScrapingService;

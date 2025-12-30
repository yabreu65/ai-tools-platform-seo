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
    constructor(config) {
        this.browser = null;
        this.config = Object.assign({ headless: true, timeout: 30000, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', viewport: { width: 1920, height: 1080 }, delay: 1000 }, config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser)
                return;
            try {
                this.browser = yield puppeteer_1.default.launch({
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
            }
            catch (error) {
                throw new Error(`Failed to initialize browser: ${error}`);
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
    scrapeCompetitorData(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                yield this.initialize();
            }
            const page = yield this.browser.newPage();
            const startTime = Date.now();
            try {
                // Configure page
                yield page.setUserAgent(this.config.userAgent);
                yield page.setViewport(this.config.viewport);
                // Enable request interception for performance monitoring
                yield page.setRequestInterception(true);
                let resourceCount = 0;
                page.on('request', (request) => {
                    resourceCount++;
                    request.continue();
                });
                // Navigate to domain
                const url = domain.startsWith('http') ? domain : `https://${domain}`;
                const response = yield page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: this.config.timeout
                });
                if (!response || !response.ok()) {
                    throw new Error(`Failed to load page: ${response === null || response === void 0 ? void 0 : response.status()}`);
                }
                const responseTime = Date.now() - startTime;
                // Wait for additional content if specified
                if (this.config.waitForSelector) {
                    yield page.waitForSelector(this.config.waitForSelector, {
                        timeout: 5000
                    }).catch(() => { }); // Ignore timeout
                }
                // Add delay if specified
                if (this.config.delay) {
                    yield new Promise(resolve => setTimeout(resolve, this.config.delay));
                }
                // Extract SEO data
                const seoData = yield this.extractSEOData(page);
                // Extract technical metrics
                const technicalMetrics = yield this.extractTechnicalMetrics(page);
                // Extract content structure
                const contentStructure = yield this.extractContentStructure(page);
                const loadTime = Date.now() - startTime;
                yield page.close();
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
            }
            catch (error) {
                yield page.close();
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
        });
    }
    extractSEOData(page) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield page.evaluate(() => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                // Extract title
                const title = document.title || '';
                // Extract meta description
                const metaDescription = ((_a = document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || '';
                // Extract meta keywords
                const metaKeywords = ((_b = document.querySelector('meta[name="keywords"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) || '';
                // Extract headings
                const headings = {
                    h1: Array.from(document.querySelectorAll('h1')).map(h => { var _a; return ((_a = h.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; }),
                    h2: Array.from(document.querySelectorAll('h2')).map(h => { var _a; return ((_a = h.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; }),
                    h3: Array.from(document.querySelectorAll('h3')).map(h => { var _a; return ((_a = h.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; }),
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
                    .map(link => {
                    var _a;
                    return ({
                        href: link.getAttribute('href'),
                        text: ((_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                        title: link.getAttribute('title') || ''
                    });
                });
                // Extract external links
                const externalLinks = Array.from(document.querySelectorAll('a[href]'))
                    .filter(link => {
                    const href = link.getAttribute('href');
                    return href && href.startsWith('http') && !href.includes(window.location.hostname);
                })
                    .map(link => {
                    var _a;
                    return ({
                        href: link.getAttribute('href'),
                        text: ((_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                        title: link.getAttribute('title') || ''
                    });
                });
                // Extract structured data
                const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                    .map(script => {
                    try {
                        return JSON.parse(script.textContent || '');
                    }
                    catch (_a) {
                        return null;
                    }
                })
                    .filter(data => data !== null);
                // Extract canonical URL
                const canonical = ((_c = document.querySelector('link[rel="canonical"]')) === null || _c === void 0 ? void 0 : _c.getAttribute('href')) || '';
                // Extract robots meta
                const robots = ((_d = document.querySelector('meta[name="robots"]')) === null || _d === void 0 ? void 0 : _d.getAttribute('content')) || '';
                // Extract Open Graph data
                const openGraph = {
                    title: ((_e = document.querySelector('meta[property="og:title"]')) === null || _e === void 0 ? void 0 : _e.getAttribute('content')) || '',
                    description: ((_f = document.querySelector('meta[property="og:description"]')) === null || _f === void 0 ? void 0 : _f.getAttribute('content')) || '',
                    image: ((_g = document.querySelector('meta[property="og:image"]')) === null || _g === void 0 ? void 0 : _g.getAttribute('content')) || '',
                    url: ((_h = document.querySelector('meta[property="og:url"]')) === null || _h === void 0 ? void 0 : _h.getAttribute('content')) || ''
                };
                // Extract Twitter Card data
                const twitterCard = {
                    card: ((_j = document.querySelector('meta[name="twitter:card"]')) === null || _j === void 0 ? void 0 : _j.getAttribute('content')) || '',
                    title: ((_k = document.querySelector('meta[name="twitter:title"]')) === null || _k === void 0 ? void 0 : _k.getAttribute('content')) || '',
                    description: ((_l = document.querySelector('meta[name="twitter:description"]')) === null || _l === void 0 ? void 0 : _l.getAttribute('content')) || '',
                    image: ((_m = document.querySelector('meta[name="twitter:image"]')) === null || _m === void 0 ? void 0 : _m.getAttribute('content')) || ''
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
                    wordCount: ((_o = document.body.textContent) === null || _o === void 0 ? void 0 : _o.split(/\s+/).length) || 0
                };
            });
        });
    }
    extractTechnicalMetrics(page) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get performance metrics
            const performanceMetrics = yield page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
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
            const technicalChecks = yield page.evaluate(() => {
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
        });
    }
    extractContentStructure(page) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield page.evaluate(() => {
                var _a, _b;
                // Extract content sections
                const sections = Array.from(document.querySelectorAll('section, article, div[class*="content"], main'))
                    .map(section => {
                    var _a;
                    return ({
                        tagName: section.tagName.toLowerCase(),
                        className: section.className,
                        textLength: ((_a = section.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        headingCount: section.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                        linkCount: section.querySelectorAll('a').length,
                        imageCount: section.querySelectorAll('img').length
                    });
                });
                // Extract navigation structure
                const navigation = Array.from(document.querySelectorAll('nav, [role="navigation"]'))
                    .map(nav => ({
                    className: nav.className,
                    linkCount: nav.querySelectorAll('a').length,
                    links: Array.from(nav.querySelectorAll('a')).map(link => {
                        var _a;
                        return ({
                            text: ((_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                            href: link.getAttribute('href') || ''
                        });
                    })
                }));
                // Extract footer information
                const footer = document.querySelector('footer');
                const footerInfo = footer ? {
                    linkCount: footer.querySelectorAll('a').length,
                    textLength: ((_a = footer.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    hasContactInfo: /contact|email|phone|address/i.test(footer.textContent || ''),
                    hasSocialLinks: footer.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]').length > 0
                } : null;
                return {
                    sections,
                    navigation,
                    footer: footerInfo,
                    totalTextLength: ((_b = document.body.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    totalLinkCount: document.querySelectorAll('a').length,
                    totalImageCount: document.querySelectorAll('img').length
                };
            });
        });
    }
    scrapeMultipleCompetitors(domains_1) {
        return __awaiter(this, arguments, void 0, function* (domains, concurrency = 3) {
            const results = [];
            // Process domains in batches to avoid overwhelming the system
            for (let i = 0; i < domains.length; i += concurrency) {
                const batch = domains.slice(i, i + concurrency);
                const batchPromises = batch.map(domain => this.scrapeCompetitorData(domain));
                const batchResults = yield Promise.all(batchPromises);
                results.push(...batchResults);
                // Add delay between batches to be respectful
                if (i + concurrency < domains.length) {
                    yield new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            return results;
        });
    }
    checkSitemap(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                yield this.initialize();
            }
            const page = yield this.browser.newPage();
            try {
                const sitemapUrl = domain.startsWith('http') ? `${domain}/sitemap.xml` : `https://${domain}/sitemap.xml`;
                const response = yield page.goto(sitemapUrl, { timeout: 10000 });
                if (!response || !response.ok()) {
                    return { exists: false };
                }
                const content = yield page.content();
                // Parse sitemap URLs (simplified)
                const urlMatches = content.match(/<loc>(.*?)<\/loc>/g);
                const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];
                yield page.close();
                return {
                    exists: true,
                    urls: urls.slice(0, 100) // Limit to first 100 URLs
                };
            }
            catch (error) {
                yield page.close();
                return {
                    exists: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    checkRobotsTxt(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                yield this.initialize();
            }
            const page = yield this.browser.newPage();
            try {
                const robotsUrl = domain.startsWith('http') ? `${domain}/robots.txt` : `https://${domain}/robots.txt`;
                const response = yield page.goto(robotsUrl, { timeout: 10000 });
                if (!response || !response.ok()) {
                    return { exists: false };
                }
                const content = yield page.content();
                // Extract text content from the page
                const textContent = yield page.evaluate(() => document.body.textContent || '');
                yield page.close();
                return {
                    exists: true,
                    content: textContent
                };
            }
            catch (error) {
                yield page.close();
                return {
                    exists: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
}
exports.ScrapingService = ScrapingService;
exports.default = ScrapingService;

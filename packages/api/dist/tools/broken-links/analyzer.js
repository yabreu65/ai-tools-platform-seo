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
exports.BrokenLinkAnalyzer = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
class BrokenLinkAnalyzer {
    constructor() {
        this.browser = null;
        this.visitedUrls = new Set();
        this.foundLinks = new Set();
        this.brokenLinks = [];
        this.cancelled = false;
    }
    analyze(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            this.reset();
            try {
                // Inicializar Puppeteer
                this.browser = yield puppeteer_1.default.launch({
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
                // Validar URL inicial
                const baseUrl = new url_1.URL(config.url);
                // Iniciar crawling
                yield this.crawlUrl(config.url, baseUrl, config, 0);
                // Verificar enlaces encontrados
                yield this.verifyLinks(config);
                const endTime = Date.now();
                const analysisTime = endTime - startTime;
                // Calcular métricas finales
                const summary = {
                    totalPages: this.visitedUrls.size,
                    totalLinks: this.foundLinks.size,
                    brokenLinks: this.brokenLinks.length,
                    healthScore: this.calculateHealthScore(),
                    analysisTime
                };
                return {
                    summary,
                    brokenLinks: this.brokenLinks
                };
            }
            finally {
                if (this.browser) {
                    yield this.browser.close();
                }
            }
        });
    }
    reset() {
        this.visitedUrls.clear();
        this.foundLinks.clear();
        this.brokenLinks = [];
        this.cancelled = false;
    }
    crawlUrl(url, baseUrl, config, currentDepth) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cancelled || currentDepth >= config.depth) {
                return;
            }
            // Verificar si ya visitamos esta URL
            if (this.visitedUrls.has(url)) {
                return;
            }
            // Verificar exclusiones
            if (this.isExcluded(url, config.excludePaths)) {
                return;
            }
            this.visitedUrls.add(url);
            try {
                const page = yield this.browser.newPage();
                // Configurar timeout y user agent
                yield page.setDefaultTimeout(config.timeout);
                yield page.setUserAgent('Mozilla/5.0 (compatible; BrokenLinkChecker/1.0)');
                // Navegar a la página
                const response = yield page.goto(url, {
                    waitUntil: 'networkidle0',
                    timeout: config.timeout
                });
                const statusCode = (response === null || response === void 0 ? void 0 : response.status()) || 0;
                // Extraer enlaces de la página
                const links = yield this.extractLinks(page, url, baseUrl, config.includeExternal);
                // Reportar progreso
                if (config.onPageAnalyzed) {
                    config.onPageAnalyzed({
                        url,
                        statusCode,
                        linksCount: links.length
                    });
                }
                // Agregar enlaces encontrados
                links.forEach(link => this.foundLinks.add(link));
                yield page.close();
                // Reportar progreso general
                if (config.onProgress) {
                    config.onProgress({
                        percentage: Math.min(100, (this.visitedUrls.size / (config.depth * 10)) * 100),
                        pagesAnalyzed: this.visitedUrls.size,
                        linksFound: this.foundLinks.size,
                        brokenLinks: this.brokenLinks.length
                    });
                }
                // Continuar crawling en profundidad para enlaces internos
                if (currentDepth < config.depth - 1) {
                    const internalLinks = links.filter(link => this.isInternalLink(link, baseUrl));
                    for (const link of internalLinks.slice(0, 10)) { // Limitar para evitar explosión
                        if (!this.cancelled) {
                            yield this.crawlUrl(link, baseUrl, config, currentDepth + 1);
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error crawling ${url}:`, error);
                // Reportar como enlace roto si es un error de navegación
                this.brokenLinks.push({
                    sourceUrl: 'crawler',
                    targetUrl: url,
                    statusCode: 0,
                    errorType: 'navigation_error',
                    linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
                });
            }
        });
    }
    extractLinks(page, sourceUrl, baseUrl, includeExternal) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const links = yield page.evaluate(() => {
                    const anchors = Array.from(document.querySelectorAll('a[href]'));
                    return anchors.map(anchor => anchor.href).filter(href => href);
                });
                // Filtrar y normalizar enlaces
                const filteredLinks = links
                    .map(link => {
                    try {
                        return new url_1.URL(link, sourceUrl).href;
                    }
                    catch (_a) {
                        return null;
                    }
                })
                    .filter((link) => {
                    if (!link)
                        return false;
                    const linkUrl = new url_1.URL(link);
                    // Excluir ciertos protocolos
                    if (!['http:', 'https:'].includes(linkUrl.protocol)) {
                        return false;
                    }
                    // Filtrar enlaces externos si no están incluidos
                    if (!includeExternal && !this.isInternalLink(link, baseUrl)) {
                        return false;
                    }
                    return true;
                });
                return [...new Set(filteredLinks)]; // Eliminar duplicados
            }
            catch (error) {
                console.error(`Error extracting links from ${sourceUrl}:`, error);
                return [];
            }
        });
    }
    verifyLinks(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const linksArray = Array.from(this.foundLinks);
            const batchSize = 10; // Procesar en lotes para no sobrecargar
            for (let i = 0; i < linksArray.length; i += batchSize) {
                if (this.cancelled)
                    break;
                const batch = linksArray.slice(i, i + batchSize);
                const promises = batch.map(link => this.verifyLink(link, config));
                yield Promise.allSettled(promises);
                // Reportar progreso
                if (config.onProgress) {
                    config.onProgress({
                        percentage: Math.min(100, ((i + batchSize) / linksArray.length) * 100),
                        pagesAnalyzed: this.visitedUrls.size,
                        linksFound: this.foundLinks.size,
                        brokenLinks: this.brokenLinks.length
                    });
                }
            }
        });
    }
    verifyLink(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.head(url, {
                    timeout: config.timeout,
                    // maxRedirects is not supported in Axios HEAD config type in our TS version; follow redirects by GET if needed
                    validateStatus: () => true, // No lanzar error por status codes
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; BrokenLinkChecker/1.0)'
                    }
                });
                const statusCode = response.status;
                if (statusCode >= 400) {
                    const errorType = this.getErrorType(statusCode);
                    const baseUrl = new url_1.URL(config.url);
                    const brokenLink = {
                        sourceUrl: this.findSourceUrl(url) || 'unknown',
                        targetUrl: url,
                        statusCode,
                        errorType,
                        linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
                    };
                    this.brokenLinks.push(brokenLink);
                    if (config.onBrokenLink) {
                        config.onBrokenLink(brokenLink);
                    }
                }
            }
            catch (error) {
                const errorType = this.getErrorTypeFromException(error);
                const baseUrl = new url_1.URL(config.url);
                const brokenLink = {
                    sourceUrl: this.findSourceUrl(url) || 'unknown',
                    targetUrl: url,
                    statusCode: 0,
                    errorType,
                    linkType: this.isInternalLink(url, baseUrl) ? 'internal' : 'external'
                };
                this.brokenLinks.push(brokenLink);
                if (config.onBrokenLink) {
                    config.onBrokenLink(brokenLink);
                }
            }
        });
    }
    getErrorType(statusCode) {
        if (statusCode === 404)
            return '404';
        if (statusCode >= 500)
            return '500';
        if (statusCode === 403)
            return 'forbidden';
        if (statusCode === 401)
            return 'unauthorized';
        return 'http_error';
    }
    getErrorTypeFromException(error) {
        var _a, _b, _c, _d;
        if (error.code === 'ENOTFOUND')
            return 'dns_error';
        if (error.code === 'ECONNREFUSED')
            return 'connection_refused';
        if (error.code === 'ETIMEDOUT' || ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('timeout')))
            return 'timeout';
        if (((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('SSL')) || ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('certificate')))
            return 'ssl_error';
        if ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('redirect'))
            return 'redirect_loop';
        return 'network_error';
    }
    isInternalLink(url, baseUrl) {
        try {
            const linkUrl = new url_1.URL(url);
            return linkUrl.hostname === baseUrl.hostname;
        }
        catch (_a) {
            return false;
        }
    }
    isExcluded(url, excludePaths) {
        try {
            const urlObj = new url_1.URL(url);
            return excludePaths.some(path => urlObj.pathname.startsWith(path));
        }
        catch (_a) {
            return false;
        }
    }
    findSourceUrl(targetUrl) {
        // En una implementación más compleja, mantendríamos un mapa de enlaces por página
        // Por simplicidad, retornamos la primera URL visitada
        return Array.from(this.visitedUrls)[0] || null;
    }
    calculateHealthScore() {
        if (this.foundLinks.size === 0)
            return 100;
        const brokenPercentage = (this.brokenLinks.length / this.foundLinks.size) * 100;
        return Math.max(0, Math.round(100 - brokenPercentage));
    }
    cancel() {
        this.cancelled = true;
    }
}
exports.BrokenLinkAnalyzer = BrokenLinkAnalyzer;

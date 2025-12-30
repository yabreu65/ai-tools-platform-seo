"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const connect_1 = require("../../db/connect");
const SitemapAnalysis_1 = __importDefault(require("../../db/models/SitemapAnalysis"));
const cache_1 = require("../../utils/cache");
const seoAuth_1 = require("../../middleware/seoAuth");
const seoValidators_1 = require("../../utils/seoValidators");
const router = (0, express_1.Router)();
// POST /api/generador-sitemap - Generar sitemap
router.post('/', seoAuth_1.requireSeoAuth, (0, seoAuth_1.checkPlanLimits)('depth'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authReq = req;
    const startTime = Date.now();
    // Validar configuración fuera del try para que esté disponible en catch
    const config = {
        url: req.body.url,
        depth: parseInt(req.body.depth) || 3,
        includeImages: req.body.includeImages || false,
        includeVideos: req.body.includeVideos || false,
        excludePaths: req.body.excludePaths || [],
        maxUrls: req.body.maxUrls || authReq.user.planLimits.maxUrlsPerAnalysis
    };
    const validation = (0, seoValidators_1.validateSitemapConfig)(config);
    if (!validation.isValid) {
        res.status(400).json({
            success: false,
            error: 'Configuración inválida',
            details: validation.errors
        });
        return;
    }
    try {
        const sanitizedUrl = (0, seoValidators_1.sanitizeUrl)(config.url);
        const origin = new URL(sanitizedUrl).origin;
        // Generar clave de cache
        const cacheKey = (0, cache_1.generateCacheKey)('sitemap', {
            origin,
            depth: config.depth,
            includeImages: config.includeImages,
            includeVideos: config.includeVideos
        });
        // Verificar cache
        const cachedResult = cache_1.cache.get(cacheKey);
        if (cachedResult && cachedResult.status !== 'error') {
            console.log(`Cache hit for sitemap: ${sanitizedUrl}`);
            res.json(Object.assign(Object.assign({ success: true }, cachedResult), { fromCache: true }));
            return;
        }
        // Conectar a la base de datos
        yield (0, connect_1.connectDB)();
        // Analizar sitemap existente
        const existingSitemapAnalysis = yield analyzeSitemap(origin);
        // Realizar crawling profundo
        const crawledUrls = yield performDeepCrawl(sanitizedUrl, config);
        const processingTime = Date.now() - startTime;
        // Generar sitemap XML
        const sitemapXml = generateSitemapXML(crawledUrls, config);
        // Guardar archivo
        const downloadUrl = yield saveSitemapFile(sitemapXml);
        // Preparar respuesta
        const result = {
            status: existingSitemapAnalysis.found && existingSitemapAnalysis.valid ? 'ok' :
                existingSitemapAnalysis.found ? 'invalid' : 'missing',
            message: existingSitemapAnalysis.found && existingSitemapAnalysis.valid
                ? `Tu sitio ya tiene un sitemap válido con ${existingSitemapAnalysis.urlCount} URLs.`
                : existingSitemapAnalysis.found
                    ? `Se detectó un sitemap pero tiene problemas. Se generó uno optimizado con ${crawledUrls.size} URLs.`
                    : `No se encontró sitemap. Se generó uno nuevo con ${crawledUrls.size} URLs válidas.`,
            sitemap: sitemapXml,
            downloadUrl,
            stats: {
                totalUrls: crawledUrls.size,
                internalUrls: crawledUrls.size,
                externalUrls: 0,
                imageUrls: 0,
                videoUrls: 0,
                processingTime,
                depth: config.depth || 3
            },
            existingSitemap: {
                found: existingSitemapAnalysis.found,
                valid: existingSitemapAnalysis.valid,
                urlCount: existingSitemapAnalysis.urlCount,
                issues: existingSitemapAnalysis.issues
            }
        };
        // Guardar en base de datos
        yield saveSitemapAnalysis(authReq.user.id, sanitizedUrl, result, config);
        // Guardar en cache (30 minutos)
        cache_1.cache.set(cacheKey, result, 30);
        res.json(Object.assign({ success: true }, result));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error inesperado';
        console.error('❌ Error generando sitemap:', message);
        const processingTime = Date.now() - startTime;
        // Guardar error en base de datos
        try {
            yield saveSitemapAnalysis(authReq.user.id, config.url, {
                status: 'error',
                message: `Error al procesar: ${message}`,
                stats: {
                    totalUrls: 0,
                    internalUrls: 0,
                    externalUrls: 0,
                    imageUrls: 0,
                    videoUrls: 0,
                    processingTime,
                    depth: config.depth || 3
                }
            }, config);
        }
        catch (dbError) {
            console.error('Error guardando error en BD:', dbError);
        }
        res.status(500).json({
            success: false,
            error: 'No se pudo generar el sitemap',
            details: message
        });
    }
}));
// Funciones auxiliares
function analyzeSitemap(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sitemapUrl = `${url}/sitemap.xml`;
            const response = yield axios_1.default.get(sitemapUrl, {
                timeout: 10000,
                headers: { 'User-Agent': (0, seoValidators_1.generateUserAgent)() }
            });
            const $ = cheerio.load(String(response.data), { xmlMode: true });
            const urls = $('urlset > url > loc');
            const issues = [];
            if (urls.length === 0) {
                issues.push('No se encontraron URLs en el sitemap');
            }
            // Validar estructura XML
            if (!$('urlset').length) {
                issues.push('Estructura XML inválida');
            }
            return {
                found: true,
                valid: issues.length === 0,
                urlCount: urls.length,
                issues,
                content: String(response.data)
            };
        }
        catch (error) {
            return {
                found: false,
                valid: false,
                urlCount: 0,
                issues: ['Sitemap no encontrado o inaccesible']
            };
        }
    });
}
function performDeepCrawl(startUrl, config, onProgress) {
    return __awaiter(this, void 0, void 0, function* () {
        const visited = new Set();
        const toVisit = [startUrl];
        const maxDepth = Math.min(config.depth || 3, 10);
        const maxUrls = Math.min(config.maxUrls || 1000, 5000);
        const origin = new URL(startUrl).origin;
        const userAgent = (0, seoValidators_1.generateUserAgent)();
        let currentDepth = 0;
        while (toVisit.length > 0 && visited.size < maxUrls && currentDepth < maxDepth) {
            const currentLevelUrls = [...toVisit];
            toVisit.length = 0;
            for (const url of currentLevelUrls) {
                if (visited.has(url) || visited.size >= maxUrls)
                    continue;
                try {
                    visited.add(url);
                    onProgress === null || onProgress === void 0 ? void 0 : onProgress(Math.min((visited.size / maxUrls) * 100, 100), url);
                    const response = yield axios_1.default.get(url, {
                        timeout: 10000,
                        headers: { 'User-Agent': userAgent },
                        validateStatus: (status) => status < 400
                    });
                    const $ = cheerio.load(String(response.data));
                    $('a[href]').each((_, el) => {
                        var _a;
                        const href = $(el).attr('href');
                        if (!href || href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('tel:'))
                            return;
                        let fullUrl;
                        try {
                            fullUrl = new URL(href, url).href.split('#')[0];
                        }
                        catch (_b) {
                            return;
                        }
                        // Solo URLs internas
                        if (fullUrl.startsWith(origin) && !visited.has(fullUrl)) {
                            // Verificar exclusiones
                            const path = new URL(fullUrl).pathname;
                            if ((_a = config.excludePaths) === null || _a === void 0 ? void 0 : _a.some(exclude => path.includes(exclude)))
                                return;
                            toVisit.push(fullUrl);
                        }
                    });
                    // Pequeña pausa para no sobrecargar el servidor
                    yield new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.warn(`Error crawling ${url}:`, error instanceof Error ? error.message : 'Unknown error');
                }
            }
            currentDepth++;
        }
        return visited;
    });
}
function generateSitemapXML(urls, config) {
    const urlEntries = Array.from(urls).map(url => {
        let entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        return entry;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
function saveSitemapFile(sitemapXml) {
    return __awaiter(this, void 0, void 0, function* () {
        const sitemapDir = (0, path_1.join)(__dirname, '../../public/sitemaps');
        if (!(0, fs_1.existsSync)(sitemapDir)) {
            (0, fs_1.mkdirSync)(sitemapDir, { recursive: true });
        }
        const fileId = (0, uuid_1.v4)();
        const filePath = (0, path_1.join)(sitemapDir, `${fileId}.xml`);
        (0, fs_1.writeFileSync)(filePath, sitemapXml);
        return `/sitemaps/${fileId}.xml`;
    });
}
function saveSitemapAnalysis(userId, url, result, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, connect_1.connectDB)();
            yield SitemapAnalysis_1.default.create({
                userId,
                url,
                status: result.status,
                message: result.message,
                sitemap: result.sitemap,
                downloadUrl: result.downloadUrl,
                metadata: Object.assign(Object.assign({}, result.stats), { config: {
                        depth: config.depth,
                        includeImages: config.includeImages,
                        includeVideos: config.includeVideos,
                        excludePaths: config.excludePaths,
                        maxUrls: config.maxUrls
                    } })
            });
        }
        catch (error) {
            console.error('Error guardando análisis:', error);
            throw error;
        }
    });
}
// Ruta para obtener el historial de análisis del usuario
router.get('/history', seoAuth_1.requireSeoAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authReq = req;
    try {
        yield (0, connect_1.connectDB)();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const skip = (page - 1) * limit;
        const analyses = yield SitemapAnalysis_1.default.find({ userId: authReq.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
        const total = yield SitemapAnalysis_1.default.countDocuments({ userId: authReq.user.id });
        res.json({
            success: true,
            analyses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el historial'
        });
    }
}));
// Ruta para obtener estadísticas del usuario
router.get('/stats', seoAuth_1.requireSeoAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authReq = req;
    try {
        yield (0, connect_1.connectDB)();
        const monthlyCount = yield SitemapAnalysis_1.default.getMonthlyCount(authReq.user.id);
        const stats = yield SitemapAnalysis_1.default.getStats(authReq.user.id);
        res.json({
            success: true,
            monthlyAnalyses: monthlyCount,
            totalStats: stats[0] || {
                total: 0,
                successful: 0,
                failed: 0,
                avgProcessingTime: 0
            },
            planLimits: authReq.user.planLimits
        });
    }
    catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las estadísticas'
        });
    }
}));
exports.default = router;

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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const basicScraper_1 = require("../../audit/basicScraper");
const headlessScraper_1 = require("../../audit/headlessScraper");
const cache_1 = require("../../utils/cache");
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url = '', mode = 'basic' } = req.query;
    if (!url) {
        res.status(400).json({ error: 'URL es requerida para realizar la auditoría' });
        return;
    }
    // Validar URL
    try {
        new URL(url);
    }
    catch (_a) {
        res.status(400).json({ error: 'URL inválida. Asegúrate de incluir http:// o https://' });
        return;
    }
    const startTime = Date.now();
    // Generar clave de cache
    const cacheKey = (0, cache_1.generateCacheKey)('audit', { url: url, mode: mode });
    // Verificar cache
    const cachedResult = cache_1.cache.get(cacheKey);
    if (cachedResult) {
        console.log(`Cache hit for auditor: ${url}`);
        res.json(Object.assign(Object.assign({}, cachedResult), { metadata: Object.assign(Object.assign({}, cachedResult.metadata), { fromCache: true }) }));
        return;
    }
    try {
        const data = mode === 'deep'
            ? yield (0, headlessScraper_1.deepAudit)(url)
            : yield (0, basicScraper_1.basicAudit)(url);
        const processingTime = Date.now() - startTime;
        const result = Object.assign(Object.assign({}, data), { metadata: {
                processingTime,
                mode: mode,
                url: url,
                fromCache: false
            } });
        // Guardar en cache (15 minutos para auditorías)
        cache_1.cache.set(cacheKey, result, 15);
        res.json(result);
    }
    catch (err) {
        const processingTime = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor';
        console.error(`[AUDIT ERROR] ${mode} audit failed for ${url}:`, errorMessage);
        res.status(500).json({
            error: 'Error realizando auditoría SEO',
            details: errorMessage,
            metadata: {
                processingTime,
                mode: mode,
                url: url
            }
        });
    }
}));
exports.default = router;

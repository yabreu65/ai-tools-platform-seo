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
const express_1 = __importDefault(require("express"));
const scrapePage_1 = require("../../services/scrapePage");
const googleSuggest_1 = require("../../services/googleSuggest");
const cache_1 = require("../../utils/cache");
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const url = req.query.url;
    const query = req.query.query;
    if (!url && !query) {
        res.status(400).json({ error: 'Se requiere una URL o una palabra clave' });
        return;
    }
    // Generar clave de cache
    const cacheKey = (0, cache_1.generateCacheKey)('keywords', { url: url || '', query: query || '' });
    // Verificar cache
    const cachedResult = cache_1.cache.get(cacheKey);
    if (cachedResult) {
        console.log(`Cache hit for keywords: ${url || query}`);
        res.json(Object.assign(Object.assign({}, cachedResult), { fromCache: true }));
        return;
    }
    try {
        const startTime = Date.now();
        const [fromPage, suggested] = yield Promise.allSettled([
            url ? (0, scrapePage_1.scrapeKeywordsFromPage)(url) : Promise.resolve([]),
            query ? (0, googleSuggest_1.getGoogleSuggestions)(query) : Promise.resolve([])
        ]);
        const processingTime = Date.now() - startTime;
        const result = {
            fromPage: fromPage.status === 'fulfilled' ? fromPage.value : [],
            suggested: suggested.status === 'fulfilled' ? suggested.value : [],
            metadata: {
                processingTime,
                errors: [
                    ...(fromPage.status === 'rejected' ? [`Error scraping page: ${((_a = fromPage.reason) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error'}`] : []),
                    ...(suggested.status === 'rejected' ? [`Error getting suggestions: ${((_b = suggested.reason) === null || _b === void 0 ? void 0 : _b.message) || 'Unknown error'}`] : [])
                ]
            }
        };
        // Guardar en cache (20 minutos para keywords)
        cache_1.cache.set(cacheKey, result, 20);
        res.json(result);
    }
    catch (error) {
        console.error('[KEYWORDS SCRAPER ERROR]', error);
        res.status(500).json({
            error: 'Error procesando keywords',
            details: error.message || 'Error interno',
            fromPage: [],
            suggested: []
        });
    }
}));
exports.default = router;

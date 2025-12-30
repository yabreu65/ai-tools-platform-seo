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
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const url = req.query.url;
    const strategy = req.query.strategy || 'mobile';
    if (!url) {
        res.status(400).json({ error: 'URL es requerida para analizar Core Web Vitals' });
        return;
    }
    // Validar URL
    try {
        new URL(url);
    }
    catch (_j) {
        res.status(400).json({ error: 'URL inválida. Asegúrate de incluir http:// o https://' });
        return;
    }
    if (!process.env.PAGESPEED_API_KEY) {
        res.status(500).json({ error: 'API key de PageSpeed no configurada' });
        return;
    }
    const startTime = Date.now();
    try {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
        const response = yield axios_1.default.get(apiUrl, {
            params: {
                url,
                category: 'performance',
                strategy,
                key: process.env.PAGESPEED_API_KEY
            },
            timeout: 30000 // 30 segundos timeout
        });
        const lighthouse = response.data.lighthouseResult;
        const audits = lighthouse.audits;
        const processingTime = Date.now() - startTime;
        // Verificar que los audits existan
        if (!audits) {
            throw new Error('No se pudieron obtener los datos de auditoría');
        }
        const result = {
            lcp: ((_a = audits['largest-contentful-paint']) === null || _a === void 0 ? void 0 : _a.numericValue) ?
                audits['largest-contentful-paint'].numericValue / 1000 : null,
            cls: ((_b = audits['cumulative-layout-shift']) === null || _b === void 0 ? void 0 : _b.numericValue) || null,
            inp: ((_c = audits['interactive']) === null || _c === void 0 ? void 0 : _c.numericValue) || null,
            score: ((_e = (_d = lighthouse.categories) === null || _d === void 0 ? void 0 : _d.performance) === null || _e === void 0 ? void 0 : _e.score) ?
                Math.round(lighthouse.categories.performance.score * 100) : null,
            metadata: {
                processingTime,
                strategy,
                url
            }
        };
        res.json(result);
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        let errorMessage = 'No se pudo analizar la URL';
        if (((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) === 400) {
            errorMessage = 'URL inválida o no accesible para PageSpeed Insights';
        }
        else if (((_g = error.response) === null || _g === void 0 ? void 0 : _g.status) === 403) {
            errorMessage = 'API key inválida o límite de cuota excedido';
        }
        else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Timeout: La análisis tardó demasiado tiempo';
        }
        console.error('Error al obtener datos de PageSpeed:', {
            url,
            error: error.message,
            status: (_h = error.response) === null || _h === void 0 ? void 0 : _h.status
        });
        res.status(500).json({
            error: errorMessage,
            details: error.message,
            metadata: {
                processingTime,
                strategy,
                url
            }
        });
    }
}));
exports.default = router;

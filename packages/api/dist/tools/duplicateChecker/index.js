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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const natural_1 = __importDefault(require("natural"));
const cosine_similarity_1 = __importDefault(require("cosine-similarity"));
const dotenv_1 = __importDefault(require("dotenv"));
const torScraper_1 = require("../../services/torScraper"); // ⚠️ Reemplazá con la ruta real
dotenv_1.default.config();
const router = express_1.default.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
function limpiarTexto(texto) {
    return texto
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúüñ\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function calcularSimilitud(textoA, textoB) {
    const TfIdf = natural_1.default.TfIdf;
    const tfidf = new TfIdf();
    tfidf.addDocument(textoA);
    tfidf.addDocument(textoB);
    const vocabulary = new Set();
    tfidf.listTerms(0).forEach(item => vocabulary.add(item.term));
    tfidf.listTerms(1).forEach(item => vocabulary.add(item.term));
    const vectorA = [];
    const vectorB = [];
    vocabulary.forEach(term => {
        vectorA.push(tfidf.tfidf(term, 0));
        vectorB.push(tfidf.tfidf(term, 1));
    });
    return (0, cosine_similarity_1.default)(vectorA, vectorB);
}
function extraerTextoVisible(html) {
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, head, meta, link').remove();
    return limpiarTexto($('body').text());
}
function obtenerFraseClave(texto) {
    return texto.split('.').slice(0, 2).join('. ').slice(0, 200);
}
function obtenerTextoDesdeURL(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const html = yield axios_1.default.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
            });
            return extraerTextoVisible(html.data);
        }
        catch (axiosError) {
            console.warn(`Axios falló para ${url}, intentando con Tor...`);
            try {
                const $ = yield (0, torScraper_1.scrapeWithTor)(url);
                if ($) {
                    $('script, style, noscript, iframe, head, meta, link').remove();
                    return limpiarTexto($('body').text());
                }
            }
            catch (torError) {
                console.error(`Tor también falló para ${url}`);
            }
            return null;
        }
    });
}
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { texto, idioma = 'lang_es' } = req.body;
    if (!texto) {
        res.status(400).json({ error: 'Falta el texto a verificar.' });
        return;
    }
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
        res.status(500).json({ error: 'Faltan claves de API de Google.' });
        return;
    }
    try {
        const cleanText = limpiarTexto(texto);
        const query = obtenerFraseClave(cleanText);
        const response = yield axios_1.default.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CX,
                q: query,
                lr: idioma,
                num: 10,
            },
        });
        const resultados = yield Promise.all((response.data.items || []).map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const textFromPage = yield obtenerTextoDesdeURL(item.link);
            if (!textFromPage)
                return null;
            const score = calcularSimilitud(cleanText, textFromPage);
            return { url: item.link, score: Number(score.toFixed(2)) };
        })));
        const duplicados = resultados.filter(Boolean).filter(r => r.score >= 0.3);
        if (duplicados.length === 0) {
            res.json({ original: texto, duplicados: [{ url: 'Ningún resultado relevante encontrado.', score: 0 }] });
        }
        else {
            res.json({ original: texto, duplicados });
        }
    }
    catch (err) {
        console.error('[DUPLICATE CHECK ERROR]', err);
        res.status(500).json({ error: err.message || 'Error interno' });
    }
}));
exports.default = router;

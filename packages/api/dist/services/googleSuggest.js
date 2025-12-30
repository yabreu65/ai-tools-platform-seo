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
exports.getGoogleSuggestions = getGoogleSuggestions;
const axios_1 = __importDefault(require("axios"));
const torScraper_1 = require("./torScraper");
function getGoogleSuggestions(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://suggestqueries.google.com/complete/search';
        const params = {
            client: 'firefox',
            hl: 'es',
            gl: 'AR',
            q: query,
        };
        try {
            const response = yield axios_1.default.get(url, { params });
            return response.data[1] || [];
        }
        catch (error) {
            console.warn('[SUGGESTIONS FALLBACK A TOR] Usando Puppeteer...');
            return yield getSuggestionsWithTor(query);
        }
    });
}
function getSuggestionsWithTor(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=AR&q=${encodeURIComponent(query)}`;
        const $ = yield (0, torScraper_1.scrapeWithTor)(url);
        if (!$)
            return [];
        // Google devuelve JS o JSON embebido, así que parseamos desde el body
        const texto = $('body').text();
        try {
            const parsed = JSON.parse(texto);
            return parsed[1] || [];
        }
        catch (_a) {
            console.error('[ERROR] No se pudo parsear sugerencias con Tor');
            return [];
        }
    });
}

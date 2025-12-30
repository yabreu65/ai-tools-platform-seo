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
exports.scrapeKeywordsFromPage = scrapeKeywordsFromPage;
const torScraper_1 = require("./torScraper");
// Palabras comunes que eliminamos
const stopwords = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'por', 'con', 'las',
    'para', 'es', 'una', 'al', 'como', 'más', 'sus', 'le', 'ya', 'o', 'fue',
    'que', 'un', 'su', 'no', 'sí', 'ha', 'lo', 'este', 'pero', 'entre', 'también'
]);
function limpiarTexto(texto) {
    return texto
        .toLowerCase()
        .replace(/[^a-záéíóúñü\s]/gi, '')
        .split(/\s+/)
        .filter(p => p.length > 2 && !stopwords.has(p));
}
function scrapeKeywordsFromPage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield (0, torScraper_1.scrapeWithTor)(url);
        if (!$)
            return [];
        let texto = '';
        $('title, meta[name=description], h1, h2, h3, p, a, strong').each((_, el) => {
            texto += ' ' + $(el).text();
        });
        const palabras = limpiarTexto(texto);
        const frecuencia = {};
        palabras.forEach(word => {
            frecuencia[word] = (frecuencia[word] || 0) + 1;
        });
        return Object.entries(frecuencia)
            .map(([word, count]) => ({ keyword: word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 25);
    });
}

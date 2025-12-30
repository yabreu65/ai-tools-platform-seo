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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playwright_1 = require("playwright");
const cheerio = __importStar(require("cheerio"));
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'Falta la URL' });
        return;
    }
    try {
        const browser = yield playwright_1.chromium.launch();
        const page = yield browser.newPage();
        yield page.goto(url, { waitUntil: 'networkidle' });
        yield page.waitForTimeout(5000);
        const html = yield page.content();
        yield browser.close();
        const $ = cheerio.load(html);
        const title = $('title').text() || null;
        const metaDescription = $('meta[name="description"]').attr('content') || null;
        const h1 = $('h1').first().text() || null;
        let texto = '';
        $('h1, h2, h3, p, li, a, strong').each((_, el) => {
            texto += ' ' + $(el).text();
        });
        const palabras = texto
            .toLowerCase()
            .replace(/[^a-záéíóúñü\s]/gi, '')
            .split(/\s+/)
            .filter(p => p.length > 2);
        const wordCount = palabras.length;
        const frecuencia = {};
        palabras.forEach(p => {
            frecuencia[p] = (frecuencia[p] || 0) + 1;
        });
        const densidad = Object.entries(frecuencia)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((acc, [word, count]) => {
            acc[word] = count;
            return acc;
        }, {});
        const imagenesSinAlt = $('img:not([alt]), img[alt=""]').length;
        const sugerencias = [];
        if (!title || title.length < 30)
            sugerencias.push('Agregá o ampliá el título SEO (ideal entre 50 y 60 caracteres).');
        if (!metaDescription)
            sugerencias.push('Falta la meta descripción. Añadila para mejorar el CTR.');
        if (!h1)
            sugerencias.push('No se encontró un encabezado H1.');
        if (wordCount < 300)
            sugerencias.push('El contenido es muy corto. Considerá expandirlo para mayor relevancia.');
        if (imagenesSinAlt > 0)
            sugerencias.push(`Se detectaron ${imagenesSinAlt} imagen(es) sin atributo ALT.`);
        res.json({
            title,
            metaDescription,
            h1,
            wordCount,
            keywordDensity: densidad,
            imagenesSinAlt,
            sugerencias,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado';
        console.error('❌ Error en optimizador profundo:', message);
        res.status(500).json({ error: 'No se pudo analizar el contenido con Playwright' });
    }
}));
exports.default = router;

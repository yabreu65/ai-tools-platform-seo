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
const torScraper_1 = require("../../services/torScraper"); // ⚠️ Reemplazá con la ruta correcta
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'Falta la URL' });
        return;
    }
    try {
        const $ = yield (0, torScraper_1.scrapeWithTor)(url);
        if (!$)
            throw new Error('No se pudo obtener el contenido');
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
        console.error('❌ Error en optimizador:', message);
        res.status(500).json({ error: 'No se pudo analizar el contenido' });
    }
}));
exports.default = router;

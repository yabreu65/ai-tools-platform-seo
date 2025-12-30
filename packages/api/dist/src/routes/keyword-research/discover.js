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
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Schema de validación para el descubrimiento de keywords
const discoverSchema = zod_1.z.object({
    seed_keywords: zod_1.z.array(zod_1.z.string()).min(1, 'Al menos una keyword es requerida'),
    country: zod_1.z.string().default('US'),
    language: zod_1.z.string().default('en'),
    include_related: zod_1.z.boolean().default(true),
    include_longtail: zod_1.z.boolean().default(true),
    include_questions: zod_1.z.boolean().default(true),
    min_volume: zod_1.z.number().min(0).default(0),
    max_volume: zod_1.z.number().optional(),
    min_difficulty: zod_1.z.number().min(0).max(100).default(0),
    max_difficulty: zod_1.z.number().min(0).max(100).default(100),
    search_intent: zod_1.z.enum(['all', 'informational', 'navigational', 'commercial', 'transactional']).default('all'),
    limit: zod_1.z.number().min(1).max(1000).default(100)
});
// Simulación de datos de keywords
const generateKeywordData = (keyword, type = 'seed') => {
    const baseVolume = Math.floor(Math.random() * 100000) + 1000;
    const difficulty = Math.floor(Math.random() * 100) + 1;
    const cpc = Math.round((Math.random() * 10 + 0.1) * 100) / 100;
    const competition = Math.round(Math.random() * 100) / 100;
    // Generar tendencia de 12 meses
    const trend = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 1);
    // Intención de búsqueda basada en patrones
    let searchIntent = 'informational';
    if (keyword.includes('buy') || keyword.includes('price') || keyword.includes('cost')) {
        searchIntent = 'commercial';
    }
    else if (keyword.includes('how to') || keyword.includes('what is') || keyword.includes('guide')) {
        searchIntent = 'informational';
    }
    else if (keyword.includes('login') || keyword.includes('download') || keyword.includes('free')) {
        searchIntent = 'navigational';
    }
    else if (keyword.includes('best') || keyword.includes('review') || keyword.includes('vs')) {
        searchIntent = 'commercial';
    }
    // SERP features simuladas
    const allSerpFeatures = [
        'featured_snippet', 'people_also_ask', 'local_pack', 'knowledge_panel',
        'image_pack', 'video_carousel', 'shopping_results', 'reviews', 'sitelinks'
    ];
    const serpFeatures = allSerpFeatures
        .filter(() => Math.random() > 0.7)
        .slice(0, Math.floor(Math.random() * 4) + 1);
    // Competidores simulados
    const competitors = [
        'competitor1.com', 'competitor2.com', 'competitor3.com',
        'bigsite.com', 'authority.org', 'industry-leader.net'
    ].slice(0, Math.floor(Math.random() * 4) + 2);
    return {
        keyword,
        search_volume: baseVolume,
        keyword_difficulty: difficulty,
        cpc,
        competition,
        search_intent: searchIntent,
        trend,
        related_keywords: generateRelatedKeywords(keyword, 5),
        serp_features: serpFeatures,
        top_competitors: competitors
    };
};
const generateRelatedKeywords = (baseKeyword, count) => {
    const prefixes = ['best', 'free', 'top', 'how to', 'what is', 'guide to'];
    const suffixes = ['tool', 'software', 'app', 'service', 'platform', 'solution', 'guide', 'tutorial'];
    const modifiers = ['online', 'professional', 'advanced', 'simple', 'powerful', 'effective'];
    const related = [];
    const baseWords = baseKeyword.split(' ');
    for (let i = 0; i < count; i++) {
        let newKeyword = '';
        const rand = Math.random();
        if (rand < 0.3) {
            // Agregar prefijo
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            newKeyword = `${prefix} ${baseKeyword}`;
        }
        else if (rand < 0.6) {
            // Agregar sufijo
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            newKeyword = `${baseKeyword} ${suffix}`;
        }
        else if (rand < 0.8) {
            // Agregar modificador
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            newKeyword = `${modifier} ${baseKeyword}`;
        }
        else {
            // Variación de palabras
            const newWords = [...baseWords];
            if (newWords.length > 1) {
                newWords[Math.floor(Math.random() * newWords.length)] =
                    suffixes[Math.floor(Math.random() * suffixes.length)];
            }
            newKeyword = newWords.join(' ');
        }
        if (!related.includes(newKeyword) && newKeyword !== baseKeyword) {
            related.push(newKeyword);
        }
    }
    return related;
};
const generateLongTailKeywords = (baseKeyword, count) => {
    const longTailPrefixes = [
        'how to use', 'what is the best', 'where to find', 'when to use',
        'why choose', 'how much does', 'what are the benefits of', 'how to get started with'
    ];
    const longTailSuffixes = [
        'for beginners', 'step by step', 'complete guide', 'tutorial',
        'tips and tricks', 'best practices', 'comparison', 'review'
    ];
    const suggestions = [];
    for (let i = 0; i < count; i++) {
        let keyword = '';
        const rand = Math.random();
        if (rand < 0.5) {
            const prefix = longTailPrefixes[Math.floor(Math.random() * longTailPrefixes.length)];
            keyword = `${prefix} ${baseKeyword}`;
        }
        else {
            const suffix = longTailSuffixes[Math.floor(Math.random() * longTailSuffixes.length)];
            keyword = `${baseKeyword} ${suffix}`;
        }
        const volume = Math.floor(Math.random() * 5000) + 100; // Menor volumen para long-tail
        const difficulty = Math.floor(Math.random() * 50) + 10; // Menor dificultad
        suggestions.push({
            keyword,
            type: 'longtail',
            search_volume: volume,
            keyword_difficulty: difficulty,
            cpc: Math.round((Math.random() * 5 + 0.1) * 100) / 100,
            competition: Math.round(Math.random() * 50) / 100,
            search_intent: 'informational',
            parent_keyword: baseKeyword
        });
    }
    return suggestions;
};
const generateQuestionKeywords = (baseKeyword, count) => {
    const questionStarters = [
        'what is', 'how to', 'why does', 'when should', 'where can',
        'which is', 'who uses', 'how much', 'what are', 'how do'
    ];
    const questionEndings = [
        'work', 'help', 'cost', 'compare', 'choose', 'use', 'find', 'get', 'do', 'make'
    ];
    const suggestions = [];
    for (let i = 0; i < count; i++) {
        const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
        const ending = questionEndings[Math.floor(Math.random() * questionEndings.length)];
        let keyword = '';
        if (starter.includes('what') || starter.includes('which')) {
            keyword = `${starter} ${baseKeyword}`;
        }
        else {
            keyword = `${starter} ${baseKeyword} ${ending}`;
        }
        const volume = Math.floor(Math.random() * 3000) + 50; // Menor volumen para preguntas
        const difficulty = Math.floor(Math.random() * 40) + 5; // Menor dificultad
        suggestions.push({
            keyword,
            type: 'question',
            search_volume: volume,
            keyword_difficulty: difficulty,
            cpc: Math.round((Math.random() * 3 + 0.05) * 100) / 100,
            competition: Math.round(Math.random() * 30) / 100,
            search_intent: 'informational',
            parent_keyword: baseKeyword
        });
    }
    return suggestions;
};
// POST /api/keyword-research/discover
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = discoverSchema.parse(req.body);
        const { seed_keywords, country, language, include_related, include_longtail, include_questions, min_volume, max_volume, min_difficulty, max_difficulty, search_intent, limit } = validatedData;
        // Simular tiempo de procesamiento
        yield new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        const results = [];
        // Procesar cada keyword semilla
        for (const seedKeyword of seed_keywords) {
            // Agregar keyword principal
            const mainKeywordData = generateKeywordData(seedKeyword, 'seed');
            results.push({
                keyword: seedKeyword,
                type: 'related',
                search_volume: mainKeywordData.search_volume,
                keyword_difficulty: mainKeywordData.keyword_difficulty,
                cpc: mainKeywordData.cpc,
                competition: mainKeywordData.competition,
                search_intent: mainKeywordData.search_intent
            });
            // Generar keywords relacionadas
            if (include_related) {
                const relatedKeywords = generateRelatedKeywords(seedKeyword, 15);
                for (const relatedKeyword of relatedKeywords) {
                    const keywordData = generateKeywordData(relatedKeyword, 'related');
                    results.push({
                        keyword: relatedKeyword,
                        type: 'related',
                        search_volume: keywordData.search_volume,
                        keyword_difficulty: keywordData.keyword_difficulty,
                        cpc: keywordData.cpc,
                        competition: keywordData.competition,
                        search_intent: keywordData.search_intent,
                        parent_keyword: seedKeyword
                    });
                }
            }
            // Generar long-tail keywords
            if (include_longtail) {
                const longTailKeywords = generateLongTailKeywords(seedKeyword, 10);
                results.push(...longTailKeywords);
            }
            // Generar preguntas
            if (include_questions) {
                const questionKeywords = generateQuestionKeywords(seedKeyword, 8);
                results.push(...questionKeywords);
            }
        }
        // Aplicar filtros
        let filteredResults = results.filter(keyword => {
            // Filtro de volumen
            if (keyword.search_volume < min_volume)
                return false;
            if (max_volume && keyword.search_volume > max_volume)
                return false;
            // Filtro de dificultad
            if (keyword.keyword_difficulty < min_difficulty)
                return false;
            if (keyword.keyword_difficulty > max_difficulty)
                return false;
            // Filtro de intención de búsqueda
            if (search_intent !== 'all' && keyword.search_intent !== search_intent)
                return false;
            return true;
        });
        // Ordenar por volumen de búsqueda (descendente)
        filteredResults.sort((a, b) => b.search_volume - a.search_volume);
        // Aplicar límite
        filteredResults = filteredResults.slice(0, limit);
        // Calcular estadísticas
        const stats = {
            total_keywords: filteredResults.length,
            avg_volume: Math.round(filteredResults.reduce((sum, kw) => sum + kw.search_volume, 0) / filteredResults.length),
            avg_difficulty: Math.round(filteredResults.reduce((sum, kw) => sum + kw.keyword_difficulty, 0) / filteredResults.length),
            avg_cpc: Math.round(filteredResults.reduce((sum, kw) => sum + kw.cpc, 0) / filteredResults.length * 100) / 100,
            intent_distribution: {
                informational: filteredResults.filter(kw => kw.search_intent === 'informational').length,
                commercial: filteredResults.filter(kw => kw.search_intent === 'commercial').length,
                navigational: filteredResults.filter(kw => kw.search_intent === 'navigational').length,
                transactional: filteredResults.filter(kw => kw.search_intent === 'transactional').length
            },
            type_distribution: {
                related: filteredResults.filter(kw => kw.type === 'related').length,
                longtail: filteredResults.filter(kw => kw.type === 'longtail').length,
                question: filteredResults.filter(kw => kw.type === 'question').length
            }
        };
        // Generar insights automáticos
        const insights = [];
        if (stats.avg_difficulty > 70) {
            insights.push({
                type: 'warning',
                message: 'Las keywords encontradas tienen alta dificultad promedio. Considera enfocarte en long-tail keywords.',
                action: 'Filtrar por dificultad menor a 50'
            });
        }
        if (stats.intent_distribution.informational > stats.total_keywords * 0.7) {
            insights.push({
                type: 'info',
                message: 'La mayoría de keywords son informacionales. Considera crear contenido educativo.',
                action: 'Desarrollar guías y tutoriales'
            });
        }
        if (stats.type_distribution.longtail > stats.total_keywords * 0.4) {
            insights.push({
                type: 'success',
                message: 'Buena cantidad de long-tail keywords encontradas. Estas suelen tener menor competencia.',
                action: 'Priorizar long-tail keywords para contenido específico'
            });
        }
        res.json({
            success: true,
            data: {
                keywords: filteredResults,
                stats,
                insights,
                search_params: {
                    seed_keywords,
                    country,
                    language,
                    filters_applied: {
                        min_volume,
                        max_volume,
                        min_difficulty,
                        max_difficulty,
                        search_intent
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Error en keyword discovery:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
exports.default = router;

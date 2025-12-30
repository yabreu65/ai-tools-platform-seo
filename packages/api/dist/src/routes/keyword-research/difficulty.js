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
// Schema de validación para análisis de dificultad
const difficultySchema = zod_1.z.object({
    keywords: zod_1.z.array(zod_1.z.string()).min(1, 'Al menos una keyword es requerida').max(50, 'Máximo 50 keywords por análisis'),
    country: zod_1.z.string().default('US'),
    language: zod_1.z.string().default('en'),
    device: zod_1.z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
    include_serp_analysis: zod_1.z.boolean().default(true),
    include_competitor_analysis: zod_1.z.boolean().default(true),
    include_opportunities: zod_1.z.boolean().default(true)
});
// Función para calcular dificultad de keyword
const calculateKeywordDifficulty = (keyword) => {
    // Simulación de cálculo de dificultad basado en varios factores
    let difficulty = 0;
    // Factor 1: Longitud de la keyword (keywords más largas = menor dificultad)
    const wordCount = keyword.split(' ').length;
    if (wordCount === 1)
        difficulty += 30;
    else if (wordCount === 2)
        difficulty += 20;
    else if (wordCount === 3)
        difficulty += 10;
    else
        difficulty += 5;
    // Factor 2: Términos comerciales
    const commercialTerms = ['buy', 'price', 'cost', 'cheap', 'discount', 'deal', 'sale'];
    const hasCommercialTerms = commercialTerms.some(term => keyword.toLowerCase().includes(term));
    if (hasCommercialTerms)
        difficulty += 25;
    // Factor 3: Términos competitivos
    const competitiveTerms = ['best', 'top', 'review', 'comparison', 'vs'];
    const hasCompetitiveTerms = competitiveTerms.some(term => keyword.toLowerCase().includes(term));
    if (hasCompetitiveTerms)
        difficulty += 20;
    // Factor 4: Términos técnicos (menor dificultad para nichos específicos)
    const technicalTerms = ['api', 'sdk', 'integration', 'tutorial', 'guide'];
    const hasTechnicalTerms = technicalTerms.some(term => keyword.toLowerCase().includes(term));
    if (hasTechnicalTerms)
        difficulty -= 10;
    // Factor 5: Variación aleatoria para simular factores del mercado
    difficulty += Math.floor(Math.random() * 30);
    // Asegurar que esté en el rango 1-100
    return Math.max(1, Math.min(100, difficulty));
};
// Función para generar resultados SERP simulados
const generateSerpResults = (keyword, count = 10) => {
    const domains = [
        'wikipedia.org', 'stackoverflow.com', 'github.com', 'medium.com', 'dev.to',
        'techcrunch.com', 'mashable.com', 'wired.com', 'ahrefs.com', 'semrush.com',
        'moz.com', 'searchengineland.com', 'hubspot.com', 'neil-patel.com'
    ];
    const results = [];
    for (let i = 0; i < count; i++) {
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const domainAuthority = Math.floor(Math.random() * 40) + 60; // DA entre 60-100 para top results
        const pageAuthority = Math.floor(Math.random() * 30) + 40; // PA entre 40-70
        // SERP features más comunes en posiciones altas
        const possibleFeatures = ['sitelinks', 'reviews', 'faq', 'breadcrumbs'];
        const serpFeatures = possibleFeatures.filter(() => Math.random() > 0.7);
        results.push({
            position: i + 1,
            url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
            domain,
            title: `${keyword} - Complete Guide | ${domain.split('.')[0]}`,
            description: `Learn everything about ${keyword}. Comprehensive guide with examples, best practices, and expert insights.`,
            domain_authority: domainAuthority,
            page_authority: pageAuthority,
            backlinks: Math.floor(Math.random() * 10000) + 1000,
            referring_domains: Math.floor(Math.random() * 1000) + 100,
            content_length: Math.floor(Math.random() * 3000) + 1500,
            load_speed: Math.round((Math.random() * 2 + 1) * 100) / 100, // 1-3 segundos
            mobile_friendly: Math.random() > 0.1, // 90% mobile friendly
            https: Math.random() > 0.05, // 95% HTTPS
            serp_features: serpFeatures
        });
    }
    return results;
};
// Función para generar análisis de competidores
const generateCompetitorAnalysis = (keyword) => {
    const competitors = [
        'competitor1.com', 'competitor2.com', 'competitor3.com',
        'industry-leader.com', 'big-player.net', 'market-leader.org'
    ];
    return competitors.slice(0, 5).map(domain => ({
        domain,
        domain_authority: Math.floor(Math.random() * 30) + 50,
        avg_position: Math.floor(Math.random() * 15) + 1,
        total_keywords: Math.floor(Math.random() * 50000) + 10000,
        organic_traffic: Math.floor(Math.random() * 1000000) + 100000,
        content_gap_score: Math.floor(Math.random() * 100),
        backlink_gap_score: Math.floor(Math.random() * 100),
        technical_score: Math.floor(Math.random() * 100)
    }));
};
// Función para generar oportunidades
const generateOpportunities = (keyword, serpResults, difficulty) => {
    const contentOpportunities = [];
    const technicalOpportunities = [];
    const backlinkOpportunities = [];
    const serpOpportunities = [];
    // Análisis de contenido
    const avgContentLength = serpResults.reduce((sum, result) => sum + result.content_length, 0) / serpResults.length;
    if (avgContentLength > 2500) {
        contentOpportunities.push('Crear contenido extenso y detallado (+2500 palabras)');
    }
    contentOpportunities.push('Incluir ejemplos prácticos y casos de uso');
    contentOpportunities.push('Agregar infografías y elementos visuales');
    contentOpportunities.push('Optimizar para featured snippets');
    // Análisis técnico
    const mobileUnfriendly = serpResults.filter(r => !r.mobile_friendly).length;
    if (mobileUnfriendly > 2) {
        technicalOpportunities.push('Optimizar para dispositivos móviles');
    }
    const slowSites = serpResults.filter(r => r.load_speed > 2.5).length;
    if (slowSites > 3) {
        technicalOpportunities.push('Mejorar velocidad de carga del sitio');
    }
    technicalOpportunities.push('Implementar schema markup');
    technicalOpportunities.push('Optimizar Core Web Vitals');
    // Análisis de backlinks
    const avgBacklinks = serpResults.reduce((sum, result) => sum + result.backlinks, 0) / serpResults.length;
    if (avgBacklinks > 5000) {
        backlinkOpportunities.push('Desarrollar estrategia de link building agresiva');
    }
    else {
        backlinkOpportunities.push('Construir backlinks de calidad gradualmente');
    }
    backlinkOpportunities.push('Crear contenido linkeable (recursos, herramientas)');
    backlinkOpportunities.push('Outreach a sitios de la industria');
    // Análisis SERP
    const commonFeatures = serpResults.flatMap(r => r.serp_features);
    const featureCount = commonFeatures.reduce((acc, feature) => {
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
    }, {});
    if (featureCount['sitelinks'] > 3) {
        serpOpportunities.push('Optimizar estructura del sitio para sitelinks');
    }
    if (featureCount['faq'] > 2) {
        serpOpportunities.push('Crear sección de FAQ optimizada');
    }
    serpOpportunities.push('Optimizar para People Also Ask');
    serpOpportunities.push('Crear contenido para featured snippets');
    return {
        content_opportunities: contentOpportunities,
        technical_opportunities: technicalOpportunities,
        backlink_opportunities: backlinkOpportunities,
        serp_opportunities: serpOpportunities
    };
};
// Función para generar recomendaciones
const generateRecommendations = (keyword, difficulty, serpResults) => {
    let priority = 'medium';
    let effort = 'medium';
    let timeToRank = '6-12 meses';
    let successProbability = 50;
    // Determinar prioridad basada en dificultad
    if (difficulty < 30) {
        priority = 'high';
        effort = 'low';
        timeToRank = '2-4 meses';
        successProbability = 80;
    }
    else if (difficulty < 60) {
        priority = 'medium';
        effort = 'medium';
        timeToRank = '4-8 meses';
        successProbability = 60;
    }
    else {
        priority = 'low';
        effort = 'high';
        timeToRank = '8-18 meses';
        successProbability = 30;
    }
    const actionItems = [];
    // Acciones basadas en dificultad
    if (difficulty < 40) {
        actionItems.push('Crear contenido de alta calidad inmediatamente');
        actionItems.push('Optimizar on-page SEO básico');
        actionItems.push('Construir algunos backlinks de calidad');
    }
    else if (difficulty < 70) {
        actionItems.push('Investigar competidores en detalle');
        actionItems.push('Crear contenido superior al existente');
        actionItems.push('Desarrollar estrategia de link building');
        actionItems.push('Optimizar aspectos técnicos del sitio');
    }
    else {
        actionItems.push('Considerar keywords long-tail relacionadas');
        actionItems.push('Construir autoridad de dominio primero');
        actionItems.push('Crear contenido pillar extenso');
        actionItems.push('Desarrollar partnerships para backlinks');
    }
    return {
        priority,
        effort_required: effort,
        time_to_rank: timeToRank,
        success_probability: successProbability,
        action_items: actionItems
    };
};
// POST /api/keyword-research/difficulty/analyze
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = difficultySchema.parse(req.body);
        const { keywords, country, language, device, include_serp_analysis, include_competitor_analysis, include_opportunities } = validatedData;
        // Simular tiempo de procesamiento
        yield new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        const results = [];
        for (const keyword of keywords) {
            const difficulty = calculateKeywordDifficulty(keyword);
            // Determinar nivel de dificultad
            let difficultyLevel = 'medium';
            if (difficulty < 20)
                difficultyLevel = 'very_easy';
            else if (difficulty < 40)
                difficultyLevel = 'easy';
            else if (difficulty < 60)
                difficultyLevel = 'medium';
            else if (difficulty < 80)
                difficultyLevel = 'hard';
            else
                difficultyLevel = 'very_hard';
            // Generar datos básicos
            const searchVolume = Math.floor(Math.random() * 100000) + 1000;
            const cpc = Math.round((Math.random() * 10 + 0.1) * 100) / 100;
            const competition = Math.round(Math.random() * 100) / 100;
            // Determinar intención de búsqueda
            let searchIntent = 'informational';
            if (keyword.includes('buy') || keyword.includes('price'))
                searchIntent = 'commercial';
            else if (keyword.includes('how to') || keyword.includes('guide'))
                searchIntent = 'informational';
            else if (keyword.includes('login') || keyword.includes('download'))
                searchIntent = 'navigational';
            // Generar análisis SERP
            const serpResults = include_serp_analysis ? generateSerpResults(keyword) : [];
            const avgDA = serpResults.length > 0 ?
                Math.round(serpResults.reduce((sum, r) => sum + r.domain_authority, 0) / serpResults.length) : 0;
            const avgPA = serpResults.length > 0 ?
                Math.round(serpResults.reduce((sum, r) => sum + r.page_authority, 0) / serpResults.length) : 0;
            const avgBacklinks = serpResults.length > 0 ?
                Math.round(serpResults.reduce((sum, r) => sum + r.backlinks, 0) / serpResults.length) : 0;
            // SERP features
            const allSerpFeatures = serpResults.flatMap(r => r.serp_features);
            const uniqueSerpFeatures = [...new Set(allSerpFeatures)];
            // Análisis de contenido
            const avgContentLength = serpResults.length > 0 ?
                Math.round(serpResults.reduce((sum, r) => sum + r.content_length, 0) / serpResults.length) : 0;
            const commonTopics = [
                `${keyword} basics`, `${keyword} tutorial`, `${keyword} guide`,
                `${keyword} best practices`, `${keyword} examples`, `${keyword} tips`
            ];
            const contentGaps = [
                'Comparaciones detalladas', 'Casos de uso específicos', 'Tutoriales paso a paso',
                'Herramientas recomendadas', 'Métricas y KPIs', 'Tendencias futuras'
            ];
            // Generar análisis completo
            const analysis = {
                keyword,
                difficulty_score: difficulty,
                difficulty_level: difficultyLevel,
                search_volume: searchVolume,
                cpc,
                competition,
                search_intent: searchIntent,
                serp_analysis: {
                    top_results: serpResults,
                    avg_domain_authority: avgDA,
                    avg_page_authority: avgPA,
                    avg_backlinks: avgBacklinks,
                    serp_features: uniqueSerpFeatures,
                    content_analysis: {
                        avg_content_length: avgContentLength,
                        common_topics: commonTopics.slice(0, 4),
                        content_gaps: contentGaps.slice(0, 3)
                    }
                },
                competitor_analysis: include_competitor_analysis ? generateCompetitorAnalysis(keyword) : [],
                opportunities: include_opportunities ? generateOpportunities(keyword, serpResults, difficulty) : {
                    content_opportunities: [],
                    technical_opportunities: [],
                    backlink_opportunities: [],
                    serp_opportunities: []
                },
                recommendations: generateRecommendations(keyword, difficulty, serpResults)
            };
            results.push(analysis);
        }
        // Calcular estadísticas generales
        const stats = {
            total_keywords: results.length,
            avg_difficulty: Math.round(results.reduce((sum, r) => sum + r.difficulty_score, 0) / results.length),
            difficulty_distribution: {
                very_easy: results.filter(r => r.difficulty_level === 'very_easy').length,
                easy: results.filter(r => r.difficulty_level === 'easy').length,
                medium: results.filter(r => r.difficulty_level === 'medium').length,
                hard: results.filter(r => r.difficulty_level === 'hard').length,
                very_hard: results.filter(r => r.difficulty_level === 'very_hard').length
            },
            avg_search_volume: Math.round(results.reduce((sum, r) => sum + r.search_volume, 0) / results.length),
            high_priority_keywords: results.filter(r => r.recommendations.priority === 'high').length
        };
        // Generar insights
        const insights = [];
        if (stats.avg_difficulty > 70) {
            insights.push({
                type: 'warning',
                message: 'Las keywords analizadas tienen alta dificultad. Considera enfocarte en long-tail variations.',
                recommendation: 'Buscar keywords relacionadas con menor competencia'
            });
        }
        if (stats.high_priority_keywords > 0) {
            insights.push({
                type: 'success',
                message: `${stats.high_priority_keywords} keywords tienen alta prioridad y buenas oportunidades de ranking.`,
                recommendation: 'Priorizar estas keywords en tu estrategia de contenido'
            });
        }
        const easyKeywords = stats.difficulty_distribution.very_easy + stats.difficulty_distribution.easy;
        if (easyKeywords > results.length * 0.3) {
            insights.push({
                type: 'info',
                message: 'Buena cantidad de keywords con baja dificultad encontradas.',
                recommendation: 'Crear contenido para estas keywords primero para ganar momentum'
            });
        }
        res.json({
            success: true,
            data: {
                analyses: results,
                stats,
                insights,
                analysis_params: {
                    keywords,
                    country,
                    language,
                    device,
                    analysis_depth: {
                        serp_analysis: include_serp_analysis,
                        competitor_analysis: include_competitor_analysis,
                        opportunities: include_opportunities
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Error en análisis de dificultad:', error);
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

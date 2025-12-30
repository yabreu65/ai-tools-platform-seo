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
// Schema de validación para configuración de tracking
const trackingSetupSchema = zod_1.z.object({
    project_name: zod_1.z.string().min(1, 'Nombre del proyecto es requerido'),
    website_url: zod_1.z.string().url('URL del sitio web inválida'),
    keywords: zod_1.z.array(zod_1.z.string()).min(1, 'Al menos una keyword es requerida').max(100, 'Máximo 100 keywords por proyecto'),
    competitors: zod_1.z.array(zod_1.z.string().url()).max(10, 'Máximo 10 competidores').default([]),
    location: zod_1.z.string().default('United States'),
    language: zod_1.z.string().default('en'),
    device: zod_1.z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
    tracking_frequency: zod_1.z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    alerts_enabled: zod_1.z.boolean().default(true),
    alert_thresholds: zod_1.z.object({
        position_change: zod_1.z.number().min(1).max(50).default(5),
        visibility_change: zod_1.z.number().min(1).max(100).default(20),
        new_competitor: zod_1.z.boolean().default(true),
        serp_features: zod_1.z.boolean().default(true)
    }).default({})
});
// Schema para obtener datos de tracking
const trackingDataSchema = zod_1.z.object({
    project_id: zod_1.z.string().min(1, 'ID del proyecto es requerido'),
    date_range: zod_1.z.enum(['7d', '30d', '90d', '6m', '1y']).default('30d'),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    competitors: zod_1.z.array(zod_1.z.string()).optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['position', 'visibility', 'traffic', 'features'])).default(['position', 'visibility'])
});
// Función para generar datos históricos de ranking
const generateHistoricalRankingData = (keyword, days) => {
    var _a;
    const data = [];
    const now = new Date();
    // Posición inicial aleatoria
    let currentPosition = Math.floor(Math.random() * 50) + 1;
    // Determinar tendencia general
    const trendType = Math.random();
    let trendDirection = 0;
    if (trendType < 0.3)
        trendDirection = -0.1; // Mejorando (posición bajando)
    else if (trendType < 0.6)
        trendDirection = 0.1; // Empeorando
    // else estable
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        // Aplicar tendencia
        currentPosition += trendDirection;
        // Añadir volatilidad diaria
        const dailyChange = (Math.random() - 0.5) * 6; // ±3 posiciones
        currentPosition += dailyChange;
        // Mantener en rango válido
        currentPosition = Math.max(1, Math.min(100, currentPosition));
        const position = Math.round(currentPosition);
        const previousPosition = i === days - 1 ? null : ((_a = data[data.length - 1]) === null || _a === void 0 ? void 0 : _a.position) || null;
        const change = previousPosition ? position - previousPosition : 0;
        // SERP features (más probable en posiciones altas)
        const serpFeatures = [];
        if (position <= 3 && Math.random() > 0.7)
            serpFeatures.push('featured_snippet');
        if (position <= 5 && Math.random() > 0.8)
            serpFeatures.push('sitelinks');
        if (Math.random() > 0.9)
            serpFeatures.push('images');
        // Calcular visibility score (posición 1 = 100%, posición 10 = 10%, etc.)
        const visibilityScore = position <= 10 ? Math.round((11 - position) * 10) :
            position <= 20 ? Math.round((21 - position) * 2) : 0;
        // Estimar tráfico basado en posición y volumen de búsqueda
        const baseTraffic = Math.floor(Math.random() * 10000) + 1000; // Volumen base
        const ctrByPosition = position === 1 ? 0.3 : position <= 3 ? 0.15 : position <= 10 ? 0.05 : 0.01;
        const estimatedTraffic = Math.round(baseTraffic * ctrByPosition);
        data.push({
            date: date.toISOString().split('T')[0],
            position: position <= 100 ? position : null,
            previous_position: previousPosition,
            change,
            url: position <= 100 ? `https://example.com/${keyword.replace(/\s+/g, '-')}` : null,
            serp_features: serpFeatures,
            visibility_score: visibilityScore,
            estimated_traffic: estimatedTraffic
        });
    }
    return data;
};
// Función para generar tracking de keywords
const generateKeywordTracking = (keywords, days) => {
    return keywords.map(keyword => {
        const historicalData = generateHistoricalRankingData(keyword, days);
        const currentData = historicalData[historicalData.length - 1];
        const data7dAgo = historicalData[Math.max(0, historicalData.length - 8)];
        const data30dAgo = historicalData[Math.max(0, historicalData.length - 31)];
        // Calcular métricas
        const positions = historicalData.map(d => d.position).filter(p => p !== null);
        const bestPosition = positions.length > 0 ? Math.min(...positions) : null;
        const worstPosition = positions.length > 0 ? Math.max(...positions) : null;
        const avgPosition = positions.length > 0 ?
            Math.round(positions.reduce((sum, pos) => sum + pos, 0) / positions.length) : 0;
        const change7d = currentData.position && data7dAgo.position ?
            data7dAgo.position - currentData.position : 0;
        const change30d = currentData.position && data30dAgo.position ?
            data30dAgo.position - currentData.position : 0;
        // Generar posiciones de competidores
        const competitorPositions = {
            'competitor1.com': Math.floor(Math.random() * 20) + 1,
            'competitor2.com': Math.floor(Math.random() * 30) + 5,
            'competitor3.com': Math.floor(Math.random() * 50) + 10
        };
        return {
            keyword,
            current_position: currentData.position,
            best_position: bestPosition,
            worst_position: worstPosition,
            avg_position: avgPosition,
            position_change_7d: change7d,
            position_change_30d: change30d,
            visibility_score: currentData.visibility_score,
            estimated_monthly_traffic: currentData.estimated_traffic * 30,
            ranking_url: currentData.url,
            serp_features: currentData.serp_features,
            historical_data: historicalData,
            competitor_positions: competitorPositions
        };
    });
};
// Función para generar tracking de competidores
const generateCompetitorTracking = (competitors, keywords) => {
    return competitors.map(competitorUrl => {
        const domain = new URL(competitorUrl).hostname;
        // Generar métricas del competidor
        const totalKeywords = keywords.length;
        const keywordsInTop10 = Math.floor(Math.random() * totalKeywords * 0.6);
        const keywordsInTop3 = Math.floor(Math.random() * keywordsInTop10 * 0.3);
        const avgPosition = Math.round((Math.random() * 20 + 5) * 10) / 10;
        // Cambios de posición
        const improved = Math.floor(Math.random() * totalKeywords * 0.3);
        const declined = Math.floor(Math.random() * totalKeywords * 0.2);
        const stable = totalKeywords - improved - declined;
        // Top keywords del competidor
        const topKeywords = keywords.slice(0, 5).map(keyword => ({
            keyword,
            position: Math.floor(Math.random() * 10) + 1,
            change: Math.floor(Math.random() * 6) - 3 // -3 a +3
        }));
        return {
            competitor_url: competitorUrl,
            domain,
            visibility_score: Math.round((keywordsInTop10 / totalKeywords) * 100),
            avg_position: avgPosition,
            total_keywords_ranking: totalKeywords,
            keywords_in_top_10: keywordsInTop10,
            keywords_in_top_3: keywordsInTop3,
            estimated_traffic: Math.floor(Math.random() * 100000) + 10000,
            position_changes: {
                improved,
                declined,
                stable
            },
            top_keywords: topKeywords
        };
    });
};
// Función para generar alertas
const generateAlerts = (keywordTracking) => {
    const alerts = [];
    const now = new Date();
    keywordTracking.forEach(kw => {
        // Alerta por cambio significativo de posición
        if (Math.abs(kw.position_change_7d) >= 5) {
            const severity = Math.abs(kw.position_change_7d) >= 10 ? 'high' : 'medium';
            const direction = kw.position_change_7d > 0 ? 'mejorado' : 'empeorado';
            alerts.push({
                id: `alert_${alerts.length + 1}`,
                type: 'position_change',
                keyword: kw.keyword,
                message: `"${kw.keyword}" ha ${direction} ${Math.abs(kw.position_change_7d)} posiciones`,
                severity,
                date: now.toISOString(),
                acknowledged: Math.random() > 0.7
            });
        }
        // Alerta por nueva SERP feature
        if (kw.serp_features.length > 0 && Math.random() > 0.8) {
            alerts.push({
                id: `alert_${alerts.length + 1}`,
                type: 'serp_feature',
                keyword: kw.keyword,
                message: `Nueva SERP feature detectada para "${kw.keyword}": ${kw.serp_features[0]}`,
                severity: 'medium',
                date: now.toISOString(),
                acknowledged: Math.random() > 0.5
            });
        }
    });
    // Alerta por nuevo competidor
    if (Math.random() > 0.9) {
        alerts.push({
            id: `alert_${alerts.length + 1}`,
            type: 'new_competitor',
            message: 'Nuevo competidor detectado en top 10 para múltiples keywords',
            severity: 'medium',
            date: now.toISOString(),
            acknowledged: false
        });
    }
    return alerts.slice(0, 10); // Máximo 10 alertas
};
// POST /api/keyword-research/tracking/setup
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = trackingSetupSchema.parse(req.body);
        const { project_name, website_url, keywords, competitors, location, language, device, tracking_frequency, alerts_enabled, alert_thresholds } = validatedData;
        // Simular tiempo de configuración
        yield new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        // Generar ID del proyecto
        const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Generar datos de tracking iniciales
        const keywordTracking = generateKeywordTracking(keywords, 30);
        const competitorTracking = generateCompetitorTracking(competitors, keywords);
        const alerts = alerts_enabled ? generateAlerts(keywordTracking) : [];
        // Calcular métricas generales
        const keywordsInTop10 = keywordTracking.filter(kw => kw.current_position && kw.current_position <= 10).length;
        const keywordsInTop3 = keywordTracking.filter(kw => kw.current_position && kw.current_position <= 3).length;
        const avgPosition = Math.round(keywordTracking
            .filter(kw => kw.current_position)
            .reduce((sum, kw) => sum + (kw.current_position || 0), 0) /
            keywordTracking.filter(kw => kw.current_position).length);
        const visibilityScore = Math.round((keywordsInTop10 / keywords.length) * 100);
        const totalEstimatedTraffic = keywordTracking.reduce((sum, kw) => sum + kw.estimated_monthly_traffic, 0);
        // Calcular cambios de posición en 7 días
        const improved = keywordTracking.filter(kw => kw.position_change_7d > 0).length;
        const declined = keywordTracking.filter(kw => kw.position_change_7d < 0).length;
        const stable = keywordTracking.filter(kw => kw.position_change_7d === 0).length;
        const project = {
            project_id: projectId,
            project_name,
            website_url,
            created_date: new Date().toISOString(),
            last_update: new Date().toISOString(),
            keywords_count: keywords.length,
            competitors_count: competitors.length,
            tracking_settings: {
                location,
                language,
                device,
                frequency: tracking_frequency,
                alerts_enabled
            },
            overall_metrics: {
                avg_position: avgPosition,
                visibility_score: visibilityScore,
                keywords_in_top_10: keywordsInTop10,
                keywords_in_top_3: keywordsInTop3,
                total_estimated_traffic: totalEstimatedTraffic,
                position_changes_7d: {
                    improved,
                    declined,
                    stable
                }
            },
            keywords: keywordTracking,
            competitors: competitorTracking,
            alerts
        };
        res.json({
            success: true,
            data: {
                project,
                setup_summary: {
                    project_id: projectId,
                    keywords_configured: keywords.length,
                    competitors_configured: competitors.length,
                    tracking_frequency,
                    alerts_configured: alerts.length,
                    estimated_monthly_checks: tracking_frequency === 'daily' ? 30 :
                        tracking_frequency === 'weekly' ? 4 : 1
                }
            },
            message: `Proyecto de tracking "${project_name}" configurado exitosamente`
        });
    }
    catch (error) {
        console.error('Error en configuración de tracking:', error);
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
// GET /api/keyword-research/tracking/data
router.post('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = trackingDataSchema.parse(req.body);
        const { project_id, date_range, keywords: filterKeywords, competitors: filterCompetitors, metrics } = validatedData;
        // Simular tiempo de consulta
        yield new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        // Simular datos del proyecto (en una implementación real, se consultaría la base de datos)
        const mockKeywords = ['seo tools', 'keyword research', 'rank tracking', 'serp analysis'];
        const mockCompetitors = ['https://ahrefs.com', 'https://semrush.com', 'https://moz.com'];
        // Determinar días basado en el rango
        let days = 30;
        switch (date_range) {
            case '7d':
                days = 7;
                break;
            case '30d':
                days = 30;
                break;
            case '90d':
                days = 90;
                break;
            case '6m':
                days = 180;
                break;
            case '1y':
                days = 365;
                break;
        }
        // Filtrar keywords si se especifican
        const keywordsToTrack = filterKeywords && filterKeywords.length > 0 ?
            filterKeywords : mockKeywords;
        // Generar datos de tracking
        const keywordTracking = generateKeywordTracking(keywordsToTrack, days);
        const competitorTracking = generateCompetitorTracking(filterCompetitors && filterCompetitors.length > 0 ? filterCompetitors : mockCompetitors, keywordsToTrack);
        // Filtrar métricas según lo solicitado
        const filteredData = {
            keywords: keywordTracking.map(kw => {
                const filtered = { keyword: kw.keyword };
                if (metrics.includes('position')) {
                    filtered.current_position = kw.current_position;
                    filtered.position_change_7d = kw.position_change_7d;
                    filtered.position_change_30d = kw.position_change_30d;
                    filtered.avg_position = kw.avg_position;
                    filtered.historical_data = kw.historical_data.map(d => ({
                        date: d.date,
                        position: d.position,
                        change: d.change
                    }));
                }
                if (metrics.includes('visibility')) {
                    filtered.visibility_score = kw.visibility_score;
                }
                if (metrics.includes('traffic')) {
                    filtered.estimated_monthly_traffic = kw.estimated_monthly_traffic;
                }
                if (metrics.includes('features')) {
                    filtered.serp_features = kw.serp_features;
                }
                return filtered;
            }),
            competitors: competitorTracking,
            summary: {
                date_range,
                total_keywords: keywordsToTrack.length,
                avg_position: Math.round(keywordTracking.reduce((sum, kw) => sum + (kw.current_position || 100), 0) / keywordsToTrack.length),
                visibility_score: Math.round(keywordTracking.reduce((sum, kw) => sum + kw.visibility_score, 0) / keywordsToTrack.length),
                total_traffic: keywordTracking.reduce((sum, kw) => sum + kw.estimated_monthly_traffic, 0)
            }
        };
        res.json({
            success: true,
            data: filteredData,
            query_params: {
                project_id,
                date_range,
                metrics_requested: metrics,
                keywords_filtered: (filterKeywords === null || filterKeywords === void 0 ? void 0 : filterKeywords.length) || 0,
                competitors_filtered: (filterCompetitors === null || filterCompetitors === void 0 ? void 0 : filterCompetitors.length) || 0
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo datos de tracking:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Parámetros de consulta inválidos',
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
// GET /api/keyword-research/tracking/projects
router.get('/projects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Simular tiempo de consulta
        yield new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        // Generar proyectos de ejemplo
        const projects = [
            {
                project_id: 'project_1',
                project_name: 'Main Website SEO',
                website_url: 'https://example.com',
                keywords_count: 25,
                competitors_count: 3,
                last_update: new Date(Date.now() - 86400000).toISOString(), // Ayer
                avg_position: 15.2,
                visibility_score: 68,
                status: 'active'
            },
            {
                project_id: 'project_2',
                project_name: 'Blog Content Tracking',
                website_url: 'https://blog.example.com',
                keywords_count: 50,
                competitors_count: 5,
                last_update: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
                avg_position: 22.8,
                visibility_score: 45,
                status: 'active'
            },
            {
                project_id: 'project_3',
                project_name: 'Product Pages',
                website_url: 'https://shop.example.com',
                keywords_count: 15,
                competitors_count: 2,
                last_update: new Date(Date.now() - 604800000).toISOString(), // Hace 1 semana
                avg_position: 8.5,
                visibility_score: 85,
                status: 'paused'
            }
        ];
        res.json({
            success: true,
            data: {
                projects,
                total_projects: projects.length,
                active_projects: projects.filter(p => p.status === 'active').length,
                total_keywords: projects.reduce((sum, p) => sum + p.keywords_count, 0)
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo proyectos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}));
exports.default = router;

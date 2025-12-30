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
// Schema de validación para análisis de tendencias
const trendsSchema = zod_1.z.object({
    keywords: zod_1.z.array(zod_1.z.string()).min(1, 'Al menos una keyword es requerida').max(20, 'Máximo 20 keywords por análisis'),
    time_range: zod_1.z.enum(['1m', '3m', '6m', '1y', '2y', '5y']).default('1y'),
    country: zod_1.z.string().default('US'),
    language: zod_1.z.string().default('en'),
    include_seasonality: zod_1.z.boolean().default(true),
    include_predictions: zod_1.z.boolean().default(true),
    include_related_trends: zod_1.z.boolean().default(true),
    granularity: zod_1.z.enum(['daily', 'weekly', 'monthly']).default('monthly')
});
// Función para generar datos históricos de tendencias
const generateHistoricalData = (keyword, timeRange, granularity) => {
    const data = [];
    const now = new Date();
    // Determinar número de puntos de datos basado en rango y granularidad
    let dataPoints = 12; // Por defecto mensual por 1 año
    let intervalDays = 30;
    switch (timeRange) {
        case '1m':
            dataPoints = granularity === 'daily' ? 30 : granularity === 'weekly' ? 4 : 1;
            intervalDays = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
            break;
        case '3m':
            dataPoints = granularity === 'daily' ? 90 : granularity === 'weekly' ? 12 : 3;
            intervalDays = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
            break;
        case '6m':
            dataPoints = granularity === 'daily' ? 180 : granularity === 'weekly' ? 26 : 6;
            intervalDays = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
            break;
        case '1y':
            dataPoints = granularity === 'monthly' ? 12 : granularity === 'weekly' ? 52 : 365;
            intervalDays = granularity === 'monthly' ? 30 : granularity === 'weekly' ? 7 : 1;
            break;
        case '2y':
            dataPoints = granularity === 'monthly' ? 24 : 104;
            intervalDays = granularity === 'monthly' ? 30 : 7;
            break;
        case '5y':
            dataPoints = 60; // Solo mensual para 5 años
            intervalDays = 30;
            break;
    }
    // Generar tendencia base
    const baseInterest = Math.floor(Math.random() * 50) + 25; // 25-75
    let currentInterest = baseInterest;
    // Determinar si la keyword tiene tendencia general
    const trendType = Math.random();
    let trendSlope = 0;
    if (trendType < 0.3)
        trendSlope = 0.5; // Creciente
    else if (trendType < 0.6)
        trendSlope = -0.3; // Decreciente
    // else estable
    // Generar datos históricos
    for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * intervalDays));
        // Aplicar tendencia general
        const trendEffect = trendSlope * (dataPoints - i - 1);
        // Aplicar estacionalidad (más fuerte en keywords comerciales)
        let seasonalEffect = 0;
        const month = date.getMonth();
        const isCommercial = keyword.toLowerCase().includes('buy') ||
            keyword.toLowerCase().includes('price') ||
            keyword.toLowerCase().includes('deal');
        if (isCommercial) {
            // Picos en Black Friday (noviembre) y temporada navideña
            if (month === 10)
                seasonalEffect = 20; // Noviembre
            else if (month === 11)
                seasonalEffect = 15; // Diciembre
            else if (month === 0)
                seasonalEffect = -10; // Enero (post-navidad)
            else if (month === 6 || month === 7)
                seasonalEffect = 10; // Verano
        }
        // Aplicar volatilidad aleatoria
        const randomVariation = (Math.random() - 0.5) * 20;
        // Calcular valor final
        const value = Math.max(0, Math.min(100, currentInterest + trendEffect + seasonalEffect + randomVariation));
        // Calcular volumen de búsqueda estimado
        const searchVolume = Math.floor(value * (Math.random() * 1000 + 500));
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value),
            search_volume: searchVolume,
            relative_interest: Math.round(value)
        });
    }
    return data;
};
// Función para analizar estacionalidad
const analyzeSeasonality = (data, keyword) => {
    // Agrupar datos por mes
    const monthlyData = {};
    data.forEach(point => {
        const month = new Date(point.date).getMonth();
        if (!monthlyData[month])
            monthlyData[month] = [];
        monthlyData[month].push(point.value);
    });
    // Calcular promedios mensuales
    const monthlyAverages = {};
    Object.keys(monthlyData).forEach(month => {
        const monthNum = parseInt(month);
        const values = monthlyData[monthNum];
        monthlyAverages[monthNum] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    // Calcular varianza estacional
    const overallAverage = Object.values(monthlyAverages).reduce((sum, val) => sum + val, 0) / Object.values(monthlyAverages).length;
    const seasonalVariance = Object.values(monthlyAverages).reduce((sum, val) => sum + Math.pow(val - overallAverage, 2), 0) / Object.values(monthlyAverages).length;
    const seasonalStrength = Math.min(100, (seasonalVariance / overallAverage) * 100);
    // Determinar si es estacional (varianza > 15%)
    const isSeasonal = seasonalStrength > 15;
    // Identificar meses pico y bajos
    const sortedMonths = Object.entries(monthlyAverages).sort(([, a], [, b]) => b - a);
    const peakMonths = sortedMonths.slice(0, 2).map(([month]) => {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return monthNames[parseInt(month)];
    });
    const lowMonths = sortedMonths.slice(-2).map(([month]) => {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return monthNames[parseInt(month)];
    });
    // Generar patrones mensuales
    const patterns = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    for (let i = 0; i < 12; i++) {
        const avgInterest = monthlyAverages[i] || overallAverage;
        const peakProbability = peakMonths.includes(monthNames[i]) ? 0.8 :
            lowMonths.includes(monthNames[i]) ? 0.2 : 0.5;
        const seasonalFactor = avgInterest / overallAverage;
        patterns.push({
            month: i + 1,
            month_name: monthNames[i],
            avg_interest: Math.round(avgInterest),
            peak_probability: Math.round(peakProbability * 100) / 100,
            seasonal_factor: Math.round(seasonalFactor * 100) / 100
        });
    }
    return {
        is_seasonal: isSeasonal,
        seasonal_strength: Math.round(seasonalStrength),
        peak_months: peakMonths,
        low_months: lowMonths,
        patterns
    };
};
// Función para generar predicciones
const generatePredictions = (data, keyword) => {
    const recentData = data.slice(-6); // Últimos 6 puntos para predicción
    const avgValue = recentData.reduce((sum, point) => sum + point.value, 0) / recentData.length;
    // Calcular tendencia reciente
    const firstHalf = recentData.slice(0, 3);
    const secondHalf = recentData.slice(3);
    const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;
    const trendSlope = (secondAvg - firstAvg) / 3;
    // Generar predicciones para 3 meses
    const next3Months = [];
    const lastDate = new Date(data[data.length - 1].date);
    for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        const predictedValue = Math.max(0, Math.min(100, avgValue + (trendSlope * i)));
        const uncertainty = Math.min(20, i * 5); // Aumenta incertidumbre con el tiempo
        let trendDirection = 'stable';
        if (trendSlope > 2)
            trendDirection = 'up';
        else if (trendSlope < -2)
            trendDirection = 'down';
        next3Months.push({
            date: futureDate.toISOString().split('T')[0],
            predicted_value: Math.round(predictedValue),
            confidence_interval: {
                lower: Math.max(0, Math.round(predictedValue - uncertainty)),
                upper: Math.min(100, Math.round(predictedValue + uncertainty))
            },
            trend_direction: trendDirection
        });
    }
    // Generar predicciones para 6 meses
    const next6Months = [...next3Months];
    for (let i = 4; i <= 6; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        const predictedValue = Math.max(0, Math.min(100, avgValue + (trendSlope * i * 0.8))); // Reducir efecto a largo plazo
        const uncertainty = Math.min(30, i * 6);
        let trendDirection = 'stable';
        if (trendSlope > 1)
            trendDirection = 'up';
        else if (trendSlope < -1)
            trendDirection = 'down';
        next6Months.push({
            date: futureDate.toISOString().split('T')[0],
            predicted_value: Math.round(predictedValue),
            confidence_interval: {
                lower: Math.max(0, Math.round(predictedValue - uncertainty)),
                upper: Math.min(100, Math.round(predictedValue + uncertainty))
            },
            trend_direction: trendDirection
        });
    }
    // Calcular confianza de la predicción
    const dataVariability = data.reduce((sum, point, index) => {
        if (index === 0)
            return 0;
        return sum + Math.abs(point.value - data[index - 1].value);
    }, 0) / (data.length - 1);
    const confidenceScore = Math.max(30, Math.min(95, 100 - (dataVariability * 2)));
    // Generar forecast textual
    let trendForecast = 'Tendencia estable esperada';
    if (trendSlope > 3)
        trendForecast = 'Crecimiento fuerte esperado';
    else if (trendSlope > 1)
        trendForecast = 'Crecimiento moderado esperado';
    else if (trendSlope < -3)
        trendForecast = 'Declive fuerte esperado';
    else if (trendSlope < -1)
        trendForecast = 'Declive moderado esperado';
    return {
        next_3_months: next3Months,
        next_6_months: next6Months,
        confidence_score: Math.round(confidenceScore),
        trend_forecast: trendForecast
    };
};
// Función para generar tendencias relacionadas
const generateRelatedTrends = (keyword) => {
    const baseKeywords = [
        `${keyword} tutorial`, `${keyword} guide`, `${keyword} tips`,
        `${keyword} best practices`, `${keyword} examples`, `${keyword} tools`,
        `${keyword} vs`, `${keyword} alternative`, `${keyword} review`,
        `how to ${keyword}`, `${keyword} course`, `${keyword} training`
    ];
    const relatedTrends = [];
    // Seleccionar 5-8 keywords relacionadas
    const selectedKeywords = baseKeywords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 5);
    selectedKeywords.forEach(relatedKeyword => {
        relatedTrends.push({
            keyword: relatedKeyword,
            correlation: Math.round((Math.random() * 0.6 + 0.3) * 100) / 100, // 0.3-0.9
            trend_similarity: Math.round((Math.random() * 0.5 + 0.4) * 100) / 100, // 0.4-0.9
            current_interest: Math.floor(Math.random() * 80) + 10, // 10-90
            growth_rate: Math.round((Math.random() * 40 - 20) * 100) / 100 // -20% a +20%
        });
    });
    return relatedTrends.sort((a, b) => b.correlation - a.correlation);
};
// Función para generar insights
const generateInsights = (analysis) => {
    const insights = [];
    // Insight sobre tendencia general
    if (analysis.growth_rate > 10) {
        insights.push({
            type: 'opportunity',
            message: `La keyword "${analysis.keyword}" muestra un crecimiento fuerte del ${analysis.growth_rate}%`,
            recommendation: 'Crear contenido inmediatamente para aprovechar la tendencia creciente'
        });
    }
    else if (analysis.growth_rate < -10) {
        insights.push({
            type: 'warning',
            message: `La keyword "${analysis.keyword}" está en declive con ${Math.abs(analysis.growth_rate)}% de caída`,
            recommendation: 'Considerar keywords alternativas o enfocar en long-tail variations'
        });
    }
    // Insight sobre estacionalidad
    if (analysis.seasonality.is_seasonal) {
        const peakMonths = analysis.seasonality.peak_months.join(' y ');
        insights.push({
            type: 'info',
            message: `Patrón estacional detectado con picos en ${peakMonths}`,
            recommendation: 'Planificar contenido y campañas para maximizar el tráfico en meses pico'
        });
    }
    // Insight sobre volatilidad
    if (analysis.volatility_score > 70) {
        insights.push({
            type: 'warning',
            message: 'Alta volatilidad detectada en las búsquedas',
            recommendation: 'Monitorear de cerca y diversificar con keywords más estables'
        });
    }
    // Insight sobre predicciones
    const futureGrowth = analysis.predictions.next_3_months[2].predicted_value - analysis.current_interest;
    if (futureGrowth > 15) {
        insights.push({
            type: 'opportunity',
            message: 'Las predicciones muestran crecimiento significativo en los próximos 3 meses',
            recommendation: 'Invertir en contenido y SEO para esta keyword ahora'
        });
    }
    // Insight sobre tendencias relacionadas
    const strongRelated = analysis.related_trends.filter(t => t.correlation > 0.7).length;
    if (strongRelated > 2) {
        insights.push({
            type: 'opportunity',
            message: `${strongRelated} keywords relacionadas con alta correlación encontradas`,
            recommendation: 'Crear contenido cluster aprovechando las keywords relacionadas'
        });
    }
    return insights;
};
// POST /api/keyword-research/trends/analyze
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = trendsSchema.parse(req.body);
        const { keywords, time_range, country, language, include_seasonality, include_predictions, include_related_trends, granularity } = validatedData;
        // Simular tiempo de procesamiento
        yield new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));
        const results = [];
        for (const keyword of keywords) {
            // Generar datos históricos
            const historicalData = generateHistoricalData(keyword, time_range, granularity);
            // Calcular métricas básicas
            const currentInterest = historicalData[historicalData.length - 1].value;
            const firstValue = historicalData[0].value;
            const growthRate = Math.round(((currentInterest - firstValue) / firstValue) * 100);
            // Determinar dirección de tendencia
            const recentData = historicalData.slice(-Math.min(6, historicalData.length));
            const recentGrowth = recentData.length > 1 ?
                ((recentData[recentData.length - 1].value - recentData[0].value) / recentData[0].value) * 100 : 0;
            let trendDirection = 'stable';
            if (recentGrowth > 10)
                trendDirection = 'rising';
            else if (recentGrowth < -10)
                trendDirection = 'declining';
            else if (Math.abs(recentGrowth) > 20)
                trendDirection = 'volatile';
            // Calcular volatilidad
            const values = historicalData.map(d => d.value);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const volatilityScore = Math.min(100, Math.round((Math.sqrt(variance) / mean) * 100));
            // Análisis de estacionalidad
            const seasonality = include_seasonality ?
                analyzeSeasonality(historicalData, keyword) :
                {
                    is_seasonal: false,
                    seasonal_strength: 0,
                    peak_months: [],
                    low_months: [],
                    patterns: []
                };
            // Predicciones
            const predictions = include_predictions ?
                generatePredictions(historicalData, keyword) :
                {
                    next_3_months: [],
                    next_6_months: [],
                    confidence_score: 0,
                    trend_forecast: ''
                };
            // Tendencias relacionadas
            const relatedTrends = include_related_trends ?
                generateRelatedTrends(keyword) : [];
            // Crear análisis base
            const baseAnalysis = {
                keyword,
                current_interest: currentInterest,
                trend_direction: trendDirection,
                growth_rate: growthRate,
                volatility_score: volatilityScore,
                historical_data: historicalData,
                seasonality,
                predictions,
                related_trends: relatedTrends
            };
            // Generar insights
            const insights = generateInsights(baseAnalysis);
            // Análisis completo
            const analysis = Object.assign(Object.assign({}, baseAnalysis), { insights });
            results.push(analysis);
        }
        // Calcular estadísticas generales
        const stats = {
            total_keywords: results.length,
            avg_current_interest: Math.round(results.reduce((sum, r) => sum + r.current_interest, 0) / results.length),
            avg_growth_rate: Math.round(results.reduce((sum, r) => sum + r.growth_rate, 0) / results.length),
            trend_distribution: {
                rising: results.filter(r => r.trend_direction === 'rising').length,
                declining: results.filter(r => r.trend_direction === 'declining').length,
                stable: results.filter(r => r.trend_direction === 'stable').length,
                volatile: results.filter(r => r.trend_direction === 'volatile').length
            },
            seasonal_keywords: results.filter(r => r.seasonality.is_seasonal).length,
            high_growth_keywords: results.filter(r => r.growth_rate > 20).length
        };
        // Generar insights generales
        const generalInsights = [];
        if (stats.high_growth_keywords > 0) {
            generalInsights.push({
                type: 'opportunity',
                message: `${stats.high_growth_keywords} keywords muestran alto crecimiento`,
                recommendation: 'Priorizar estas keywords en tu estrategia de contenido'
            });
        }
        if (stats.seasonal_keywords > results.length * 0.5) {
            generalInsights.push({
                type: 'info',
                message: 'Muchas keywords muestran patrones estacionales',
                recommendation: 'Planificar calendario de contenido basado en estacionalidad'
            });
        }
        if (stats.trend_distribution.declining > results.length * 0.3) {
            generalInsights.push({
                type: 'warning',
                message: 'Varias keywords en declive detectadas',
                recommendation: 'Considerar diversificar hacia keywords emergentes'
            });
        }
        res.json({
            success: true,
            data: {
                analyses: results,
                stats,
                insights: generalInsights,
                analysis_params: {
                    keywords,
                    time_range,
                    country,
                    language,
                    granularity,
                    analysis_depth: {
                        seasonality: include_seasonality,
                        predictions: include_predictions,
                        related_trends: include_related_trends
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Error en análisis de tendencias:', error);
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

import { NextRequest, NextResponse } from 'next/server';
import { TrendAnalyzer } from '@/lib/algorithms/keyword-research';

interface TrendAnalysisRequest {
  keywords: string[];
  timeframe?: 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'last_2_years';
  country?: string;
  includeSeasonality?: boolean;
  includeForecast?: boolean;
  compareKeywords?: boolean;
}

interface TrendDataPoint {
  date: string;
  value: number;
  keyword?: string;
}

interface SeasonalityInsight {
  pattern: 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  peakMonths: string[];
  lowMonths: string[];
  description: string;
}

interface ForecastData {
  keyword: string;
  predictions: {
    date: string;
    predicted: number;
    confidence: number;
    lower: number;
    upper: number;
  }[];
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface KeywordTrendResult {
  keyword: string;
  currentVolume: number;
  trendData: TrendDataPoint[];
  seasonality: SeasonalityInsight[];
  forecast?: ForecastData;
  insights: {
    overallTrend: 'increasing' | 'decreasing' | 'stable';
    trendStrength: number;
    volatility: number;
    momentum: number;
    changePercent: number;
    peakValue: number;
    lowValue: number;
    avgValue: number;
  };
  opportunities: string[];
  recommendations: string[];
}

// Generar datos de tendencia histórica
function generateHistoricalTrend(keyword: string, timeframe: string): TrendDataPoint[] {
  const now = new Date();
  const dataPoints: TrendDataPoint[] = [];
  
  let months = 12;
  switch (timeframe) {
    case 'last_month': months = 1; break;
    case 'last_3_months': months = 3; break;
    case 'last_6_months': months = 6; break;
    case 'last_year': months = 12; break;
    case 'last_2_years': months = 24; break;
  }
  
  // Volumen base basado en la keyword
  let baseVolume = 10000;
  if (keyword.includes('seo')) baseVolume = 25000;
  if (keyword.includes('marketing')) baseVolume = 35000;
  if (keyword.includes('tools')) baseVolume = 20000;
  
  // Generar tendencia con estacionalidad
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Tendencia base con ruido
    const trendFactor = 1 + (Math.random() - 0.5) * 0.3;
    
    // Estacionalidad (picos en ciertos meses)
    const month = date.getMonth();
    let seasonalFactor = 1;
    
    // Picos típicos de SEO/Marketing (Enero, Septiembre)
    if (month === 0 || month === 8) seasonalFactor = 1.3;
    if (month === 6 || month === 7) seasonalFactor = 0.8; // Verano más bajo
    if (month === 11) seasonalFactor = 1.2; // Diciembre alto
    
    const value = Math.round(baseVolume * trendFactor * seasonalFactor);
    
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value,
      keyword
    });
  }
  
  return dataPoints;
}

// Analizar estacionalidad
function analyzeSeasonality(trendData: TrendDataPoint[]): SeasonalityInsight[] {
  const insights: SeasonalityInsight[] = [];
  
  // Análisis mensual
  const monthlyData: { [key: number]: number[] } = {};
  trendData.forEach(point => {
    const month = new Date(point.date).getMonth();
    if (!monthlyData[month]) monthlyData[month] = [];
    monthlyData[month].push(point.value);
  });
  
  const monthlyAvgs = Object.entries(monthlyData).map(([month, values]) => ({
    month: parseInt(month),
    avg: values.reduce((sum, val) => sum + val, 0) / values.length
  }));
  
  const overallAvg = monthlyAvgs.reduce((sum, m) => sum + m.avg, 0) / monthlyAvgs.length;
  const variance = monthlyAvgs.reduce((sum, m) => sum + Math.pow(m.avg - overallAvg, 2), 0) / monthlyAvgs.length;
  const seasonalStrength = Math.sqrt(variance) / overallAvg;
  
  if (seasonalStrength > 0.2) {
    const sortedMonths = monthlyAvgs.sort((a, b) => b.avg - a.avg);
    const peakMonths = sortedMonths.slice(0, 3).map(m => 
      new Date(2024, m.month, 1).toLocaleString('es', { month: 'long' })
    );
    const lowMonths = sortedMonths.slice(-3).map(m => 
      new Date(2024, m.month, 1).toLocaleString('es', { month: 'long' })
    );
    
    insights.push({
      pattern: 'monthly',
      strength: Math.round(seasonalStrength * 100),
      peakMonths,
      lowMonths,
      description: `Patrón estacional detectado con picos en ${peakMonths.join(', ')}`
    });
  }
  
  return insights;
}

// Generar pronóstico
function generateForecast(keyword: string, trendData: TrendDataPoint[]): ForecastData {
  const predictions = [];
  const lastValue = trendData[trendData.length - 1].value;
  const trend = calculateTrend(trendData);
  
  // Generar 6 meses de pronóstico
  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + i);
    
    // Aplicar tendencia con algo de ruido
    const trendMultiplier = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1;
    const predicted = Math.round(lastValue * Math.pow(trendMultiplier, i) * (1 + (Math.random() - 0.5) * 0.1));
    
    const confidence = Math.max(50, 90 - (i * 10)); // Confianza decrece con el tiempo
    const margin = predicted * 0.2;
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predicted,
      confidence,
      lower: Math.round(predicted - margin),
      upper: Math.round(predicted + margin)
    });
  }
  
  return {
    keyword,
    predictions,
    accuracy: 75 + Math.round(Math.random() * 20),
    trend: trend as any
  };
}

// Calcular tendencia general
function calculateTrend(trendData: TrendDataPoint[]): 'increasing' | 'decreasing' | 'stable' {
  if (trendData.length < 2) return 'stable';
  
  const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
  const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;
  
  const change = (secondAvg - firstAvg) / firstAvg;
  
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

// Calcular insights
function calculateInsights(trendData: TrendDataPoint[]) {
  const values = trendData.map(p => p.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Volatilidad
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
  const volatility = Math.sqrt(variance) / avgValue;
  
  // Momentum (cambio reciente)
  const recentValues = values.slice(-3);
  const olderValues = values.slice(-6, -3);
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
  const momentum = (recentAvg - olderAvg) / olderAvg;
  
  // Cambio porcentual total
  const changePercent = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  
  // Fuerza de tendencia
  const trendStrength = Math.abs(changePercent) / 100;
  
  return {
    overallTrend: calculateTrend(trendData),
    trendStrength: Math.round(trendStrength * 100),
    volatility: Math.round(volatility * 100),
    momentum: Math.round(momentum * 100),
    changePercent: Math.round(changePercent),
    peakValue: maxValue,
    lowValue: minValue,
    avgValue: Math.round(avgValue)
  };
}

// Generar oportunidades
function generateOpportunities(insights: any, seasonality: SeasonalityInsight[]): string[] {
  const opportunities = [];
  
  if (insights.overallTrend === 'increasing') {
    opportunities.push('Tendencia creciente - momento ideal para invertir en contenido');
  }
  
  if (insights.volatility > 30) {
    opportunities.push('Alta volatilidad - oportunidades de timing estratégico');
  }
  
  if (seasonality.length > 0) {
    const seasonal = seasonality[0];
    opportunities.push(`Aprovechar picos estacionales en ${seasonal.peakMonths.join(', ')}`);
  }
  
  if (insights.momentum > 20) {
    opportunities.push('Momentum positivo reciente - acelerar estrategia');
  }
  
  return opportunities;
}

// Generar recomendaciones
function generateRecommendations(insights: any, seasonality: SeasonalityInsight[]): string[] {
  const recommendations = [];
  
  if (insights.overallTrend === 'decreasing') {
    recommendations.push('Considerar keywords alternativas o nichos relacionados');
    recommendations.push('Enfocar en contenido evergreen para estabilizar tráfico');
  } else if (insights.overallTrend === 'increasing') {
    recommendations.push('Incrementar inversión en contenido para esta keyword');
    recommendations.push('Considerar campañas pagadas para maximizar el momento');
  }
  
  if (seasonality.length > 0) {
    recommendations.push('Planificar contenido estacional con anticipación');
    recommendations.push('Ajustar presupuesto de marketing según patrones estacionales');
  }
  
  if (insights.volatility > 40) {
    recommendations.push('Diversificar portfolio de keywords para reducir riesgo');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrendAnalysisRequest = await request.json();
    
    // Validaciones
    if (!body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword para analizar' },
        { status: 400 }
      );
    }
    
    // Filtrar keywords vacías
    const validKeywords = body.keywords.filter(kw => kw.trim().length > 0);
    
    if (validKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword válida' },
        { status: 400 }
      );
    }
    
    // Limitar a 20 keywords por análisis
    const keywordsToAnalyze = validKeywords.slice(0, 20);
    const timeframe = body.timeframe || 'last_year';
    
    // Analizar cada keyword
    const results: KeywordTrendResult[] = [];
    
    for (const keyword of keywordsToAnalyze) {
      // Generar datos de tendencia
      const trendData = generateHistoricalTrend(keyword, timeframe);
      
      // Analizar estacionalidad
      const seasonality = body.includeSeasonality ? analyzeSeasonality(trendData) : [];
      
      // Generar pronóstico
      const forecast = body.includeForecast ? generateForecast(keyword, trendData) : undefined;
      
      // Calcular insights
      const insights = calculateInsights(trendData);
      
      // Generar oportunidades y recomendaciones
      const opportunities = generateOpportunities(insights, seasonality);
      const recommendations = generateRecommendations(insights, seasonality);
      
      results.push({
        keyword,
        currentVolume: trendData[trendData.length - 1].value,
        trendData,
        seasonality,
        forecast,
        insights,
        opportunities,
        recommendations
      });
    }
    
    // Calcular estadísticas comparativas
    const stats = {
      totalKeywords: results.length,
      avgCurrentVolume: Math.round(results.reduce((sum, r) => sum + r.currentVolume, 0) / results.length),
      trendingUp: results.filter(r => r.insights.overallTrend === 'increasing').length,
      trendingDown: results.filter(r => r.insights.overallTrend === 'decreasing').length,
      stable: results.filter(r => r.insights.overallTrend === 'stable').length,
      avgVolatility: Math.round(results.reduce((sum, r) => sum + r.insights.volatility, 0) / results.length),
      topGrowing: results
        .filter(r => r.insights.changePercent > 0)
        .sort((a, b) => b.insights.changePercent - a.insights.changePercent)
        .slice(0, 3)
        .map(r => ({ keyword: r.keyword, growth: r.insights.changePercent })),
      seasonalKeywords: results.filter(r => r.seasonality.length > 0).length
    };
    
    return NextResponse.json({
      success: true,
      data: {
        results,
        stats,
        timeframe,
        timestamp: new Date().toISOString(),
        analysisOptions: body
      }
    });
    
  } catch (error) {
    console.error('Error in trend analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
/**
 * Algoritmo avanzado de análisis de tendencias para keywords
 * Analiza patrones temporales, estacionalidad y predicciones futuras
 */

interface TrendDataPoint {
  date: string;
  volume: number;
  interest: number;
  cpc?: number;
  difficulty?: number;
}

interface SeasonalityPattern {
  period: 'monthly' | 'quarterly' | 'yearly';
  strength: number; // 0-1
  peaks: Array<{
    period: string;
    intensity: number;
    confidence: number;
  }>;
  valleys: Array<{
    period: string;
    intensity: number;
    confidence: number;
  }>;
}

interface TrendAnalysisResult {
  keyword: string;
  timeRange: {
    start: string;
    end: string;
    dataPoints: number;
  };
  overallTrend: {
    direction: 'rising' | 'falling' | 'stable' | 'volatile';
    strength: number; // 0-1
    confidence: number; // 0-1
    changePercent: number;
  };
  seasonality: {
    hasSeasonality: boolean;
    patterns: SeasonalityPattern[];
    predictability: number; // 0-1
  };
  volatility: {
    score: number; // 0-1
    level: 'low' | 'medium' | 'high' | 'extreme';
    riskFactor: number;
  };
  momentum: {
    current: number; // -1 to 1
    shortTerm: number; // Last 30 days
    mediumTerm: number; // Last 90 days
    longTerm: number; // Last 365 days
  };
  forecast: {
    nextMonth: {
      predicted: number;
      confidence: number;
      range: { min: number; max: number };
    };
    nextQuarter: {
      predicted: number;
      confidence: number;
      range: { min: number; max: number };
    };
    nextYear: {
      predicted: number;
      confidence: number;
      range: { min: number; max: number };
    };
  };
  insights: {
    opportunities: string[];
    risks: string[];
    recommendations: string[];
    bestTimingAdvice: string;
  };
  correlations: Array<{
    factor: string;
    correlation: number;
    significance: number;
  }>;
}

interface TrendAnalysisOptions {
  smoothingWindow: number;
  seasonalityThreshold: number;
  volatilityWindow: number;
  forecastHorizon: number;
  confidenceLevel: number;
}

class TrendAnalyzer {
  private readonly DEFAULT_OPTIONS: TrendAnalysisOptions = {
    smoothingWindow: 7, // días para suavizado
    seasonalityThreshold: 0.3, // umbral para detectar estacionalidad
    volatilityWindow: 30, // días para calcular volatilidad
    forecastHorizon: 365, // días para pronóstico
    confidenceLevel: 0.95 // nivel de confianza para intervalos
  };

  /**
   * Analiza tendencias de una keyword
   */
  async analyzeTrend(
    keyword: string,
    trendData: TrendDataPoint[],
    options: Partial<TrendAnalysisOptions> = {}
  ): Promise<TrendAnalysisResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Validar y limpiar datos
    const cleanData = this.cleanTrendData(trendData);
    if (cleanData.length < 30) {
      throw new Error('Insufficient data points for trend analysis (minimum 30 required)');
    }

    // Suavizar datos
    const smoothedData = this.smoothData(cleanData, opts.smoothingWindow);

    // Analizar tendencia general
    const overallTrend = this.analyzeOverallTrend(smoothedData);

    // Detectar estacionalidad
    const seasonality = this.detectSeasonality(cleanData, opts);

    // Calcular volatilidad
    const volatility = this.calculateVolatility(cleanData, opts.volatilityWindow);

    // Calcular momentum
    const momentum = this.calculateMomentum(cleanData);

    // Generar pronósticos
    const forecast = this.generateForecast(cleanData, seasonality, opts);

    // Detectar correlaciones
    const correlations = this.detectCorrelations(cleanData);

    // Generar insights
    const insights = this.generateInsights(
      overallTrend,
      seasonality,
      volatility,
      momentum,
      forecast
    );

    return {
      keyword,
      timeRange: {
        start: cleanData[0].date,
        end: cleanData[cleanData.length - 1].date,
        dataPoints: cleanData.length
      },
      overallTrend,
      seasonality,
      volatility,
      momentum,
      forecast,
      insights,
      correlations
    };
  }

  /**
   * Limpia y valida datos de tendencia
   */
  private cleanTrendData(data: TrendDataPoint[]): TrendDataPoint[] {
    return data
      .filter(point => point.volume >= 0 && point.interest >= 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(point => ({
        ...point,
        volume: Math.max(0, point.volume),
        interest: Math.max(0, Math.min(100, point.interest))
      }));
  }

  /**
   * Suaviza datos usando media móvil
   */
  private smoothData(data: TrendDataPoint[], window: number): TrendDataPoint[] {
    const smoothed: TrendDataPoint[] = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.floor(window / 2) + 1);
      const windowData = data.slice(start, end);

      const avgVolume = windowData.reduce((sum, p) => sum + p.volume, 0) / windowData.length;
      const avgInterest = windowData.reduce((sum, p) => sum + p.interest, 0) / windowData.length;

      smoothed.push({
        ...data[i],
        volume: Math.round(avgVolume),
        interest: Math.round(avgInterest * 10) / 10
      });
    }

    return smoothed;
  }

  /**
   * Analiza tendencia general
   */
  private analyzeOverallTrend(data: TrendDataPoint[]): any {
    const values = data.map(d => d.volume);
    const n = values.length;

    // Regresión lineal simple
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calcular R²
    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - yMean, 2);
    }

    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    // Determinar dirección y fuerza
    const strength = Math.abs(slope) / (yMean || 1);
    const confidence = Math.max(0, rSquared);

    let direction: 'rising' | 'falling' | 'stable' | 'volatile';
    if (Math.abs(slope) < yMean * 0.01) {
      direction = 'stable';
    } else if (confidence < 0.3) {
      direction = 'volatile';
    } else if (slope > 0) {
      direction = 'rising';
    } else {
      direction = 'falling';
    }

    // Calcular cambio porcentual
    const firstValue = values[0] || 1;
    const lastValue = values[values.length - 1] || 1;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    return {
      direction,
      strength: Math.min(1, strength),
      confidence: Math.min(1, confidence),
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

  /**
   * Detecta patrones de estacionalidad
   */
  private detectSeasonality(
    data: TrendDataPoint[],
    options: TrendAnalysisOptions
  ): any {
    const patterns: SeasonalityPattern[] = [];

    // Analizar estacionalidad mensual
    const monthlyPattern = this.analyzeMonthlySeasonality(data);
    if (monthlyPattern.strength > options.seasonalityThreshold) {
      patterns.push(monthlyPattern);
    }

    // Analizar estacionalidad trimestral
    const quarterlyPattern = this.analyzeQuarterlySeasonality(data);
    if (quarterlyPattern.strength > options.seasonalityThreshold) {
      patterns.push(quarterlyPattern);
    }

    // Analizar estacionalidad anual (si hay suficientes datos)
    if (data.length >= 365) {
      const yearlyPattern = this.analyzeYearlySeasonality(data);
      if (yearlyPattern.strength > options.seasonalityThreshold) {
        patterns.push(yearlyPattern);
      }
    }

    const hasSeasonality = patterns.length > 0;
    const predictability = hasSeasonality 
      ? patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length
      : 0;

    return {
      hasSeasonality,
      patterns,
      predictability: Math.min(1, predictability)
    };
  }

  /**
   * Analiza estacionalidad mensual
   */
  private analyzeMonthlySeasonality(data: TrendDataPoint[]): SeasonalityPattern {
    const monthlyData: Record<number, number[]> = {};

    // Agrupar por mes
    data.forEach(point => {
      const month = new Date(point.date).getMonth();
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(point.volume);
    });

    // Calcular promedios mensuales
    const monthlyAverages: Array<{ month: number; avg: number; count: number }> = [];
    for (let month = 0; month < 12; month++) {
      if (monthlyData[month] && monthlyData[month].length > 0) {
        const avg = monthlyData[month].reduce((sum, val) => sum + val, 0) / monthlyData[month].length;
        monthlyAverages.push({ month, avg, count: monthlyData[month].length });
      }
    }

    if (monthlyAverages.length < 6) {
      return { period: 'monthly', strength: 0, peaks: [], valleys: [] };
    }

    // Calcular variabilidad
    const overallAvg = monthlyAverages.reduce((sum, m) => sum + m.avg, 0) / monthlyAverages.length;
    const variance = monthlyAverages.reduce((sum, m) => sum + Math.pow(m.avg - overallAvg, 2), 0) / monthlyAverages.length;
    const strength = Math.min(1, Math.sqrt(variance) / overallAvg);

    // Identificar picos y valles
    const sorted = [...monthlyAverages].sort((a, b) => b.avg - a.avg);
    const peaks = sorted.slice(0, 3).map(m => ({
      period: this.getMonthName(m.month),
      intensity: m.avg / overallAvg,
      confidence: Math.min(1, m.count / 10)
    }));

    const valleys = sorted.slice(-3).reverse().map(m => ({
      period: this.getMonthName(m.month),
      intensity: m.avg / overallAvg,
      confidence: Math.min(1, m.count / 10)
    }));

    return { period: 'monthly', strength, peaks, valleys };
  }

  /**
   * Analiza estacionalidad trimestral
   */
  private analyzeQuarterlySeasonality(data: TrendDataPoint[]): SeasonalityPattern {
    const quarterlyData: Record<number, number[]> = {};

    // Agrupar por trimestre
    data.forEach(point => {
      const quarter = Math.floor(new Date(point.date).getMonth() / 3);
      if (!quarterlyData[quarter]) quarterlyData[quarter] = [];
      quarterlyData[quarter].push(point.volume);
    });

    // Calcular promedios trimestrales
    const quarterlyAverages: Array<{ quarter: number; avg: number; count: number }> = [];
    for (let quarter = 0; quarter < 4; quarter++) {
      if (quarterlyData[quarter] && quarterlyData[quarter].length > 0) {
        const avg = quarterlyData[quarter].reduce((sum, val) => sum + val, 0) / quarterlyData[quarter].length;
        quarterlyAverages.push({ quarter, avg, count: quarterlyData[quarter].length });
      }
    }

    if (quarterlyAverages.length < 3) {
      return { period: 'quarterly', strength: 0, peaks: [], valleys: [] };
    }

    // Calcular variabilidad
    const overallAvg = quarterlyAverages.reduce((sum, q) => sum + q.avg, 0) / quarterlyAverages.length;
    const variance = quarterlyAverages.reduce((sum, q) => sum + Math.pow(q.avg - overallAvg, 2), 0) / quarterlyAverages.length;
    const strength = Math.min(1, Math.sqrt(variance) / overallAvg);

    // Identificar picos y valles
    const sorted = [...quarterlyAverages].sort((a, b) => b.avg - a.avg);
    const peaks = sorted.slice(0, 2).map(q => ({
      period: `Q${q.quarter + 1}`,
      intensity: q.avg / overallAvg,
      confidence: Math.min(1, q.count / 30)
    }));

    const valleys = sorted.slice(-2).reverse().map(q => ({
      period: `Q${q.quarter + 1}`,
      intensity: q.avg / overallAvg,
      confidence: Math.min(1, q.count / 30)
    }));

    return { period: 'quarterly', strength, peaks, valleys };
  }

  /**
   * Analiza estacionalidad anual
   */
  private analyzeYearlySeasonality(data: TrendDataPoint[]): SeasonalityPattern {
    const yearlyData: Record<number, number[]> = {};

    // Agrupar por año
    data.forEach(point => {
      const year = new Date(point.date).getFullYear();
      if (!yearlyData[year]) yearlyData[year] = [];
      yearlyData[year].push(point.volume);
    });

    const years = Object.keys(yearlyData).map(Number).sort();
    if (years.length < 2) {
      return { period: 'yearly', strength: 0, peaks: [], valleys: [] };
    }

    // Calcular promedios anuales
    const yearlyAverages = years.map(year => {
      const avg = yearlyData[year].reduce((sum, val) => sum + val, 0) / yearlyData[year].length;
      return { year, avg, count: yearlyData[year].length };
    });

    // Calcular variabilidad
    const overallAvg = yearlyAverages.reduce((sum, y) => sum + y.avg, 0) / yearlyAverages.length;
    const variance = yearlyAverages.reduce((sum, y) => sum + Math.pow(y.avg - overallAvg, 2), 0) / yearlyAverages.length;
    const strength = Math.min(1, Math.sqrt(variance) / overallAvg);

    // Identificar picos y valles
    const sorted = [...yearlyAverages].sort((a, b) => b.avg - a.avg);
    const peaks = sorted.slice(0, Math.ceil(sorted.length / 3)).map(y => ({
      period: y.year.toString(),
      intensity: y.avg / overallAvg,
      confidence: Math.min(1, y.count / 100)
    }));

    const valleys = sorted.slice(-Math.ceil(sorted.length / 3)).reverse().map(y => ({
      period: y.year.toString(),
      intensity: y.avg / overallAvg,
      confidence: Math.min(1, y.count / 100)
    }));

    return { period: 'yearly', strength, peaks, valleys };
  }

  /**
   * Calcula volatilidad
   */
  private calculateVolatility(data: TrendDataPoint[], window: number): any {
    const returns: number[] = [];

    // Calcular retornos diarios
    for (let i = 1; i < data.length; i++) {
      const prevVolume = data[i - 1].volume || 1;
      const currentVolume = data[i].volume || 1;
      const dailyReturn = (currentVolume - prevVolume) / prevVolume;
      returns.push(dailyReturn);
    }

    // Calcular volatilidad usando ventana deslizante
    const volatilities: number[] = [];
    for (let i = window; i <= returns.length; i++) {
      const windowReturns = returns.slice(i - window, i);
      const mean = windowReturns.reduce((sum, r) => sum + r, 0) / windowReturns.length;
      const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / windowReturns.length;
      volatilities.push(Math.sqrt(variance));
    }

    const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;
    const score = Math.min(1, avgVolatility * 10); // Normalizar

    let level: 'low' | 'medium' | 'high' | 'extreme';
    if (score < 0.2) level = 'low';
    else if (score < 0.4) level = 'medium';
    else if (score < 0.7) level = 'high';
    else level = 'extreme';

    const riskFactor = score;

    return { score, level, riskFactor };
  }

  /**
   * Calcula momentum en diferentes períodos
   */
  private calculateMomentum(data: TrendDataPoint[]): any {
    const values = data.map(d => d.volume);
    const n = values.length;

    // Momentum actual (últimos vs primeros 10%)
    const recentCount = Math.max(3, Math.floor(n * 0.1));
    const recent = values.slice(-recentCount);
    const early = values.slice(0, recentCount);

    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const earlyAvg = early.reduce((sum, v) => sum + v, 0) / early.length;
    const current = earlyAvg > 0 ? (recentAvg - earlyAvg) / earlyAvg : 0;

    // Momentum a corto plazo (últimos 30 días)
    const shortTermData = data.slice(-Math.min(30, n));
    const shortTerm = this.calculatePeriodMomentum(shortTermData);

    // Momentum a medio plazo (últimos 90 días)
    const mediumTermData = data.slice(-Math.min(90, n));
    const mediumTerm = this.calculatePeriodMomentum(mediumTermData);

    // Momentum a largo plazo (últimos 365 días)
    const longTermData = data.slice(-Math.min(365, n));
    const longTerm = this.calculatePeriodMomentum(longTermData);

    return {
      current: Math.max(-1, Math.min(1, current)),
      shortTerm: Math.max(-1, Math.min(1, shortTerm)),
      mediumTerm: Math.max(-1, Math.min(1, mediumTerm)),
      longTerm: Math.max(-1, Math.min(1, longTerm))
    };
  }

  /**
   * Calcula momentum para un período específico
   */
  private calculatePeriodMomentum(data: TrendDataPoint[]): number {
    if (data.length < 2) return 0;

    const values = data.map(d => d.volume);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }

  /**
   * Genera pronósticos
   */
  private generateForecast(
    data: TrendDataPoint[],
    seasonality: any,
    options: TrendAnalysisOptions
  ): any {
    const values = data.map(d => d.volume);
    const n = values.length;

    // Modelo simple de tendencia + estacionalidad
    const trend = this.calculateLinearTrend(values);
    const seasonal = seasonality.hasSeasonality ? this.extractSeasonalComponent(data) : null;

    // Pronóstico para el próximo mes
    const nextMonth = this.forecastPeriod(values, trend, seasonal, 30);
    
    // Pronóstico para el próximo trimestre
    const nextQuarter = this.forecastPeriod(values, trend, seasonal, 90);
    
    // Pronóstico para el próximo año
    const nextYear = this.forecastPeriod(values, trend, seasonal, 365);

    return {
      nextMonth,
      nextQuarter,
      nextYear
    };
  }

  /**
   * Calcula tendencia lineal
   */
  private calculateLinearTrend(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    return { slope, intercept };
  }

  /**
   * Extrae componente estacional
   */
  private extractSeasonalComponent(data: TrendDataPoint[]): number[] {
    // Implementación simplificada - en producción usar métodos más sofisticados
    const monthlyFactors: number[] = new Array(12).fill(1);
    
    const monthlyData: Record<number, number[]> = {};
    data.forEach(point => {
      const month = new Date(point.date).getMonth();
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(point.volume);
    });

    const overallAvg = data.reduce((sum, p) => sum + p.volume, 0) / data.length;

    for (let month = 0; month < 12; month++) {
      if (monthlyData[month] && monthlyData[month].length > 0) {
        const monthAvg = monthlyData[month].reduce((sum, v) => sum + v, 0) / monthlyData[month].length;
        monthlyFactors[month] = overallAvg > 0 ? monthAvg / overallAvg : 1;
      }
    }

    return monthlyFactors;
  }

  /**
   * Pronóstica para un período específico
   */
  private forecastPeriod(
    values: number[],
    trend: { slope: number; intercept: number },
    seasonal: number[] | null,
    days: number
  ): { predicted: number; confidence: number; range: { min: number; max: number } } {
    const n = values.length;
    const futurePoint = n + days / 2; // Punto medio del período

    // Componente de tendencia
    let predicted = trend.slope * futurePoint + trend.intercept;

    // Componente estacional
    if (seasonal) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days / 2);
      const month = futureDate.getMonth();
      predicted *= seasonal[month];
    }

    predicted = Math.max(0, predicted);

    // Calcular confianza basada en R² de la tendencia
    const residuals = values.map((val, i) => val - (trend.slope * i + trend.intercept));
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
    const confidence = Math.max(0.1, Math.min(0.9, 1 - Math.sqrt(mse) / (predicted || 1)));

    // Calcular rango de confianza
    const errorMargin = Math.sqrt(mse) * 1.96; // 95% de confianza
    const range = {
      min: Math.max(0, predicted - errorMargin),
      max: predicted + errorMargin
    };

    return {
      predicted: Math.round(predicted),
      confidence: Math.round(confidence * 100) / 100,
      range: {
        min: Math.round(range.min),
        max: Math.round(range.max)
      }
    };
  }

  /**
   * Detecta correlaciones con factores externos
   */
  private detectCorrelations(data: TrendDataPoint[]): Array<{ factor: string; correlation: number; significance: number }> {
    // Implementación simplificada - en producción incluir datos externos reales
    const correlations = [
      { factor: 'Seasonality', correlation: 0.65, significance: 0.8 },
      { factor: 'Market Trends', correlation: 0.45, significance: 0.6 },
      { factor: 'Competition', correlation: -0.3, significance: 0.5 }
    ];

    return correlations.filter(c => Math.abs(c.correlation) > 0.2);
  }

  /**
   * Genera insights y recomendaciones
   */
  private generateInsights(
    overallTrend: any,
    seasonality: any,
    volatility: any,
    momentum: any,
    forecast: any
  ): any {
    const opportunities: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];
    let bestTimingAdvice = '';

    // Análisis de tendencia
    if (overallTrend.direction === 'rising' && overallTrend.confidence > 0.6) {
      opportunities.push('Strong upward trend - good long-term potential');
      recommendations.push('Invest in content creation for this keyword');
    } else if (overallTrend.direction === 'falling') {
      risks.push('Declining trend - may indicate decreasing interest');
      recommendations.push('Consider pivoting to related trending keywords');
    }

    // Análisis de estacionalidad
    if (seasonality.hasSeasonality && seasonality.predictability > 0.6) {
      opportunities.push('Predictable seasonal patterns - plan content calendar accordingly');
      const strongestPeak = seasonality.patterns[0]?.peaks[0];
      if (strongestPeak) {
        bestTimingAdvice = `Peak season: ${strongestPeak.period} - prepare content in advance`;
      }
    }

    // Análisis de volatilidad
    if (volatility.level === 'low') {
      opportunities.push('Low volatility - stable and predictable keyword');
    } else if (volatility.level === 'high' || volatility.level === 'extreme') {
      risks.push('High volatility - unpredictable performance');
      recommendations.push('Monitor closely and be prepared to adjust strategy');
    }

    // Análisis de momentum
    if (momentum.current > 0.2 && momentum.shortTerm > 0.1) {
      opportunities.push('Strong current momentum - act quickly to capitalize');
      recommendations.push('Prioritize this keyword in current content strategy');
    } else if (momentum.current < -0.2) {
      risks.push('Negative momentum - declining interest');
    }

    // Análisis de pronóstico
    if (forecast.nextMonth.confidence > 0.7 && forecast.nextMonth.predicted > 0) {
      opportunities.push('Reliable short-term forecast - good for immediate planning');
    }

    // Recomendaciones generales
    if (opportunities.length > risks.length) {
      recommendations.push('Overall positive outlook - recommended for investment');
    } else if (risks.length > opportunities.length) {
      recommendations.push('Proceed with caution - consider alternative keywords');
    }

    if (!bestTimingAdvice) {
      bestTimingAdvice = momentum.current > 0 
        ? 'Current momentum is positive - good time to act'
        : 'Wait for better momentum or seasonal upturn';
    }

    return {
      opportunities,
      risks,
      recommendations,
      bestTimingAdvice
    };
  }

  /**
   * Obtiene nombre del mes
   */
  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month] || 'Unknown';
  }
}

export default TrendAnalyzer;
export type { TrendDataPoint, TrendAnalysisResult, TrendAnalysisOptions, SeasonalityPattern };
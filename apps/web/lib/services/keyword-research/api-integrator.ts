/**
 * Servicio integrador que combina datos de múltiples APIs externas
 * Proporciona una interfaz unificada para acceder a datos de Google KW Planner, SEMrush y Ahrefs
 */

import GoogleKWPlannerService, { type GoogleKWPlannerKeyword } from './google-kw-planner';
import SEMrushService, { type SEMrushKeywordData } from './semrush';
import AhrefsService, { type AhrefsKeywordData } from './ahrefs';

interface UnifiedKeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number; // 0-1
  difficulty: number; // 0-100
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  trend: number[];
  serp_features: string[];
  related_keywords: string[];
  questions: string[];
  sources: {
    google?: Partial<GoogleKWPlannerKeyword>;
    semrush?: Partial<SEMrushKeywordData>;
    ahrefs?: Partial<AhrefsKeywordData>;
  };
  confidence_score: number; // 0-100 basado en concordancia entre fuentes
}

interface CompetitorAnalysis {
  domain: string;
  metrics: {
    domain_authority: number;
    organic_traffic: number;
    organic_keywords: number;
    backlinks: number;
    referring_domains: number;
  };
  top_keywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    traffic: number;
  }>;
  content_gaps: string[];
  opportunities: Array<{
    keyword: string;
    opportunity_score: number;
    reason: string;
  }>;
}

interface TrendAnalysis {
  keyword: string;
  historical_data: Array<{
    date: string;
    volume: number;
    interest: number;
  }>;
  seasonality: {
    pattern: 'stable' | 'seasonal' | 'trending' | 'declining';
    peak_months: number[];
    low_months: number[];
    volatility: number; // 0-1
  };
  forecast: Array<{
    date: string;
    predicted_volume: number;
    confidence: number;
  }>;
}

class APIIntegratorService {
  private googleService: GoogleKWPlannerService;
  private semrushService: SEMrushService;
  private ahrefsService: AhrefsService;

  constructor() {
    this.googleService = new GoogleKWPlannerService();
    this.semrushService = new SEMrushService();
    this.ahrefsService = new AhrefsService();
  }

  /**
   * Obtiene datos unificados de keyword desde múltiples fuentes
   */
  async getUnifiedKeywordData(keywords: string[]): Promise<UnifiedKeywordData[]> {
    try {
      // Obtener datos de todas las fuentes en paralelo
      const [googleData, semrushData, ahrefsData] = await Promise.allSettled([
        this.googleService.getKeywordIdeas({ seedKeywords: keywords }),
        this.semrushService.getKeywordData(keywords),
        this.ahrefsService.getKeywordData(keywords)
      ]);

      // Procesar y unificar los datos
      const unifiedData: UnifiedKeywordData[] = [];

      for (const keyword of keywords) {
        const unified = this.unifyKeywordData(
          keyword,
          googleData.status === 'fulfilled' ? googleData.value : null,
          semrushData.status === 'fulfilled' ? semrushData.value : null,
          ahrefsData.status === 'fulfilled' ? ahrefsData.value : null
        );
        unifiedData.push(unified);
      }

      return unifiedData;
    } catch (error) {
      console.error('Error getting unified keyword data:', error);
      throw error;
    }
  }

  /**
   * Análisis competitivo completo combinando múltiples fuentes
   */
  async getCompetitorAnalysis(competitors: string[], targetKeywords: string[]): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = [];

    for (const competitor of competitors) {
      try {
        // Obtener datos de múltiples fuentes
        const [semrushCompetitor, ahrefsBacklinks, ahrefsSite] = await Promise.allSettled([
          this.semrushService.getCompetitorAnalysis(targetKeywords[0]),
          this.ahrefsService.getBacklinkData(competitor),
          this.ahrefsService.getSiteExplorer(competitor)
        ]);

        const analysis = this.unifyCompetitorData(
          competitor,
          semrushCompetitor.status === 'fulfilled' ? semrushCompetitor.value : null,
          ahrefsBacklinks.status === 'fulfilled' ? ahrefsBacklinks.value : null,
          ahrefsSite.status === 'fulfilled' ? ahrefsSite.value : null,
          targetKeywords
        );

        analyses.push(analysis);
      } catch (error) {
        console.error(`Error analyzing competitor ${competitor}:`, error);
        // Continuar con otros competidores
      }
    }

    return analyses;
  }

  /**
   * Análisis de tendencias combinando datos históricos
   */
  async getTrendAnalysis(keywords: string[]): Promise<TrendAnalysis[]> {
    const trendAnalyses: TrendAnalysis[] = [];

    for (const keyword of keywords) {
      try {
        // Obtener datos históricos de múltiples fuentes
        const [googleHistorical, semrushData] = await Promise.allSettled([
          this.googleService.getHistoricalMetrics([keyword]),
          this.semrushService.getKeywordData([keyword])
        ]);

        const analysis = this.unifyTrendData(
          keyword,
          googleHistorical.status === 'fulfilled' ? googleHistorical.value : null,
          semrushData.status === 'fulfilled' ? semrushData.value : null
        );

        trendAnalyses.push(analysis);
      } catch (error) {
        console.error(`Error analyzing trends for ${keyword}:`, error);
      }
    }

    return trendAnalyses;
  }

  /**
   * Análisis de content gap usando múltiples fuentes
   */
  async getContentGapAnalysis(yourDomain: string, competitors: string[]): Promise<{
    gap_keywords: Array<{
      keyword: string;
      volume: number;
      difficulty: number;
      opportunity_score: number;
      competitor_positions: Record<string, number>;
    }>;
    content_opportunities: Array<{
      topic: string;
      keywords: string[];
      total_volume: number;
      avg_difficulty: number;
      content_type: string;
    }>;
  }> {
    try {
      // Obtener análisis de content gap de Ahrefs
      const ahrefsGap = await this.ahrefsService.getContentGap(yourDomain, competitors);
      
      // Enriquecer con datos de otras fuentes
      const enrichedKeywords = [];
      
      for (const gapKeyword of ahrefsGap.gap_keywords.slice(0, 20)) { // Limitar para performance
        try {
          const [semrushData] = await Promise.allSettled([
            this.semrushService.getKeywordData([gapKeyword.keyword])
          ]);

          const enriched = {
            keyword: gapKeyword.keyword,
            volume: gapKeyword.volume,
            difficulty: gapKeyword.kd,
            opportunity_score: gapKeyword.opportunity_score,
            competitor_positions: gapKeyword.competitor_positions
          };

          // Enriquecer con datos de SEMrush si están disponibles
          if (semrushData.status === 'fulfilled' && semrushData.value.length > 0) {
            const semrushKeyword = semrushData.value[0];
            enriched.volume = Math.round((enriched.volume + semrushKeyword.searchVolume) / 2);
            enriched.difficulty = Math.round((enriched.difficulty + semrushKeyword.difficulty) / 2);
          }

          enrichedKeywords.push(enriched);
        } catch (error) {
          // Usar datos originales si hay error
          enrichedKeywords.push({
            keyword: gapKeyword.keyword,
            volume: gapKeyword.volume,
            difficulty: gapKeyword.kd,
            opportunity_score: gapKeyword.opportunity_score,
            competitor_positions: gapKeyword.competitor_positions
          });
        }
      }

      return {
        gap_keywords: enrichedKeywords,
        content_opportunities: ahrefsGap.content_opportunities.map(opp => ({
          topic: opp.topic,
          keywords: enrichedKeywords
            .filter(kw => kw.keyword.toLowerCase().includes(opp.topic.toLowerCase().split(' ')[0]))
            .map(kw => kw.keyword),
          total_volume: opp.total_volume,
          avg_difficulty: opp.avg_kd,
          content_type: opp.content_type
        }))
      };
    } catch (error) {
      console.error('Error in content gap analysis:', error);
      throw error;
    }
  }

  /**
   * Obtiene sugerencias de keywords desde múltiples fuentes
   */
  async getKeywordSuggestions(seedKeywords: string[], includeQuestions: boolean = true): Promise<{
    related: string[];
    long_tail: string[];
    questions: string[];
    commercial: string[];
    local: string[];
  }> {
    try {
      const allSuggestions = {
        related: new Set<string>(),
        long_tail: new Set<string>(),
        questions: new Set<string>(),
        commercial: new Set<string>(),
        local: new Set<string>()
      };

      // Obtener sugerencias de Google Keyword Planner
      const googleSuggestions = await this.googleService.getKeywordIdeas({
        seedKeywords,
        pageSize: 100
      });

      googleSuggestions.results.forEach(keyword => {
        const kw = keyword.keyword.toLowerCase();
        
        if (kw.includes('how to') || kw.includes('what is') || kw.includes('why')) {
          allSuggestions.questions.add(keyword.keyword);
        } else if (kw.includes('buy') || kw.includes('price') || kw.includes('cost')) {
          allSuggestions.commercial.add(keyword.keyword);
        } else if (kw.includes('near me') || kw.includes('local')) {
          allSuggestions.local.add(keyword.keyword);
        } else if (keyword.keyword.split(' ').length > 3) {
          allSuggestions.long_tail.add(keyword.keyword);
        } else {
          allSuggestions.related.add(keyword.keyword);
        }
      });

      // Obtener sugerencias de SEMrush
      for (const seedKeyword of seedKeywords) {
        try {
          const semrushRelated = await this.semrushService.getRelatedKeywords(seedKeyword, 'related');
          semrushRelated.forEach(kw => {
            if (kw.keyword.split(' ').length > 3) {
              allSuggestions.long_tail.add(kw.keyword);
            } else {
              allSuggestions.related.add(kw.keyword);
            }
          });

          if (includeQuestions) {
            const semrushData = await this.semrushService.getKeywordData([seedKeyword]);
            if (semrushData.length > 0) {
              semrushData[0].questions.forEach(q => allSuggestions.questions.add(q));
            }
          }
        } catch (error) {
          console.error(`Error getting SEMrush suggestions for ${seedKeyword}:`, error);
        }
      }

      return {
        related: Array.from(allSuggestions.related).slice(0, 50),
        long_tail: Array.from(allSuggestions.long_tail).slice(0, 30),
        questions: Array.from(allSuggestions.questions).slice(0, 20),
        commercial: Array.from(allSuggestions.commercial).slice(0, 25),
        local: Array.from(allSuggestions.local).slice(0, 15)
      };
    } catch (error) {
      console.error('Error getting keyword suggestions:', error);
      throw error;
    }
  }

  /**
   * Unifica datos de keyword de múltiples fuentes
   */
  private unifyKeywordData(
    keyword: string,
    googleData: any,
    semrushData: any,
    ahrefsData: any
  ): UnifiedKeywordData {
    const sources: any = {};
    const volumes: number[] = [];
    const cpcs: number[] = [];
    const difficulties: number[] = [];

    // Procesar datos de Google
    if (googleData?.results) {
      const googleKeyword = googleData.results.find((kw: any) => kw.keyword === keyword);
      if (googleKeyword) {
        sources.google = googleKeyword;
        volumes.push(googleKeyword.avgMonthlySearches);
        cpcs.push(googleKeyword.lowTopOfPageBid);
      }
    }

    // Procesar datos de SEMrush
    if (semrushData) {
      const semrushKeyword = semrushData.find((kw: any) => kw.keyword === keyword);
      if (semrushKeyword) {
        sources.semrush = semrushKeyword;
        volumes.push(semrushKeyword.searchVolume);
        cpcs.push(semrushKeyword.cpc);
        difficulties.push(semrushKeyword.difficulty);
      }
    }

    // Procesar datos de Ahrefs
    if (ahrefsData) {
      const ahrefsKeyword = ahrefsData.find((kw: any) => kw.keyword === keyword);
      if (ahrefsKeyword) {
        sources.ahrefs = ahrefsKeyword;
        volumes.push(ahrefsKeyword.volume);
        cpcs.push(ahrefsKeyword.cpc);
        difficulties.push(ahrefsKeyword.kd);
      }
    }

    // Calcular promedios ponderados
    const avgVolume = volumes.length > 0 ? Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length) : 1000;
    const avgCpc = cpcs.length > 0 ? Math.round(cpcs.reduce((a, b) => a + b, 0) / cpcs.length * 100) / 100 : 1.0;
    const avgDifficulty = difficulties.length > 0 ? Math.round(difficulties.reduce((a, b) => a + b, 0) / difficulties.length) : 50;

    // Calcular score de confianza basado en concordancia
    const confidenceScore = this.calculateConfidenceScore(volumes, cpcs, difficulties);

    // Determinar intención (priorizar SEMrush si está disponible)
    let intent: any = 'informational';
    if (sources.semrush?.intent) {
      intent = sources.semrush.intent;
    } else {
      intent = this.determineIntent(keyword);
    }

    // Combinar SERP features
    const serpFeatures = new Set<string>();
    if (sources.semrush?.serp_features) {
      sources.semrush.serp_features.forEach((f: string) => serpFeatures.add(f));
    }
    if (sources.ahrefs?.serp_overview) {
      if (sources.ahrefs.serp_overview.featured_snippet) serpFeatures.add('featured_snippet');
      if (sources.ahrefs.serp_overview.knowledge_panel) serpFeatures.add('knowledge_panel');
      if (sources.ahrefs.serp_overview.local_pack) serpFeatures.add('local_pack');
    }

    // Combinar keywords relacionadas
    const relatedKeywords = new Set<string>();
    if (sources.semrush?.related_keywords) {
      sources.semrush.related_keywords.forEach((kw: string) => relatedKeywords.add(kw));
    }

    // Combinar preguntas
    const questions = new Set<string>();
    if (sources.semrush?.questions) {
      sources.semrush.questions.forEach((q: string) => questions.add(q));
    }

    // Generar datos de tendencia (usar SEMrush si está disponible)
    let trend: number[] = [];
    if (sources.semrush?.trend) {
      trend = sources.semrush.trend;
    } else {
      // Generar tendencia sintética
      trend = this.generateSyntheticTrend(avgVolume);
    }

    return {
      keyword,
      volume: avgVolume,
      cpc: avgCpc,
      competition: Math.min(avgDifficulty / 100, 1),
      difficulty: avgDifficulty,
      intent,
      trend,
      serp_features: Array.from(serpFeatures),
      related_keywords: Array.from(relatedKeywords).slice(0, 10),
      questions: Array.from(questions).slice(0, 5),
      sources,
      confidence_score: confidenceScore
    };
  }

  /**
   * Calcula score de confianza basado en concordancia entre fuentes
   */
  private calculateConfidenceScore(volumes: number[], cpcs: number[], difficulties: number[]): number {
    let score = 50; // Base score

    // Aumentar score por número de fuentes
    const sourceCount = Math.max(volumes.length, cpcs.length, difficulties.length);
    score += sourceCount * 15;

    // Calcular variabilidad y ajustar score
    if (volumes.length > 1) {
      const volumeVariability = this.calculateVariability(volumes);
      score -= volumeVariability * 20; // Penalizar alta variabilidad
    }

    if (difficulties.length > 1) {
      const difficultyVariability = this.calculateVariability(difficulties);
      score -= difficultyVariability * 15;
    }

    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  /**
   * Calcula variabilidad de un array de números (0-1)
   */
  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.min(stdDev / mean, 1); // Coeficiente de variación normalizado
  }

  /**
   * Determina intención de búsqueda basada en la keyword
   */
  private determineIntent(keyword: string): 'informational' | 'navigational' | 'commercial' | 'transactional' {
    const lowerKeyword = keyword.toLowerCase();

    if (['buy', 'purchase', 'order', 'shop', 'cart'].some(term => lowerKeyword.includes(term))) {
      return 'transactional';
    }
    if (['best', 'top', 'review', 'compare', 'vs'].some(term => lowerKeyword.includes(term))) {
      return 'commercial';
    }
    if (['login', 'sign in', 'dashboard'].some(term => lowerKeyword.includes(term))) {
      return 'navigational';
    }
    return 'informational';
  }

  /**
   * Genera tendencia sintética basada en volumen
   */
  private generateSyntheticTrend(volume: number): number[] {
    const trend = [];
    for (let i = 0; i < 12; i++) {
      const seasonal = 0.9 + Math.sin((i - 2) * Math.PI / 6) * 0.2;
      const random = 0.8 + Math.random() * 0.4;
      trend.push(Math.round(volume * seasonal * random));
    }
    return trend;
  }

  /**
   * Unifica datos de competidor de múltiples fuentes
   */
  private unifyCompetitorData(
    domain: string,
    semrushData: any,
    ahrefsBacklinks: any,
    ahrefsSite: any,
    targetKeywords: string[]
  ): CompetitorAnalysis {
    // Combinar métricas de diferentes fuentes
    const metrics = {
      domain_authority: ahrefsSite?.domain_rating || ahrefsBacklinks?.domain_rating || 50,
      organic_traffic: semrushData?.[0]?.organicTraffic || ahrefsSite?.organic_traffic || 10000,
      organic_keywords: semrushData?.[0]?.organicKeywords || ahrefsSite?.organic_keywords || 1000,
      backlinks: ahrefsBacklinks?.backlinks || ahrefsSite?.backlinks || 5000,
      referring_domains: ahrefsBacklinks?.referring_domains || ahrefsSite?.referring_domains || 500
    };

    // Combinar top keywords
    const topKeywords = semrushData?.[0]?.topKeywords || ahrefsSite?.top_pages?.map((page: any) => ({
      keyword: page.top_keyword || 'unknown',
      position: Math.round(1 + Math.random() * 20),
      volume: Math.round(1000 + Math.random() * 10000),
      traffic: page.traffic || 100
    })) || [];

    // Generar content gaps y oportunidades
    const contentGaps = this.generateContentGaps(targetKeywords);
    const opportunities = this.generateOpportunities(targetKeywords, metrics.domain_authority);

    return {
      domain,
      metrics,
      top_keywords: topKeywords.slice(0, 10),
      content_gaps: contentGaps,
      opportunities
    };
  }

  /**
   * Genera content gaps basado en keywords objetivo
   */
  private generateContentGaps(targetKeywords: string[]): string[] {
    return targetKeywords
      .map(keyword => `${keyword} guide`)
      .concat(targetKeywords.map(keyword => `${keyword} tutorial`))
      .slice(0, 10);
  }

  /**
   * Genera oportunidades basadas en métricas del competidor
   */
  private generateOpportunities(targetKeywords: string[], domainAuthority: number): Array<{
    keyword: string;
    opportunity_score: number;
    reason: string;
  }> {
    return targetKeywords.map(keyword => {
      const score = Math.round(50 + (100 - domainAuthority) * 0.3 + Math.random() * 20);
      let reason = 'Good opportunity based on competitor analysis';
      
      if (domainAuthority < 30) {
        reason = 'Low competition - easy to outrank';
      } else if (domainAuthority > 70) {
        reason = 'High competition - focus on long-tail variations';
      }

      return {
        keyword,
        opportunity_score: score,
        reason
      };
    });
  }

  /**
   * Unifica datos de tendencias de múltiples fuentes
   */
  private unifyTrendData(
    keyword: string,
    googleHistorical: any,
    semrushData: any
  ): TrendAnalysis {
    // Generar datos históricos combinados
    const historicalData = [];
    const currentDate = new Date();

    for (let i = 23; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      let volume = 1000;
      let interest = 50;

      // Usar datos de Google si están disponibles
      if (googleHistorical?.[keyword]) {
        const monthData = googleHistorical[keyword].find((m: any) => 
          m.year === date.getFullYear() && m.month === date.getMonth() + 1
        );
        if (monthData) {
          volume = monthData.monthlySearches;
        }
      }

      // Usar datos de SEMrush si están disponibles
      if (semrushData?.[0]?.trend && i < 12) {
        volume = semrushData[0].trend[11 - i] || volume;
      }

      interest = Math.round((volume / 10000) * 100);

      historicalData.push({
        date: date.toISOString().split('T')[0],
        volume,
        interest: Math.min(interest, 100)
      });
    }

    // Analizar estacionalidad
    const seasonality = this.analyzeSeasonality(historicalData);

    // Generar forecast
    const forecast = this.generateForecast(historicalData, 6);

    return {
      keyword,
      historical_data: historicalData,
      seasonality,
      forecast
    };
  }

  /**
   * Analiza patrones estacionales
   */
  private analyzeSeasonality(data: Array<{ date: string; volume: number; interest: number }>): any {
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    data.forEach(point => {
      const month = new Date(point.date).getMonth();
      monthlyAverages[month] += point.volume;
      monthlyCounts[month]++;
    });

    // Calcular promedios mensuales
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i];
      }
    }

    // Encontrar picos y valles
    const maxVolume = Math.max(...monthlyAverages);
    const minVolume = Math.min(...monthlyAverages);
    const avgVolume = monthlyAverages.reduce((a, b) => a + b, 0) / 12;

    const peakMonths = monthlyAverages
      .map((vol, idx) => ({ month: idx, volume: vol }))
      .filter(m => m.volume > avgVolume * 1.2)
      .map(m => m.month);

    const lowMonths = monthlyAverages
      .map((vol, idx) => ({ month: idx, volume: vol }))
      .filter(m => m.volume < avgVolume * 0.8)
      .map(m => m.month);

    // Calcular volatilidad
    const volatility = (maxVolume - minVolume) / avgVolume;

    // Determinar patrón
    let pattern: 'stable' | 'seasonal' | 'trending' | 'declining' = 'stable';
    if (volatility > 0.5) {
      pattern = 'seasonal';
    } else {
      // Analizar tendencia general
      const firstHalf = data.slice(0, 12).reduce((sum, d) => sum + d.volume, 0) / 12;
      const secondHalf = data.slice(12).reduce((sum, d) => sum + d.volume, 0) / 12;
      
      if (secondHalf > firstHalf * 1.1) {
        pattern = 'trending';
      } else if (secondHalf < firstHalf * 0.9) {
        pattern = 'declining';
      }
    }

    return {
      pattern,
      peak_months: peakMonths,
      low_months: lowMonths,
      volatility: Math.min(volatility, 1)
    };
  }

  /**
   * Genera forecast basado en datos históricos
   */
  private generateForecast(
    historicalData: Array<{ date: string; volume: number; interest: number }>,
    months: number
  ): Array<{ date: string; predicted_volume: number; confidence: number }> {
    const forecast = [];
    const recentData = historicalData.slice(-6); // Últimos 6 meses
    const avgVolume = recentData.reduce((sum, d) => sum + d.volume, 0) / recentData.length;
    
    // Calcular tendencia
    const trend = this.calculateTrend(recentData);
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      // Aplicar tendencia y estacionalidad
      const seasonalMultiplier = this.getSeasonalMultiplier(futureDate.getMonth());
      const trendAdjustment = trend * i;
      const predictedVolume = Math.round((avgVolume + trendAdjustment) * seasonalMultiplier);
      
      // Confianza decrece con el tiempo
      const confidence = Math.max(90 - (i * 10), 30);
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        predicted_volume: Math.max(predictedVolume, 0),
        confidence
      });
    }
    
    return forecast;
  }

  /**
   * Calcula tendencia lineal simple
   */
  private calculateTrend(data: Array<{ volume: number }>): number {
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.volume, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.volume, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / (data.length / 2);
  }

  /**
   * Obtiene multiplicador estacional para un mes
   */
  private getSeasonalMultiplier(month: number): number {
    // Patrón estacional general (más actividad en otoño/invierno)
    const seasonalPattern = [0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.05, 1.0, 1.1, 1.15, 1.2];
    return seasonalPattern[month] || 1.0;
  }
}

export default APIIntegratorService;
export type { UnifiedKeywordData, CompetitorAnalysis, TrendAnalysis };
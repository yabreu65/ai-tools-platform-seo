/**
 * Simulación del servicio Google Keyword Planner API
 * Proporciona datos realistas de keywords basados en patrones reales
 */

interface GoogleKWPlannerKeyword {
  keyword: string;
  avgMonthlySearches: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  competitionIndex: number; // 0-100
  lowTopOfPageBid: number;
  highTopOfPageBid: number;
  keywordIdeaType: 'KEYWORD' | 'BROAD_MATCH';
}

interface GoogleKWPlannerResponse {
  results: GoogleKWPlannerKeyword[];
  totalKeywordIdeas: number;
  nextPageToken?: string;
}

interface KeywordIdeasRequest {
  seedKeywords: string[];
  geoTargetConstants?: string[];
  language?: string;
  includeAdultKeywords?: boolean;
  pageSize?: number;
  pageToken?: string;
}

class GoogleKWPlannerService {
  private baseUrl = 'https://googleads.googleapis.com/v14/customers';
  private apiKey: string;

  constructor(apiKey: string = 'simulated-api-key') {
    this.apiKey = apiKey;
  }

  /**
   * Simula la obtención de ideas de keywords desde Google Keyword Planner
   */
  async getKeywordIdeas(request: KeywordIdeasRequest): Promise<GoogleKWPlannerResponse> {
    // Simular delay de API real
    await this.delay(800 + Math.random() * 400);

    const { seedKeywords, pageSize = 50 } = request;
    const allKeywords: GoogleKWPlannerKeyword[] = [];

    for (const seedKeyword of seedKeywords) {
      const variations = this.generateKeywordVariations(seedKeyword);
      allKeywords.push(...variations);
    }

    // Ordenar por volumen de búsqueda descendente
    allKeywords.sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches);

    // Paginar resultados
    const startIndex = 0; // En una implementación real, usar pageToken
    const endIndex = Math.min(startIndex + pageSize, allKeywords.length);
    const paginatedResults = allKeywords.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      totalKeywordIdeas: allKeywords.length,
      nextPageToken: endIndex < allKeywords.length ? 'next-page-token' : undefined
    };
  }

  /**
   * Simula la obtención de métricas históricas de keywords
   */
  async getHistoricalMetrics(keywords: string[]): Promise<Record<string, any[]>> {
    await this.delay(600 + Math.random() * 300);

    const historicalData: Record<string, any[]> = {};

    for (const keyword of keywords) {
      const monthlyData = this.generateHistoricalData(keyword);
      historicalData[keyword] = monthlyData;
    }

    return historicalData;
  }

  /**
   * Simula la obtención de forecasts de keywords
   */
  async getKeywordForecasts(keywords: string[]): Promise<Record<string, any>> {
    await this.delay(700 + Math.random() * 350);

    const forecasts: Record<string, any> = {};

    for (const keyword of keywords) {
      forecasts[keyword] = this.generateForecastData(keyword);
    }

    return forecasts;
  }

  /**
   * Genera variaciones realistas de keywords
   */
  private generateKeywordVariations(seedKeyword: string): GoogleKWPlannerKeyword[] {
    const variations: GoogleKWPlannerKeyword[] = [];
    const baseVolume = this.getBaseVolume(seedKeyword);

    // Keyword exacta
    variations.push(this.createKeywordData(seedKeyword, baseVolume));

    // Variaciones comunes
    const commonPrefixes = ['best', 'top', 'how to', 'what is', 'buy', 'cheap', 'free'];
    const commonSuffixes = ['online', 'near me', 'reviews', 'price', 'cost', 'guide', 'tips'];
    const commonModifiers = ['2024', 'new', 'professional', 'easy', 'fast', 'affordable'];

    // Generar variaciones con prefijos
    commonPrefixes.forEach(prefix => {
      if (Math.random() > 0.7) { // 30% probabilidad
        const variation = `${prefix} ${seedKeyword}`;
        const volume = Math.round(baseVolume * (0.1 + Math.random() * 0.4));
        variations.push(this.createKeywordData(variation, volume));
      }
    });

    // Generar variaciones con sufijos
    commonSuffixes.forEach(suffix => {
      if (Math.random() > 0.6) { // 40% probabilidad
        const variation = `${seedKeyword} ${suffix}`;
        const volume = Math.round(baseVolume * (0.05 + Math.random() * 0.3));
        variations.push(this.createKeywordData(variation, volume));
      }
    });

    // Generar variaciones con modificadores
    commonModifiers.forEach(modifier => {
      if (Math.random() > 0.8) { // 20% probabilidad
        const variation = `${seedKeyword} ${modifier}`;
        const volume = Math.round(baseVolume * (0.02 + Math.random() * 0.2));
        variations.push(this.createKeywordData(variation, volume));
      }
    });

    // Generar long-tail keywords
    const longTailVariations = this.generateLongTailKeywords(seedKeyword, baseVolume);
    variations.push(...longTailVariations);

    // Generar preguntas relacionadas
    const questionVariations = this.generateQuestionKeywords(seedKeyword, baseVolume);
    variations.push(...questionVariations);

    return variations.slice(0, 25); // Limitar a 25 variaciones por seed
  }

  /**
   * Crea datos de keyword con métricas realistas
   */
  private createKeywordData(keyword: string, volume: number): GoogleKWPlannerKeyword {
    const competition = this.determineCompetition(keyword, volume);
    const competitionIndex = this.getCompetitionIndex(competition);
    const { lowBid, highBid } = this.calculateBidRange(keyword, volume, competition);

    return {
      keyword,
      avgMonthlySearches: volume,
      competition,
      competitionIndex,
      lowTopOfPageBid: lowBid,
      highTopOfPageBid: highBid,
      keywordIdeaType: keyword.split(' ').length > 3 ? 'BROAD_MATCH' : 'KEYWORD'
    };
  }

  /**
   * Determina el volumen base basado en la keyword
   */
  private getBaseVolume(keyword: string): number {
    const wordCount = keyword.split(' ').length;
    const keywordLength = keyword.length;

    // Keywords más cortas tienden a tener más volumen
    let baseVolume = 10000;

    if (wordCount === 1) {
      baseVolume = 50000 + Math.random() * 100000;
    } else if (wordCount === 2) {
      baseVolume = 10000 + Math.random() * 40000;
    } else if (wordCount === 3) {
      baseVolume = 2000 + Math.random() * 15000;
    } else {
      baseVolume = 100 + Math.random() * 3000;
    }

    // Ajustar por keywords comerciales
    const commercialTerms = ['buy', 'price', 'cost', 'cheap', 'discount', 'sale', 'shop'];
    if (commercialTerms.some(term => keyword.toLowerCase().includes(term))) {
      baseVolume *= 0.7; // Keywords comerciales suelen tener menos volumen pero más valor
    }

    return Math.round(baseVolume);
  }

  /**
   * Determina el nivel de competencia
   */
  private determineCompetition(keyword: string, volume: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    const commercialTerms = ['buy', 'price', 'cost', 'cheap', 'discount', 'sale', 'shop', 'best'];
    const isCommercial = commercialTerms.some(term => keyword.toLowerCase().includes(term));

    if (volume > 50000 || isCommercial) {
      return Math.random() > 0.3 ? 'HIGH' : 'MEDIUM';
    } else if (volume > 10000) {
      return Math.random() > 0.5 ? 'MEDIUM' : 'LOW';
    } else {
      return Math.random() > 0.7 ? 'MEDIUM' : 'LOW';
    }
  }

  /**
   * Convierte competencia a índice numérico
   */
  private getCompetitionIndex(competition: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (competition) {
      case 'LOW': return Math.round(10 + Math.random() * 20);
      case 'MEDIUM': return Math.round(40 + Math.random() * 30);
      case 'HIGH': return Math.round(70 + Math.random() * 30);
    }
  }

  /**
   * Calcula rango de pujas realista
   */
  private calculateBidRange(keyword: string, volume: number, competition: 'LOW' | 'MEDIUM' | 'HIGH'): { lowBid: number; highBid: number } {
    let baseCpc = 0.5;

    // Ajustar CPC base por competencia
    switch (competition) {
      case 'LOW': baseCpc = 0.2 + Math.random() * 0.8; break;
      case 'MEDIUM': baseCpc = 0.8 + Math.random() * 1.5; break;
      case 'HIGH': baseCpc = 2.0 + Math.random() * 3.0; break;
    }

    // Ajustar por términos comerciales
    const commercialTerms = ['buy', 'price', 'cost', 'cheap', 'discount', 'sale'];
    if (commercialTerms.some(term => keyword.toLowerCase().includes(term))) {
      baseCpc *= 1.5;
    }

    // Ajustar por volumen
    if (volume > 50000) baseCpc *= 1.3;
    else if (volume < 1000) baseCpc *= 0.7;

    const lowBid = Math.round(baseCpc * 100) / 100;
    const highBid = Math.round(baseCpc * (1.5 + Math.random() * 1.0) * 100) / 100;

    return { lowBid, highBid };
  }

  /**
   * Genera keywords long-tail
   */
  private generateLongTailKeywords(seedKeyword: string, baseVolume: number): GoogleKWPlannerKeyword[] {
    const longTailPhrases = [
      `how to use ${seedKeyword}`,
      `${seedKeyword} for beginners`,
      `best ${seedKeyword} for small business`,
      `${seedKeyword} vs alternatives`,
      `${seedKeyword} step by step guide`,
      `free ${seedKeyword} tools`,
      `${seedKeyword} tutorial 2024`
    ];

    return longTailPhrases
      .filter(() => Math.random() > 0.6) // 40% probabilidad
      .map(phrase => {
        const volume = Math.round(baseVolume * (0.01 + Math.random() * 0.1));
        return this.createKeywordData(phrase, volume);
      });
  }

  /**
   * Genera keywords de preguntas
   */
  private generateQuestionKeywords(seedKeyword: string, baseVolume: number): GoogleKWPlannerKeyword[] {
    const questionPhrases = [
      `what is ${seedKeyword}`,
      `how does ${seedKeyword} work`,
      `why use ${seedKeyword}`,
      `when to use ${seedKeyword}`,
      `where to find ${seedKeyword}`,
      `how much does ${seedKeyword} cost`
    ];

    return questionPhrases
      .filter(() => Math.random() > 0.7) // 30% probabilidad
      .map(phrase => {
        const volume = Math.round(baseVolume * (0.02 + Math.random() * 0.15));
        return this.createKeywordData(phrase, volume);
      });
  }

  /**
   * Genera datos históricos mensuales
   */
  private generateHistoricalData(keyword: string): any[] {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const baseVolume = this.getBaseVolume(keyword);
      
      // Simular estacionalidad
      const seasonalMultiplier = this.getSeasonalMultiplier(date.getMonth(), keyword);
      const trendMultiplier = 1 + (Math.random() - 0.5) * 0.3; // ±15% variación
      
      const volume = Math.round(baseVolume * seasonalMultiplier * trendMultiplier);
      
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthlySearches: volume
      });
    }
    
    return months;
  }

  /**
   * Calcula multiplicador estacional
   */
  private getSeasonalMultiplier(month: number, keyword: string): number {
    // Patrones estacionales básicos
    const holidayKeywords = ['gift', 'christmas', 'valentine', 'halloween'];
    const summerKeywords = ['vacation', 'travel', 'beach', 'summer'];
    const backToSchoolKeywords = ['school', 'education', 'student', 'learning'];

    if (holidayKeywords.some(term => keyword.toLowerCase().includes(term))) {
      // Pico en noviembre-diciembre
      if (month === 11 || month === 12) return 2.0;
      if (month === 10) return 1.5;
      return 0.8;
    }

    if (summerKeywords.some(term => keyword.toLowerCase().includes(term))) {
      // Pico en mayo-agosto
      if (month >= 5 && month <= 8) return 1.8;
      if (month === 4 || month === 9) return 1.3;
      return 0.7;
    }

    if (backToSchoolKeywords.some(term => keyword.toLowerCase().includes(term))) {
      // Pico en agosto-septiembre
      if (month === 8 || month === 9) return 1.9;
      if (month === 7 || month === 10) return 1.4;
      return 0.9;
    }

    // Patrón estacional general (ligero aumento en otoño/invierno)
    return 0.9 + Math.sin((month - 3) * Math.PI / 6) * 0.2;
  }

  /**
   * Genera datos de forecast
   */
  private generateForecastData(keyword: string): any {
    const baseVolume = this.getBaseVolume(keyword);
    const competition = this.determineCompetition(keyword, baseVolume);
    
    return {
      impressions: Math.round(baseVolume * (0.8 + Math.random() * 0.4)),
      clicks: Math.round(baseVolume * 0.05 * (0.8 + Math.random() * 0.4)),
      cost: Math.round(baseVolume * 0.05 * this.calculateBidRange(keyword, baseVolume, competition).lowBid * 100) / 100,
      averageCpc: this.calculateBidRange(keyword, baseVolume, competition).lowBid,
      ctr: Math.round((2 + Math.random() * 8) * 100) / 100 // 2-10% CTR
    };
  }

  /**
   * Simula delay de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GoogleKWPlannerService;
export type { GoogleKWPlannerKeyword, GoogleKWPlannerResponse, KeywordIdeasRequest };
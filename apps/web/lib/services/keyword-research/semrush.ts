/**
 * Simulación del servicio SEMrush API
 * Proporciona análisis competitivo y datos de keywords avanzados
 */

interface SEMrushKeywordData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number; // 0-1
  results: number;
  trend: number[]; // 12 meses de datos
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  difficulty: number; // 0-100
  serp_features: string[];
  related_keywords: string[];
  questions: string[];
}

interface SEMrushCompetitorData {
  domain: string;
  organicKeywords: number;
  organicTraffic: number;
  organicCost: number;
  paidKeywords: number;
  paidTraffic: number;
  paidCost: number;
  commonKeywords: string[];
  topKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    traffic: number;
  }>;
}

interface SEMrushDomainAnalysis {
  domain: string;
  authorityScore: number;
  organicSearchTraffic: number;
  paidSearchTraffic: number;
  backlinks: number;
  referringDomains: number;
  topOrganicKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    url: string;
    traffic: number;
  }>;
  topCompetitors: Array<{
    domain: string;
    competitionLevel: number;
    commonKeywords: number;
  }>;
}

interface SEMrushSerpFeatures {
  keyword: string;
  location: string;
  features: Array<{
    type: string;
    present: boolean;
    domains?: string[];
  }>;
  organicResults: Array<{
    position: number;
    domain: string;
    url: string;
    title: string;
    description: string;
    traffic: number;
  }>;
}

class SEMrushService {
  private baseUrl = 'https://api.semrush.com';
  private apiKey: string;

  constructor(apiKey: string = 'simulated-semrush-key') {
    this.apiKey = apiKey;
  }

  /**
   * Obtiene datos detallados de keywords
   */
  async getKeywordData(keywords: string[], database: string = 'us'): Promise<SEMrushKeywordData[]> {
    await this.delay(900 + Math.random() * 500);

    return keywords.map(keyword => this.generateKeywordData(keyword, database));
  }

  /**
   * Análisis de competidores para una keyword
   */
  async getCompetitorAnalysis(keyword: string, limit: number = 10): Promise<SEMrushCompetitorData[]> {
    await this.delay(1200 + Math.random() * 600);

    const competitors: SEMrushCompetitorData[] = [];
    const competitorDomains = this.generateCompetitorDomains(keyword, limit);

    for (const domain of competitorDomains) {
      competitors.push(this.generateCompetitorData(domain, keyword));
    }

    return competitors.sort((a, b) => b.organicTraffic - a.organicTraffic);
  }

  /**
   * Análisis completo de dominio
   */
  async getDomainAnalysis(domain: string): Promise<SEMrushDomainAnalysis> {
    await this.delay(1500 + Math.random() * 700);

    return this.generateDomainAnalysis(domain);
  }

  /**
   * Análisis de SERP features
   */
  async getSerpFeatures(keyword: string, location: string = 'US'): Promise<SEMrushSerpFeatures> {
    await this.delay(800 + Math.random() * 400);

    return this.generateSerpFeatures(keyword, location);
  }

  /**
   * Obtiene keywords relacionadas y sugerencias
   */
  async getRelatedKeywords(keyword: string, type: 'related' | 'phrase' | 'broad' = 'related'): Promise<SEMrushKeywordData[]> {
    await this.delay(700 + Math.random() * 350);

    const relatedKeywords = this.generateRelatedKeywords(keyword, type);
    return relatedKeywords.map(kw => this.generateKeywordData(kw));
  }

  /**
   * Análisis de dificultad de keyword
   */
  async getKeywordDifficulty(keywords: string[]): Promise<Array<{ keyword: string; difficulty: number; analysis: any }>> {
    await this.delay(1000 + Math.random() * 500);

    return keywords.map(keyword => ({
      keyword,
      difficulty: this.calculateKeywordDifficulty(keyword),
      analysis: this.generateDifficultyAnalysis(keyword)
    }));
  }

  /**
   * Genera datos realistas de keyword
   */
  private generateKeywordData(keyword: string, database: string = 'us'): SEMrushKeywordData {
    const wordCount = keyword.split(' ').length;
    const isCommercial = this.isCommercialKeyword(keyword);
    
    // Volumen de búsqueda basado en longitud y tipo
    let searchVolume = this.calculateSearchVolume(keyword);
    
    // CPC basado en competencia comercial
    const cpc = this.calculateCPC(keyword, isCommercial);
    
    // Competencia (0-1)
    const competition = this.calculateCompetition(keyword, searchVolume, isCommercial);
    
    // Número de resultados
    const results = Math.round(1000000 + Math.random() * 50000000);
    
    // Tendencia de 12 meses
    const trend = this.generateTrendData(keyword);
    
    // Intención de búsqueda
    const intent = this.determineSearchIntent(keyword);
    
    // Dificultad SEO
    const difficulty = this.calculateKeywordDifficulty(keyword);
    
    // SERP features
    const serp_features = this.generateSerpFeatures(keyword).features
      .filter(f => f.present)
      .map(f => f.type);
    
    // Keywords relacionadas
    const related_keywords = this.generateRelatedKeywords(keyword, 'related').slice(0, 10);
    
    // Preguntas relacionadas
    const questions = this.generateQuestionKeywords(keyword).slice(0, 5);

    return {
      keyword,
      searchVolume,
      cpc,
      competition,
      results,
      trend,
      intent,
      difficulty,
      serp_features,
      related_keywords,
      questions
    };
  }

  /**
   * Calcula volumen de búsqueda realista
   */
  private calculateSearchVolume(keyword: string): number {
    const wordCount = keyword.split(' ').length;
    const keywordLength = keyword.length;
    
    let baseVolume: number;
    
    if (wordCount === 1) {
      baseVolume = 20000 + Math.random() * 80000;
    } else if (wordCount === 2) {
      baseVolume = 5000 + Math.random() * 25000;
    } else if (wordCount === 3) {
      baseVolume = 1000 + Math.random() * 8000;
    } else {
      baseVolume = 100 + Math.random() * 2000;
    }

    // Ajustes por tipo de keyword
    if (this.isCommercialKeyword(keyword)) {
      baseVolume *= 0.8; // Keywords comerciales tienen menos volumen pero más valor
    }

    if (this.isBrandKeyword(keyword)) {
      baseVolume *= 1.5; // Keywords de marca tienen más volumen
    }

    return Math.round(baseVolume);
  }

  /**
   * Calcula CPC realista
   */
  private calculateCPC(keyword: string, isCommercial: boolean): number {
    let baseCpc = 0.5 + Math.random() * 1.5;

    if (isCommercial) {
      baseCpc *= 2.5; // Keywords comerciales tienen CPC más alto
    }

    // Ajustar por industria
    const highCpcIndustries = ['insurance', 'loan', 'lawyer', 'attorney', 'mortgage', 'credit'];
    if (highCpcIndustries.some(industry => keyword.toLowerCase().includes(industry))) {
      baseCpc *= 3;
    }

    const techKeywords = ['software', 'app', 'tool', 'platform', 'service'];
    if (techKeywords.some(tech => keyword.toLowerCase().includes(tech))) {
      baseCpc *= 1.8;
    }

    return Math.round(baseCpc * 100) / 100;
  }

  /**
   * Calcula nivel de competencia
   */
  private calculateCompetition(keyword: string, volume: number, isCommercial: boolean): number {
    let competition = 0.3 + Math.random() * 0.4; // Base 0.3-0.7

    if (isCommercial) {
      competition += 0.2;
    }

    if (volume > 50000) {
      competition += 0.15;
    } else if (volume < 1000) {
      competition -= 0.1;
    }

    return Math.min(Math.max(Math.round(competition * 100) / 100, 0.1), 1.0);
  }

  /**
   * Genera datos de tendencia de 12 meses
   */
  private generateTrendData(keyword: string): number[] {
    const trend: number[] = [];
    const baseVolume = this.calculateSearchVolume(keyword);
    
    for (let i = 0; i < 12; i++) {
      const seasonalMultiplier = this.getSeasonalMultiplier(i, keyword);
      const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variación
      const monthlyVolume = Math.round(baseVolume * seasonalMultiplier * randomVariation);
      trend.push(monthlyVolume);
    }
    
    return trend;
  }

  /**
   * Determina intención de búsqueda
   */
  private determineSearchIntent(keyword: string): 'informational' | 'navigational' | 'commercial' | 'transactional' {
    const lowerKeyword = keyword.toLowerCase();

    // Transaccional
    const transactionalTerms = ['buy', 'purchase', 'order', 'shop', 'cart', 'checkout', 'price', 'cost', 'cheap', 'discount'];
    if (transactionalTerms.some(term => lowerKeyword.includes(term))) {
      return 'transactional';
    }

    // Comercial
    const commercialTerms = ['best', 'top', 'review', 'compare', 'vs', 'alternative', 'solution'];
    if (commercialTerms.some(term => lowerKeyword.includes(term))) {
      return 'commercial';
    }

    // Navegacional
    const navigationalTerms = ['login', 'sign in', 'dashboard', 'account', 'profile'];
    if (navigationalTerms.some(term => lowerKeyword.includes(term)) || this.isBrandKeyword(keyword)) {
      return 'navigational';
    }

    // Por defecto informacional
    return 'informational';
  }

  /**
   * Calcula dificultad de keyword (0-100)
   */
  private calculateKeywordDifficulty(keyword: string): number {
    const volume = this.calculateSearchVolume(keyword);
    const competition = this.calculateCompetition(keyword, volume, this.isCommercialKeyword(keyword));
    const wordCount = keyword.split(' ').length;

    let difficulty = 30; // Base

    // Ajustar por volumen
    if (volume > 100000) difficulty += 25;
    else if (volume > 50000) difficulty += 20;
    else if (volume > 10000) difficulty += 15;
    else if (volume < 1000) difficulty -= 10;

    // Ajustar por competencia
    difficulty += competition * 30;

    // Ajustar por longitud (long-tail más fácil)
    if (wordCount > 3) difficulty -= 15;
    else if (wordCount === 1) difficulty += 10;

    // Ajustar por tipo comercial
    if (this.isCommercialKeyword(keyword)) difficulty += 10;

    return Math.min(Math.max(Math.round(difficulty), 1), 100);
  }

  /**
   * Genera análisis detallado de dificultad
   */
  private generateDifficultyAnalysis(keyword: string): any {
    const difficulty = this.calculateKeywordDifficulty(keyword);
    
    return {
      overallScore: difficulty,
      factors: {
        competition: Math.round(this.calculateCompetition(keyword, this.calculateSearchVolume(keyword), this.isCommercialKeyword(keyword)) * 100),
        searchVolume: this.calculateSearchVolume(keyword),
        cpc: this.calculateCPC(keyword, this.isCommercialKeyword(keyword)),
        serpComplexity: Math.round(40 + Math.random() * 40),
        contentQuality: Math.round(50 + Math.random() * 30)
      },
      timeToRank: this.estimateTimeToRank(difficulty),
      recommendations: this.generateDifficultyRecommendations(difficulty, keyword)
    };
  }

  /**
   * Estima tiempo para rankear
   */
  private estimateTimeToRank(difficulty: number): string {
    if (difficulty < 30) return '2-4 months';
    if (difficulty < 50) return '4-8 months';
    if (difficulty < 70) return '8-12 months';
    return '12+ months';
  }

  /**
   * Genera recomendaciones basadas en dificultad
   */
  private generateDifficultyRecommendations(difficulty: number, keyword: string): string[] {
    const recommendations: string[] = [];

    if (difficulty > 70) {
      recommendations.push('Consider targeting long-tail variations first');
      recommendations.push('Build domain authority before targeting this keyword');
      recommendations.push('Focus on creating exceptional, comprehensive content');
    } else if (difficulty > 40) {
      recommendations.push('Create high-quality, in-depth content');
      recommendations.push('Build relevant backlinks from authoritative sites');
      recommendations.push('Optimize for user intent and experience');
    } else {
      recommendations.push('Good opportunity for quick wins');
      recommendations.push('Focus on content optimization and user experience');
      recommendations.push('Consider expanding to related keywords');
    }

    return recommendations;
  }

  /**
   * Genera dominios competidores
   */
  private generateCompetitorDomains(keyword: string, limit: number): string[] {
    const domains = [
      'amazon.com', 'wikipedia.org', 'youtube.com', 'reddit.com', 'quora.com',
      'medium.com', 'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'shopify.com', 'wordpress.com', 'hubspot.com', 'salesforce.com', 'google.com',
      'microsoft.com', 'apple.com', 'adobe.com', 'netflix.com', 'spotify.com'
    ];

    // Mezclar y tomar los primeros 'limit' dominios
    const shuffled = domains.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  /**
   * Genera datos de competidor
   */
  private generateCompetitorData(domain: string, keyword: string): SEMrushCompetitorData {
    const baseTraffic = 10000 + Math.random() * 500000;
    
    return {
      domain,
      organicKeywords: Math.round(1000 + Math.random() * 50000),
      organicTraffic: Math.round(baseTraffic),
      organicCost: Math.round(baseTraffic * (0.5 + Math.random() * 2)),
      paidKeywords: Math.round(100 + Math.random() * 5000),
      paidTraffic: Math.round(baseTraffic * 0.1 * (0.5 + Math.random())),
      paidCost: Math.round(baseTraffic * 0.1 * (2 + Math.random() * 3)),
      commonKeywords: this.generateRelatedKeywords(keyword, 'related').slice(0, 15),
      topKeywords: this.generateTopKeywords(keyword, domain)
    };
  }

  /**
   * Genera keywords principales del competidor
   */
  private generateTopKeywords(seedKeyword: string, domain: string): Array<{ keyword: string; position: number; volume: number; traffic: number }> {
    const keywords = this.generateRelatedKeywords(seedKeyword, 'related').slice(0, 10);
    
    return keywords.map(keyword => {
      const volume = this.calculateSearchVolume(keyword);
      const position = Math.round(1 + Math.random() * 20);
      const ctr = this.calculateCTR(position);
      const traffic = Math.round(volume * ctr);
      
      return { keyword, position, volume, traffic };
    });
  }

  /**
   * Calcula CTR basado en posición
   */
  private calculateCTR(position: number): number {
    const ctrByPosition: Record<number, number> = {
      1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.07,
      6: 0.05, 7: 0.04, 8: 0.03, 9: 0.025, 10: 0.02
    };
    
    return ctrByPosition[position] || 0.01;
  }

  /**
   * Genera análisis completo de dominio
   */
  private generateDomainAnalysis(domain: string): SEMrushDomainAnalysis {
    const baseTraffic = 50000 + Math.random() * 1000000;
    
    return {
      domain,
      authorityScore: Math.round(30 + Math.random() * 70),
      organicSearchTraffic: Math.round(baseTraffic),
      paidSearchTraffic: Math.round(baseTraffic * 0.2 * (0.5 + Math.random())),
      backlinks: Math.round(10000 + Math.random() * 500000),
      referringDomains: Math.round(1000 + Math.random() * 50000),
      topOrganicKeywords: this.generateTopOrganicKeywords(domain),
      topCompetitors: this.generateTopCompetitors(domain)
    };
  }

  /**
   * Genera keywords orgánicas principales
   */
  private generateTopOrganicKeywords(domain: string): Array<{ keyword: string; position: number; volume: number; url: string; traffic: number }> {
    const keywords = [
      'digital marketing', 'seo tools', 'content marketing', 'social media',
      'email marketing', 'web analytics', 'conversion optimization', 'ppc advertising'
    ];
    
    return keywords.slice(0, 5).map(keyword => {
      const volume = this.calculateSearchVolume(keyword);
      const position = Math.round(1 + Math.random() * 10);
      const traffic = Math.round(volume * this.calculateCTR(position));
      
      return {
        keyword,
        position,
        volume,
        url: `https://${domain}/${keyword.replace(/\s+/g, '-')}`,
        traffic
      };
    });
  }

  /**
   * Genera competidores principales
   */
  private generateTopCompetitors(domain: string): Array<{ domain: string; competitionLevel: number; commonKeywords: number }> {
    const competitors = this.generateCompetitorDomains('', 5);
    
    return competitors.map(competitorDomain => ({
      domain: competitorDomain,
      competitionLevel: Math.round(0.3 + Math.random() * 0.7 * 100) / 100,
      commonKeywords: Math.round(100 + Math.random() * 1000)
    }));
  }

  /**
   * Genera features de SERP
   */
  private generateSerpFeatures(keyword: string, location: string = 'US'): SEMrushSerpFeatures {
    const features = [
      { type: 'featured_snippet', present: Math.random() > 0.7 },
      { type: 'people_also_ask', present: Math.random() > 0.3 },
      { type: 'local_pack', present: Math.random() > 0.6 },
      { type: 'knowledge_panel', present: Math.random() > 0.8 },
      { type: 'image_pack', present: Math.random() > 0.5 },
      { type: 'video_carousel', present: Math.random() > 0.7 },
      { type: 'shopping_results', present: this.isCommercialKeyword(keyword) && Math.random() > 0.4 },
      { type: 'news_results', present: Math.random() > 0.8 },
      { type: 'reviews', present: this.isCommercialKeyword(keyword) && Math.random() > 0.6 },
      { type: 'site_links', present: Math.random() > 0.5 }
    ];

    const organicResults = this.generateOrganicResults(keyword);

    return {
      keyword,
      location,
      features: features.map(f => ({
        ...f,
        domains: f.present ? this.generateCompetitorDomains(keyword, 3) : undefined
      })),
      organicResults
    };
  }

  /**
   * Genera resultados orgánicos
   */
  private generateOrganicResults(keyword: string): Array<{ position: number; domain: string; url: string; title: string; description: string; traffic: number }> {
    const domains = this.generateCompetitorDomains(keyword, 10);
    const volume = this.calculateSearchVolume(keyword);
    
    return domains.map((domain, index) => {
      const position = index + 1;
      const traffic = Math.round(volume * this.calculateCTR(position));
      
      return {
        position,
        domain,
        url: `https://${domain}/${keyword.replace(/\s+/g, '-')}`,
        title: `${keyword} - ${domain}`,
        description: `Learn about ${keyword} and discover the best practices for implementation...`,
        traffic
      };
    });
  }

  /**
   * Genera keywords relacionadas
   */
  private generateRelatedKeywords(keyword: string, type: 'related' | 'phrase' | 'broad'): string[] {
    const related: string[] = [];
    const words = keyword.split(' ');

    switch (type) {
      case 'related':
        // Sinónimos y términos relacionados
        related.push(
          `${keyword} guide`,
          `${keyword} tips`,
          `${keyword} best practices`,
          `${keyword} tutorial`,
          `${keyword} examples`,
          `how to ${keyword}`,
          `${keyword} tools`,
          `${keyword} software`,
          `${keyword} services`,
          `${keyword} solutions`
        );
        break;

      case 'phrase':
        // Variaciones de frase
        related.push(
          `best ${keyword}`,
          `top ${keyword}`,
          `${keyword} for beginners`,
          `${keyword} 2024`,
          `free ${keyword}`,
          `${keyword} online`,
          `${keyword} course`,
          `${keyword} training`,
          `${keyword} certification`,
          `${keyword} strategy`
        );
        break;

      case 'broad':
        // Términos amplios relacionados
        words.forEach(word => {
          related.push(
            `${word} optimization`,
            `${word} analysis`,
            `${word} management`,
            `${word} automation`,
            `${word} platform`
          );
        });
        break;
    }

    return related.filter(kw => kw !== keyword).slice(0, 20);
  }

  /**
   * Genera keywords de preguntas
   */
  private generateQuestionKeywords(keyword: string): string[] {
    return [
      `what is ${keyword}`,
      `how to use ${keyword}`,
      `why is ${keyword} important`,
      `when to use ${keyword}`,
      `where to find ${keyword}`,
      `how does ${keyword} work`,
      `what are the benefits of ${keyword}`,
      `how much does ${keyword} cost`
    ];
  }

  /**
   * Verifica si es keyword comercial
   */
  private isCommercialKeyword(keyword: string): boolean {
    const commercialTerms = [
      'buy', 'purchase', 'price', 'cost', 'cheap', 'discount', 'sale', 'shop',
      'best', 'top', 'review', 'compare', 'vs', 'alternative', 'solution'
    ];
    return commercialTerms.some(term => keyword.toLowerCase().includes(term));
  }

  /**
   * Verifica si es keyword de marca
   */
  private isBrandKeyword(keyword: string): boolean {
    const brandTerms = [
      'google', 'facebook', 'amazon', 'microsoft', 'apple', 'netflix',
      'spotify', 'adobe', 'salesforce', 'hubspot', 'shopify'
    ];
    return brandTerms.some(brand => keyword.toLowerCase().includes(brand));
  }

  /**
   * Obtiene multiplicador estacional
   */
  private getSeasonalMultiplier(month: number, keyword: string): number {
    // Implementación similar a GoogleKWPlannerService
    const holidayKeywords = ['gift', 'christmas', 'valentine', 'halloween'];
    const summerKeywords = ['vacation', 'travel', 'beach', 'summer'];
    const backToSchoolKeywords = ['school', 'education', 'student', 'learning'];

    if (holidayKeywords.some(term => keyword.toLowerCase().includes(term))) {
      if (month === 10 || month === 11) return 2.0; // Nov-Dec
      if (month === 9) return 1.5; // Oct
      return 0.8;
    }

    if (summerKeywords.some(term => keyword.toLowerCase().includes(term))) {
      if (month >= 4 && month <= 7) return 1.8; // May-Aug
      if (month === 3 || month === 8) return 1.3; // Apr, Sep
      return 0.7;
    }

    if (backToSchoolKeywords.some(term => keyword.toLowerCase().includes(term))) {
      if (month === 7 || month === 8) return 1.9; // Aug-Sep
      if (month === 6 || month === 9) return 1.4; // Jul, Oct
      return 0.9;
    }

    return 0.9 + Math.sin((month - 2) * Math.PI / 6) * 0.2;
  }

  /**
   * Simula delay de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SEMrushService;
export type {
  SEMrushKeywordData,
  SEMrushCompetitorData,
  SEMrushDomainAnalysis,
  SEMrushSerpFeatures
};
/**
 * Algoritmo avanzado de análisis de dificultad de keywords
 * Combina múltiples factores para calcular un score de dificultad preciso
 */

interface DifficultyFactor {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative';
  description: string;
}

interface CompetitorMetrics {
  domain: string;
  domainAuthority: number;
  pageAuthority: number;
  backlinks: number;
  referringDomains: number;
  contentLength: number;
  pageSpeed: number;
  socialSignals: number;
  brandMentions: number;
}

interface SerpAnalysis {
  totalResults: number;
  paidAds: number;
  featuredSnippet: boolean;
  knowledgePanel: boolean;
  localPack: boolean;
  imageResults: boolean;
  videoResults: boolean;
  shoppingResults: boolean;
  newsResults: boolean;
  peopleAlsoAsk: boolean;
}

interface DifficultyAnalysisResult {
  keyword: string;
  overallScore: number; // 0-100
  difficultyLevel: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extremely Hard';
  factors: DifficultyFactor[];
  competitorAnalysis: {
    topCompetitors: CompetitorMetrics[];
    averageMetrics: {
      domainAuthority: number;
      backlinks: number;
      contentLength: number;
    };
    weakestCompetitor: CompetitorMetrics;
    strongestCompetitor: CompetitorMetrics;
  };
  serpComplexity: {
    score: number;
    features: string[];
    organicSpots: number;
  };
  recommendations: string[];
  timeToRank: string;
  effortRequired: 'Low' | 'Medium' | 'High' | 'Very High';
  successProbability: number; // 0-100
}

class KeywordDifficultyAnalyzer {
  private readonly WEIGHTS = {
    SEARCH_VOLUME: 0.15,
    COMPETITION_LEVEL: 0.20,
    TOP_COMPETITORS: 0.25,
    SERP_FEATURES: 0.15,
    CONTENT_QUALITY: 0.10,
    BACKLINK_PROFILE: 0.10,
    COMMERCIAL_INTENT: 0.05
  };

  /**
   * Analiza la dificultad de una keyword
   */
  async analyzeDifficulty(
    keyword: string,
    searchVolume: number,
    competitors: CompetitorMetrics[],
    serpAnalysis: SerpAnalysis,
    location: string = 'US'
  ): Promise<DifficultyAnalysisResult> {
    // Calcular factores individuales
    const factors = this.calculateDifficultyFactors(
      keyword,
      searchVolume,
      competitors,
      serpAnalysis
    );

    // Calcular score general
    const overallScore = this.calculateOverallScore(factors);

    // Análisis de competidores
    const competitorAnalysis = this.analyzeCompetitors(competitors);

    // Análisis de complejidad SERP
    const serpComplexity = this.analyzeSerpComplexity(serpAnalysis);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(
      overallScore,
      factors,
      competitorAnalysis,
      serpComplexity
    );

    return {
      keyword,
      overallScore,
      difficultyLevel: this.getDifficultyLevel(overallScore),
      factors,
      competitorAnalysis,
      serpComplexity,
      recommendations,
      timeToRank: this.estimateTimeToRank(overallScore),
      effortRequired: this.getEffortRequired(overallScore),
      successProbability: this.calculateSuccessProbability(overallScore, factors)
    };
  }

  /**
   * Calcula todos los factores de dificultad
   */
  private calculateDifficultyFactors(
    keyword: string,
    searchVolume: number,
    competitors: CompetitorMetrics[],
    serpAnalysis: SerpAnalysis
  ): DifficultyFactor[] {
    const factors: DifficultyFactor[] = [];

    // Factor: Volumen de búsqueda
    const volumeFactor = this.calculateVolumeFactor(searchVolume);
    factors.push({
      name: 'Search Volume',
      value: volumeFactor.score,
      weight: this.WEIGHTS.SEARCH_VOLUME,
      impact: volumeFactor.impact,
      description: volumeFactor.description
    });

    // Factor: Nivel de competencia
    const competitionFactor = this.calculateCompetitionFactor(competitors);
    factors.push({
      name: 'Competition Level',
      value: competitionFactor.score,
      weight: this.WEIGHTS.COMPETITION_LEVEL,
      impact: 'negative',
      description: competitionFactor.description
    });

    // Factor: Fuerza de competidores top
    const topCompetitorsFactor = this.calculateTopCompetitorsFactor(competitors);
    factors.push({
      name: 'Top Competitors Strength',
      value: topCompetitorsFactor.score,
      weight: this.WEIGHTS.TOP_COMPETITORS,
      impact: 'negative',
      description: topCompetitorsFactor.description
    });

    // Factor: Características SERP
    const serpFeaturesFactor = this.calculateSerpFeaturesFactor(serpAnalysis);
    factors.push({
      name: 'SERP Features',
      value: serpFeaturesFactor.score,
      weight: this.WEIGHTS.SERP_FEATURES,
      impact: 'negative',
      description: serpFeaturesFactor.description
    });

    // Factor: Calidad de contenido requerida
    const contentQualityFactor = this.calculateContentQualityFactor(competitors, keyword);
    factors.push({
      name: 'Content Quality Required',
      value: contentQualityFactor.score,
      weight: this.WEIGHTS.CONTENT_QUALITY,
      impact: 'negative',
      description: contentQualityFactor.description
    });

    // Factor: Perfil de backlinks requerido
    const backlinkFactor = this.calculateBacklinkFactor(competitors);
    factors.push({
      name: 'Backlink Profile Required',
      value: backlinkFactor.score,
      weight: this.WEIGHTS.BACKLINK_PROFILE,
      impact: 'negative',
      description: backlinkFactor.description
    });

    // Factor: Intención comercial
    const commercialIntentFactor = this.calculateCommercialIntentFactor(keyword);
    factors.push({
      name: 'Commercial Intent',
      value: commercialIntentFactor.score,
      weight: this.WEIGHTS.COMMERCIAL_INTENT,
      impact: 'negative',
      description: commercialIntentFactor.description
    });

    return factors;
  }

  /**
   * Calcula factor de volumen de búsqueda
   */
  private calculateVolumeFactor(searchVolume: number): { score: number; impact: 'positive' | 'negative'; description: string } {
    let score = 0;
    let impact: 'positive' | 'negative' = 'positive';
    let description = '';

    if (searchVolume < 100) {
      score = 10;
      description = 'Very low search volume - easier to rank but limited traffic potential';
    } else if (searchVolume < 1000) {
      score = 25;
      description = 'Low search volume - moderate competition expected';
    } else if (searchVolume < 10000) {
      score = 50;
      description = 'Medium search volume - balanced opportunity';
    } else if (searchVolume < 50000) {
      score = 75;
      impact = 'negative';
      description = 'High search volume - increased competition expected';
    } else {
      score = 90;
      impact = 'negative';
      description = 'Very high search volume - intense competition likely';
    }

    return { score, impact, description };
  }

  /**
   * Calcula factor de nivel de competencia
   */
  private calculateCompetitionFactor(competitors: CompetitorMetrics[]): { score: number; description: string } {
    if (competitors.length === 0) {
      return { score: 20, description: 'Limited competitor data available' };
    }

    const avgDA = competitors.reduce((sum, comp) => sum + comp.domainAuthority, 0) / competitors.length;
    const avgBacklinks = competitors.reduce((sum, comp) => sum + comp.backlinks, 0) / competitors.length;

    let score = 30; // Base score

    // Ajustar por Domain Authority promedio
    if (avgDA > 80) score += 30;
    else if (avgDA > 60) score += 20;
    else if (avgDA > 40) score += 10;
    else score -= 5;

    // Ajustar por backlinks promedio
    if (avgBacklinks > 100000) score += 25;
    else if (avgBacklinks > 50000) score += 20;
    else if (avgBacklinks > 10000) score += 15;
    else if (avgBacklinks > 1000) score += 10;

    score = Math.min(Math.max(score, 0), 100);

    let description = '';
    if (score < 30) description = 'Low competition - good opportunity';
    else if (score < 50) description = 'Moderate competition - achievable with effort';
    else if (score < 70) description = 'High competition - requires strong strategy';
    else description = 'Very high competition - challenging to rank';

    return { score, description };
  }

  /**
   * Calcula factor de fuerza de competidores top
   */
  private calculateTopCompetitorsFactor(competitors: CompetitorMetrics[]): { score: number; description: string } {
    if (competitors.length === 0) {
      return { score: 25, description: 'No competitor data available' };
    }

    // Analizar top 5 competidores
    const topCompetitors = competitors.slice(0, 5);
    
    let score = 0;
    let strongCompetitors = 0;

    topCompetitors.forEach(competitor => {
      let competitorScore = 0;

      // Domain Authority
      if (competitor.domainAuthority > 80) competitorScore += 25;
      else if (competitor.domainAuthority > 60) competitorScore += 20;
      else if (competitor.domainAuthority > 40) competitorScore += 15;
      else competitorScore += 10;

      // Backlinks
      if (competitor.backlinks > 50000) competitorScore += 20;
      else if (competitor.backlinks > 10000) competitorScore += 15;
      else if (competitor.backlinks > 1000) competitorScore += 10;
      else competitorScore += 5;

      // Content Length
      if (competitor.contentLength > 3000) competitorScore += 10;
      else if (competitor.contentLength > 1500) competitorScore += 5;

      // Page Speed
      if (competitor.pageSpeed > 90) competitorScore += 5;
      else if (competitor.pageSpeed < 50) competitorScore -= 5;

      if (competitorScore > 50) strongCompetitors++;
      score += competitorScore;
    });

    score = score / topCompetitors.length;
    score = Math.min(Math.max(score, 0), 100);

    let description = '';
    if (strongCompetitors >= 4) {
      description = 'Dominated by very strong competitors - extremely challenging';
    } else if (strongCompetitors >= 2) {
      description = 'Several strong competitors present - high difficulty';
    } else if (strongCompetitors >= 1) {
      description = 'Some strong competitors - moderate difficulty';
    } else {
      description = 'Weak competitors - good opportunity';
    }

    return { score, description };
  }

  /**
   * Calcula factor de características SERP
   */
  private calculateSerpFeaturesFactor(serpAnalysis: SerpAnalysis): { score: number; description: string } {
    let score = 0;
    const features: string[] = [];

    // Contar características que reducen clicks orgánicos
    if (serpAnalysis.featuredSnippet) {
      score += 15;
      features.push('Featured Snippet');
    }
    if (serpAnalysis.knowledgePanel) {
      score += 10;
      features.push('Knowledge Panel');
    }
    if (serpAnalysis.localPack) {
      score += 12;
      features.push('Local Pack');
    }
    if (serpAnalysis.shoppingResults) {
      score += 8;
      features.push('Shopping Results');
    }
    if (serpAnalysis.imageResults) {
      score += 5;
      features.push('Image Results');
    }
    if (serpAnalysis.videoResults) {
      score += 7;
      features.push('Video Results');
    }
    if (serpAnalysis.newsResults) {
      score += 6;
      features.push('News Results');
    }
    if (serpAnalysis.peopleAlsoAsk) {
      score += 4;
      features.push('People Also Ask');
    }

    // Ajustar por número de anuncios pagados
    score += serpAnalysis.paidAds * 3;

    score = Math.min(score, 100);

    let description = '';
    if (score < 20) {
      description = 'Clean SERP - good organic visibility potential';
    } else if (score < 40) {
      description = 'Some SERP features present - moderate impact on clicks';
    } else if (score < 60) {
      description = 'Multiple SERP features - reduced organic click-through';
    } else {
      description = 'Heavily featured SERP - limited organic visibility';
    }

    return { score, description };
  }

  /**
   * Calcula factor de calidad de contenido requerida
   */
  private calculateContentQualityFactor(competitors: CompetitorMetrics[], keyword: string): { score: number; description: string } {
    if (competitors.length === 0) {
      return { score: 40, description: 'Standard content quality expected' };
    }

    const avgContentLength = competitors.reduce((sum, comp) => sum + comp.contentLength, 0) / competitors.length;
    const maxContentLength = Math.max(...competitors.map(comp => comp.contentLength));

    let score = 30; // Base score

    // Ajustar por longitud de contenido promedio
    if (avgContentLength > 4000) score += 25;
    else if (avgContentLength > 2500) score += 20;
    else if (avgContentLength > 1500) score += 15;
    else if (avgContentLength > 800) score += 10;

    // Ajustar por contenido más largo
    if (maxContentLength > 8000) score += 15;
    else if (maxContentLength > 5000) score += 10;

    // Ajustar por tipo de keyword
    const wordCount = keyword.split(' ').length;
    if (wordCount === 1) score += 10; // Keywords genéricas requieren más contenido
    else if (wordCount > 4) score -= 5; // Long-tail pueden ser más específicas

    score = Math.min(Math.max(score, 0), 100);

    let description = '';
    if (score < 30) {
      description = 'Basic content sufficient - low quality bar';
    } else if (score < 50) {
      description = 'Good quality content needed - moderate standards';
    } else if (score < 70) {
      description = 'High-quality, comprehensive content required';
    } else {
      description = 'Exceptional, expert-level content essential';
    }

    return { score, description };
  }

  /**
   * Calcula factor de perfil de backlinks requerido
   */
  private calculateBacklinkFactor(competitors: CompetitorMetrics[]): { score: number; description: string } {
    if (competitors.length === 0) {
      return { score: 35, description: 'Moderate backlink profile expected' };
    }

    const avgBacklinks = competitors.reduce((sum, comp) => sum + comp.backlinks, 0) / competitors.length;
    const avgReferringDomains = competitors.reduce((sum, comp) => sum + comp.referringDomains, 0) / competitors.length;

    let score = 20; // Base score

    // Ajustar por backlinks promedio
    if (avgBacklinks > 100000) score += 30;
    else if (avgBacklinks > 50000) score += 25;
    else if (avgBacklinks > 10000) score += 20;
    else if (avgBacklinks > 1000) score += 15;
    else if (avgBacklinks > 100) score += 10;

    // Ajustar por dominios referentes promedio
    if (avgReferringDomains > 5000) score += 20;
    else if (avgReferringDomains > 1000) score += 15;
    else if (avgReferringDomains > 500) score += 10;
    else if (avgReferringDomains > 100) score += 5;

    score = Math.min(Math.max(score, 0), 100);

    let description = '';
    if (score < 30) {
      description = 'Minimal backlinks needed - focus on content';
    } else if (score < 50) {
      description = 'Moderate link building required';
    } else if (score < 70) {
      description = 'Strong backlink profile essential';
    } else {
      description = 'Extensive, high-authority link building required';
    }

    return { score, description };
  }

  /**
   * Calcula factor de intención comercial
   */
  private calculateCommercialIntentFactor(keyword: string): { score: number; description: string } {
    const lowerKeyword = keyword.toLowerCase();
    let score = 0;

    // Términos transaccionales (alta competencia)
    const transactionalTerms = ['buy', 'purchase', 'order', 'shop', 'cart', 'checkout', 'price', 'cost'];
    if (transactionalTerms.some(term => lowerKeyword.includes(term))) {
      score = 80;
      return { score, description: 'High commercial intent - intense advertiser competition' };
    }

    // Términos comerciales (competencia moderada-alta)
    const commercialTerms = ['best', 'top', 'review', 'compare', 'vs', 'alternative', 'cheap', 'discount'];
    if (commercialTerms.some(term => lowerKeyword.includes(term))) {
      score = 60;
      return { score, description: 'Commercial intent - significant competition from businesses' };
    }

    // Términos informativos (competencia baja-moderada)
    const informationalTerms = ['how to', 'what is', 'guide', 'tutorial', 'learn', 'tips'];
    if (informationalTerms.some(term => lowerKeyword.includes(term))) {
      score = 25;
      return { score, description: 'Informational intent - moderate competition' };
    }

    // Por defecto
    score = 35;
    return { score, description: 'Mixed intent - balanced competition level' };
  }

  /**
   * Calcula score general ponderado
   */
  private calculateOverallScore(factors: DifficultyFactor[]): number {
    let weightedScore = 0;
    let totalWeight = 0;

    factors.forEach(factor => {
      const adjustedValue = factor.impact === 'negative' ? factor.value : (100 - factor.value);
      weightedScore += adjustedValue * factor.weight;
      totalWeight += factor.weight;
    });

    return Math.round(weightedScore / totalWeight);
  }

  /**
   * Analiza competidores
   */
  private analyzeCompetitors(competitors: CompetitorMetrics[]): any {
    if (competitors.length === 0) {
      return {
        topCompetitors: [],
        averageMetrics: { domainAuthority: 0, backlinks: 0, contentLength: 0 },
        weakestCompetitor: null,
        strongestCompetitor: null
      };
    }

    const sortedByStrength = [...competitors].sort((a, b) => {
      const scoreA = a.domainAuthority + (a.backlinks / 1000) + (a.contentLength / 100);
      const scoreB = b.domainAuthority + (b.backlinks / 1000) + (b.contentLength / 100);
      return scoreB - scoreA;
    });

    return {
      topCompetitors: sortedByStrength.slice(0, 5),
      averageMetrics: {
        domainAuthority: Math.round(competitors.reduce((sum, c) => sum + c.domainAuthority, 0) / competitors.length),
        backlinks: Math.round(competitors.reduce((sum, c) => sum + c.backlinks, 0) / competitors.length),
        contentLength: Math.round(competitors.reduce((sum, c) => sum + c.contentLength, 0) / competitors.length)
      },
      weakestCompetitor: sortedByStrength[sortedByStrength.length - 1],
      strongestCompetitor: sortedByStrength[0]
    };
  }

  /**
   * Analiza complejidad SERP
   */
  private analyzeSerpComplexity(serpAnalysis: SerpAnalysis): any {
    const features: string[] = [];
    let score = 0;

    if (serpAnalysis.featuredSnippet) features.push('Featured Snippet');
    if (serpAnalysis.knowledgePanel) features.push('Knowledge Panel');
    if (serpAnalysis.localPack) features.push('Local Pack');
    if (serpAnalysis.imageResults) features.push('Image Results');
    if (serpAnalysis.videoResults) features.push('Video Results');
    if (serpAnalysis.shoppingResults) features.push('Shopping Results');
    if (serpAnalysis.newsResults) features.push('News Results');
    if (serpAnalysis.peopleAlsoAsk) features.push('People Also Ask');

    score = features.length * 10 + serpAnalysis.paidAds * 5;
    const organicSpots = Math.max(10 - serpAnalysis.paidAds - features.length, 3);

    return { score: Math.min(score, 100), features, organicSpots };
  }

  /**
   * Genera recomendaciones
   */
  private generateRecommendations(
    overallScore: number,
    factors: DifficultyFactor[],
    competitorAnalysis: any,
    serpComplexity: any
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore > 80) {
      recommendations.push('Consider targeting long-tail variations of this keyword first');
      recommendations.push('Build significant domain authority before attempting to rank');
      recommendations.push('Create exceptional, comprehensive content (4000+ words)');
      recommendations.push('Develop a strong backlink acquisition strategy');
    } else if (overallScore > 60) {
      recommendations.push('Focus on creating high-quality, in-depth content');
      recommendations.push('Build relevant, authoritative backlinks');
      recommendations.push('Optimize for user intent and search experience');
      recommendations.push('Consider content clusters around this topic');
    } else if (overallScore > 40) {
      recommendations.push('Good opportunity with proper content optimization');
      recommendations.push('Focus on on-page SEO and user experience');
      recommendations.push('Build some quality backlinks to support rankings');
    } else {
      recommendations.push('Excellent opportunity for quick wins');
      recommendations.push('Focus primarily on content quality and relevance');
      recommendations.push('Basic link building should be sufficient');
    }

    // Recomendaciones específicas basadas en factores
    const highImpactFactors = factors.filter(f => f.value > 70 && f.impact === 'negative');
    highImpactFactors.forEach(factor => {
      if (factor.name === 'SERP Features') {
        recommendations.push('Optimize for featured snippets and other SERP features');
      } else if (factor.name === 'Top Competitors Strength') {
        recommendations.push('Study and exceed top competitor content strategies');
      }
    });

    return recommendations;
  }

  /**
   * Obtiene nivel de dificultad textual
   */
  private getDifficultyLevel(score: number): 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extremely Hard' {
    if (score < 20) return 'Very Easy';
    if (score < 35) return 'Easy';
    if (score < 50) return 'Medium';
    if (score < 65) return 'Hard';
    if (score < 80) return 'Very Hard';
    return 'Extremely Hard';
  }

  /**
   * Estima tiempo para rankear
   */
  private estimateTimeToRank(score: number): string {
    if (score < 20) return '1-3 months';
    if (score < 35) return '3-6 months';
    if (score < 50) return '6-9 months';
    if (score < 65) return '9-15 months';
    if (score < 80) return '15-24 months';
    return '24+ months';
  }

  /**
   * Obtiene esfuerzo requerido
   */
  private getEffortRequired(score: number): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score < 35) return 'Low';
    if (score < 50) return 'Medium';
    if (score < 65) return 'High';
    return 'Very High';
  }

  /**
   * Calcula probabilidad de éxito
   */
  private calculateSuccessProbability(score: number, factors: DifficultyFactor[]): number {
    let baseProbability = 100 - score;

    // Ajustar por factores específicos
    const volumeFactor = factors.find(f => f.name === 'Search Volume');
    if (volumeFactor && volumeFactor.value > 80) {
      baseProbability -= 10; // Alto volumen reduce probabilidad
    }

    const competitionFactor = factors.find(f => f.name === 'Competition Level');
    if (competitionFactor && competitionFactor.value > 70) {
      baseProbability -= 15; // Alta competencia reduce probabilidad
    }

    return Math.max(Math.min(Math.round(baseProbability), 95), 5);
  }
}

export default KeywordDifficultyAnalyzer;
export type { DifficultyFactor, CompetitorMetrics, SerpAnalysis, DifficultyAnalysisResult };
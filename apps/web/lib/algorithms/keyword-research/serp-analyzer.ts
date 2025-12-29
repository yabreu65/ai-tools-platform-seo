/**
 * Algoritmo avanzado de análisis de SERP features
 * Analiza características de la página de resultados y oportunidades de optimización
 */

interface SerpFeature {
  type: string;
  present: boolean;
  position?: number;
  content?: string;
  source?: string;
  impact: 'high' | 'medium' | 'low';
  clickThroughRate?: number;
}

interface OrganicResult {
  position: number;
  url: string;
  title: string;
  description: string;
  domain: string;
  domainAuthority: number;
  pageAuthority: number;
  backlinks: number;
  contentLength: number;
  pageSpeed: number;
  socialSignals: number;
  keywordDensity: number;
  titleMatch: boolean;
  urlMatch: boolean;
  metaMatch: boolean;
  structuredData: boolean;
  https: boolean;
  mobileOptimized: boolean;
}

interface PaidResult {
  position: number;
  url: string;
  title: string;
  description: string;
  domain: string;
  adExtensions: string[];
  estimatedCpc: number;
}

interface LocalResult {
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  category: string;
}

interface SerpAnalysisData {
  keyword: string;
  location: string;
  device: 'desktop' | 'mobile';
  language: string;
  totalResults: number;
  searchDate: string;
  features: SerpFeature[];
  organicResults: OrganicResult[];
  paidResults: PaidResult[];
  localResults: LocalResult[];
  relatedSearches: string[];
  peopleAlsoAsk: string[];
}

interface SerpAnalysisResult {
  keyword: string;
  overview: {
    totalResults: number;
    featuresCount: number;
    organicSpots: number;
    paidAdsCount: number;
    competitionLevel: 'low' | 'medium' | 'high' | 'extreme';
    clickDistribution: {
      organic: number;
      paid: number;
      features: number;
    };
  };
  features: {
    present: SerpFeature[];
    absent: SerpFeature[];
    opportunities: Array<{
      feature: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
      actionItems: string[];
    }>;
  };
  organicAnalysis: {
    topCompetitors: OrganicResult[];
    averageMetrics: {
      domainAuthority: number;
      contentLength: number;
      pageSpeed: number;
      backlinks: number;
    };
    contentGaps: string[];
    technicalGaps: string[];
    optimizationOpportunities: string[];
  };
  competitorInsights: {
    dominantDomains: Array<{
      domain: string;
      positions: number[];
      averagePosition: number;
      marketShare: number;
    }>;
    weakestCompetitor: OrganicResult | null;
    strongestCompetitor: OrganicResult | null;
    contentPatterns: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    contentStrategy: string[];
    technicalSeo: string[];
  };
  difficulty: {
    score: number; // 0-100
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
}

class SerpAnalyzer {
  private readonly SERP_FEATURES = {
    'featured_snippet': { impact: 'high', avgCtr: 0.35 },
    'people_also_ask': { impact: 'medium', avgCtr: 0.15 },
    'local_pack': { impact: 'high', avgCtr: 0.44 },
    'knowledge_panel': { impact: 'high', avgCtr: 0.25 },
    'image_results': { impact: 'medium', avgCtr: 0.12 },
    'video_results': { impact: 'medium', avgCtr: 0.18 },
    'shopping_results': { impact: 'high', avgCtr: 0.22 },
    'news_results': { impact: 'medium', avgCtr: 0.14 },
    'site_links': { impact: 'low', avgCtr: 0.08 },
    'reviews': { impact: 'medium', avgCtr: 0.16 },
    'events': { impact: 'low', avgCtr: 0.06 },
    'jobs': { impact: 'medium', avgCtr: 0.13 },
    'flights': { impact: 'high', avgCtr: 0.28 },
    'hotels': { impact: 'high', avgCtr: 0.26 }
  };

  /**
   * Analiza datos SERP completos
   */
  async analyzeSerpData(data: SerpAnalysisData): Promise<SerpAnalysisResult> {
    // Análisis general
    const overview = this.analyzeOverview(data);

    // Análisis de features
    const features = this.analyzeFeatures(data);

    // Análisis orgánico
    const organicAnalysis = this.analyzeOrganicResults(data);

    // Insights de competidores
    const competitorInsights = this.analyzeCompetitors(data);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(
      overview,
      features,
      organicAnalysis,
      competitorInsights
    );

    // Calcular dificultad
    const difficulty = this.calculateSerpDifficulty(data, organicAnalysis);

    return {
      keyword: data.keyword,
      overview,
      features,
      organicAnalysis,
      competitorInsights,
      recommendations,
      difficulty
    };
  }

  /**
   * Analiza overview general del SERP
   */
  private analyzeOverview(data: SerpAnalysisData): any {
    const featuresCount = data.features.filter(f => f.present).length;
    const paidAdsCount = data.paidResults.length;
    
    // Calcular spots orgánicos disponibles
    let organicSpots = 10; // Base
    organicSpots -= Math.min(4, paidAdsCount); // Reducir por anuncios
    organicSpots -= featuresCount * 0.5; // Reducir por features

    organicSpots = Math.max(3, Math.round(organicSpots));

    // Determinar nivel de competencia
    let competitionLevel: 'low' | 'medium' | 'high' | 'extreme';
    const competitionScore = paidAdsCount * 2 + featuresCount * 1.5;
    
    if (competitionScore < 3) competitionLevel = 'low';
    else if (competitionScore < 6) competitionLevel = 'medium';
    else if (competitionScore < 10) competitionLevel = 'high';
    else competitionLevel = 'extreme';

    // Distribución estimada de clicks
    const clickDistribution = this.calculateClickDistribution(data);

    return {
      totalResults: data.totalResults,
      featuresCount,
      organicSpots,
      paidAdsCount,
      competitionLevel,
      clickDistribution
    };
  }

  /**
   * Calcula distribución estimada de clicks
   */
  private calculateClickDistribution(data: SerpAnalysisData): any {
    let organicCtr = 0.65; // CTR base orgánico
    let paidCtr = 0.15; // CTR base pagado
    let featuresCtr = 0.20; // CTR base features

    // Ajustar por features presentes
    data.features.forEach(feature => {
      if (feature.present && this.SERP_FEATURES[feature.type as keyof typeof this.SERP_FEATURES]) {
        const featureData = this.SERP_FEATURES[feature.type as keyof typeof this.SERP_FEATURES];
        featuresCtr += featureData.avgCtr * 0.1;
        organicCtr -= featureData.avgCtr * 0.1;
      }
    });

    // Ajustar por anuncios
    if (data.paidResults.length > 0) {
      paidCtr += data.paidResults.length * 0.03;
      organicCtr -= data.paidResults.length * 0.03;
    }

    // Normalizar
    const total = organicCtr + paidCtr + featuresCtr;
    return {
      organic: Math.round((organicCtr / total) * 100),
      paid: Math.round((paidCtr / total) * 100),
      features: Math.round((featuresCtr / total) * 100)
    };
  }

  /**
   * Analiza features SERP
   */
  private analyzeFeatures(data: SerpAnalysisData): any {
    const present = data.features.filter(f => f.present);
    const absent = this.identifyAbsentFeatures(data);
    const opportunities = this.identifyFeatureOpportunities(present, absent, data);

    return { present, absent, opportunities };
  }

  /**
   * Identifica features ausentes pero relevantes
   */
  private identifyAbsentFeatures(data: SerpAnalysisData): SerpFeature[] {
    const presentTypes = new Set(data.features.filter(f => f.present).map(f => f.type));
    const potentialFeatures: SerpFeature[] = [];

    // Features comunes que podrían estar presentes
    const commonFeatures = [
      'featured_snippet',
      'people_also_ask',
      'image_results',
      'video_results',
      'site_links',
      'reviews'
    ];

    commonFeatures.forEach(featureType => {
      if (!presentTypes.has(featureType)) {
        potentialFeatures.push({
          type: featureType,
          present: false,
          impact: this.SERP_FEATURES[featureType as keyof typeof this.SERP_FEATURES]?.impact || 'medium'
        });
      }
    });

    return potentialFeatures;
  }

  /**
   * Identifica oportunidades de features
   */
  private identifyFeatureOpportunities(
    present: SerpFeature[],
    absent: SerpFeature[],
    data: SerpAnalysisData
  ): Array<any> {
    const opportunities: Array<any> = [];

    // Oportunidades de featured snippet
    if (!present.some(f => f.type === 'featured_snippet')) {
      opportunities.push({
        feature: 'Featured Snippet',
        priority: 'high',
        description: 'No featured snippet present - opportunity to capture position zero',
        actionItems: [
          'Create comprehensive FAQ section',
          'Structure content with clear headings',
          'Use bullet points and numbered lists',
          'Answer specific questions directly'
        ]
      });
    }

    // Oportunidades de People Also Ask
    if (data.peopleAlsoAsk.length > 0) {
      opportunities.push({
        feature: 'People Also Ask',
        priority: 'high',
        description: 'PAA questions identified - create content to target these',
        actionItems: [
          'Create dedicated sections for each PAA question',
          'Provide comprehensive answers',
          'Use question-based headings',
          'Include related subtopics'
        ]
      });
    }

    // Oportunidades de imágenes
    if (!present.some(f => f.type === 'image_results')) {
      opportunities.push({
        feature: 'Image Results',
        priority: 'medium',
        description: 'No image results - opportunity for visual content',
        actionItems: [
          'Add relevant, high-quality images',
          'Optimize image alt text',
          'Use descriptive file names',
          'Create infographics and diagrams'
        ]
      });
    }

    // Oportunidades de video
    if (!present.some(f => f.type === 'video_results')) {
      opportunities.push({
        feature: 'Video Results',
        priority: 'medium',
        description: 'No video results - opportunity for video content',
        actionItems: [
          'Create educational videos',
          'Optimize video titles and descriptions',
          'Add video transcripts',
          'Use video schema markup'
        ]
      });
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analiza resultados orgánicos
   */
  private analyzeOrganicResults(data: SerpAnalysisData): any {
    const topCompetitors = data.organicResults.slice(0, 10);

    // Métricas promedio
    const averageMetrics = this.calculateAverageMetrics(topCompetitors);

    // Identificar gaps de contenido
    const contentGaps = this.identifyContentGaps(topCompetitors, data.keyword);

    // Identificar gaps técnicos
    const technicalGaps = this.identifyTechnicalGaps(topCompetitors);

    // Oportunidades de optimización
    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      topCompetitors,
      averageMetrics
    );

    return {
      topCompetitors,
      averageMetrics,
      contentGaps,
      technicalGaps,
      optimizationOpportunities
    };
  }

  /**
   * Calcula métricas promedio de competidores
   */
  private calculateAverageMetrics(competitors: OrganicResult[]): any {
    if (competitors.length === 0) {
      return { domainAuthority: 0, contentLength: 0, pageSpeed: 0, backlinks: 0 };
    }

    return {
      domainAuthority: Math.round(
        competitors.reduce((sum, c) => sum + c.domainAuthority, 0) / competitors.length
      ),
      contentLength: Math.round(
        competitors.reduce((sum, c) => sum + c.contentLength, 0) / competitors.length
      ),
      pageSpeed: Math.round(
        competitors.reduce((sum, c) => sum + c.pageSpeed, 0) / competitors.length
      ),
      backlinks: Math.round(
        competitors.reduce((sum, c) => sum + c.backlinks, 0) / competitors.length
      )
    };
  }

  /**
   * Identifica gaps de contenido
   */
  private identifyContentGaps(competitors: OrganicResult[], keyword: string): string[] {
    const gaps: string[] = [];

    // Analizar longitud de contenido
    const avgContentLength = competitors.reduce((sum, c) => sum + c.contentLength, 0) / competitors.length;
    if (avgContentLength > 2000) {
      gaps.push(`Long-form content needed (average: ${Math.round(avgContentLength)} words)`);
    }

    // Analizar coincidencias de título
    const titleMatches = competitors.filter(c => c.titleMatch).length;
    if (titleMatches / competitors.length > 0.8) {
      gaps.push('Strong title optimization required - most competitors target keyword in title');
    }

    // Analizar densidad de keywords
    const avgKeywordDensity = competitors.reduce((sum, c) => sum + c.keywordDensity, 0) / competitors.length;
    if (avgKeywordDensity > 2) {
      gaps.push(`Higher keyword density needed (average: ${avgKeywordDensity.toFixed(1)}%)`);
    }

    // Analizar datos estructurados
    const structuredDataUsage = competitors.filter(c => c.structuredData).length;
    if (structuredDataUsage / competitors.length > 0.6) {
      gaps.push('Structured data implementation recommended - used by majority of competitors');
    }

    return gaps;
  }

  /**
   * Identifica gaps técnicos
   */
  private identifyTechnicalGaps(competitors: OrganicResult[]): string[] {
    const gaps: string[] = [];

    // Analizar velocidad de página
    const avgPageSpeed = competitors.reduce((sum, c) => sum + c.pageSpeed, 0) / competitors.length;
    if (avgPageSpeed > 80) {
      gaps.push(`High page speed required (average: ${Math.round(avgPageSpeed)})`);
    }

    // Analizar HTTPS
    const httpsUsage = competitors.filter(c => c.https).length;
    if (httpsUsage / competitors.length > 0.9) {
      gaps.push('HTTPS required - used by most competitors');
    }

    // Analizar optimización móvil
    const mobileOptimized = competitors.filter(c => c.mobileOptimized).length;
    if (mobileOptimized / competitors.length > 0.8) {
      gaps.push('Mobile optimization critical - standard among competitors');
    }

    return gaps;
  }

  /**
   * Identifica oportunidades de optimización
   */
  private identifyOptimizationOpportunities(
    competitors: OrganicResult[],
    averageMetrics: any
  ): string[] {
    const opportunities: string[] = [];

    // Buscar competidores débiles en top 10
    const weakCompetitors = competitors.filter(c => 
      c.domainAuthority < averageMetrics.domainAuthority * 0.8 ||
      c.contentLength < averageMetrics.contentLength * 0.7 ||
      c.pageSpeed < averageMetrics.pageSpeed * 0.8
    );

    if (weakCompetitors.length > 0) {
      opportunities.push(`${weakCompetitors.length} weak competitors in top 10 - opportunity to outrank`);
    }

    // Analizar gaps de backlinks
    const lowBacklinkCompetitors = competitors.filter(c => c.backlinks < averageMetrics.backlinks * 0.5);
    if (lowBacklinkCompetitors.length > 2) {
      opportunities.push('Several competitors have low backlink counts - link building opportunity');
    }

    // Analizar optimización de URL
    const urlOptimized = competitors.filter(c => c.urlMatch).length;
    if (urlOptimized / competitors.length < 0.5) {
      opportunities.push('URL optimization opportunity - few competitors optimize URLs');
    }

    return opportunities;
  }

  /**
   * Analiza competidores
   */
  private analyzeCompetitors(data: SerpAnalysisData): any {
    const competitors = data.organicResults;

    // Dominios dominantes
    const domainCounts: Record<string, number[]> = {};
    competitors.forEach(result => {
      if (!domainCounts[result.domain]) {
        domainCounts[result.domain] = [];
      }
      domainCounts[result.domain].push(result.position);
    });

    const dominantDomains = Object.entries(domainCounts)
      .map(([domain, positions]) => ({
        domain,
        positions,
        averagePosition: positions.reduce((sum, pos) => sum + pos, 0) / positions.length,
        marketShare: positions.length / competitors.length
      }))
      .filter(d => d.positions.length > 1)
      .sort((a, b) => b.marketShare - a.marketShare);

    // Competidor más débil y más fuerte
    const weakestCompetitor = competitors.reduce((weakest, current) => {
      const weakestScore = this.calculateCompetitorScore(weakest);
      const currentScore = this.calculateCompetitorScore(current);
      return currentScore < weakestScore ? current : weakest;
    });

    const strongestCompetitor = competitors.reduce((strongest, current) => {
      const strongestScore = this.calculateCompetitorScore(strongest);
      const currentScore = this.calculateCompetitorScore(current);
      return currentScore > strongestScore ? current : strongest;
    });

    // Patrones de contenido
    const contentPatterns = this.identifyContentPatterns(competitors);

    return {
      dominantDomains,
      weakestCompetitor,
      strongestCompetitor,
      contentPatterns
    };
  }

  /**
   * Calcula score de competidor
   */
  private calculateCompetitorScore(competitor: OrganicResult): number {
    return (
      competitor.domainAuthority * 0.3 +
      competitor.pageAuthority * 0.2 +
      Math.log10(competitor.backlinks + 1) * 10 * 0.2 +
      competitor.pageSpeed * 0.1 +
      competitor.contentLength / 100 * 0.1 +
      (competitor.structuredData ? 10 : 0) * 0.1
    );
  }

  /**
   * Identifica patrones de contenido
   */
  private identifyContentPatterns(competitors: OrganicResult[]): string[] {
    const patterns: string[] = [];

    // Patrón de longitud de contenido
    const avgLength = competitors.reduce((sum, c) => sum + c.contentLength, 0) / competitors.length;
    if (avgLength > 3000) {
      patterns.push('Long-form content dominates (3000+ words)');
    } else if (avgLength > 1500) {
      patterns.push('Medium-form content preferred (1500-3000 words)');
    } else {
      patterns.push('Short-form content acceptable (<1500 words)');
    }

    // Patrón de optimización de título
    const titleOptimized = competitors.filter(c => c.titleMatch).length;
    if (titleOptimized / competitors.length > 0.8) {
      patterns.push('Title optimization is standard practice');
    }

    // Patrón de datos estructurados
    const structuredData = competitors.filter(c => c.structuredData).length;
    if (structuredData / competitors.length > 0.6) {
      patterns.push('Structured data widely implemented');
    }

    return patterns;
  }

  /**
   * Genera recomendaciones
   */
  private generateRecommendations(
    overview: any,
    features: any,
    organicAnalysis: any,
    competitorInsights: any
  ): any {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const contentStrategy: string[] = [];
    const technicalSeo: string[] = [];

    // Recomendaciones inmediatas
    if (features.opportunities.length > 0) {
      immediate.push('Target featured snippet opportunities');
      immediate.push('Optimize for People Also Ask questions');
    }

    if (organicAnalysis.technicalGaps.includes('HTTPS required')) {
      immediate.push('Implement HTTPS if not already done');
    }

    // Recomendaciones a corto plazo
    if (organicAnalysis.averageMetrics.contentLength > 2000) {
      shortTerm.push('Create comprehensive, long-form content');
    }

    if (organicAnalysis.contentGaps.includes('Structured data implementation recommended')) {
      shortTerm.push('Implement relevant structured data markup');
    }

    // Recomendaciones a largo plazo
    if (organicAnalysis.averageMetrics.domainAuthority > 60) {
      longTerm.push('Build domain authority through quality backlinks');
    }

    if (overview.competitionLevel === 'high' || overview.competitionLevel === 'extreme') {
      longTerm.push('Consider targeting long-tail variations first');
    }

    // Estrategia de contenido
    contentStrategy.push('Create topic clusters around main keyword');
    contentStrategy.push('Address all People Also Ask questions');
    
    if (competitorInsights.contentPatterns.includes('Long-form content dominates')) {
      contentStrategy.push('Develop comprehensive, in-depth content (3000+ words)');
    }

    // SEO técnico
    technicalSeo.push('Optimize page speed to match or exceed competitors');
    technicalSeo.push('Ensure mobile optimization');
    
    if (organicAnalysis.averageMetrics.pageSpeed > 80) {
      technicalSeo.push('Prioritize page speed optimization (target 80+ score)');
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      contentStrategy,
      technicalSeo
    };
  }

  /**
   * Calcula dificultad basada en SERP
   */
  private calculateSerpDifficulty(data: SerpAnalysisData, organicAnalysis: any): any {
    const factors: Array<any> = [];
    let totalScore = 0;

    // Factor: Número de anuncios
    const paidAdsImpact = Math.min(40, data.paidResults.length * 10);
    factors.push({
      factor: 'Paid Advertisements',
      impact: paidAdsImpact,
      description: `${data.paidResults.length} paid ads reduce organic visibility`
    });
    totalScore += paidAdsImpact;

    // Factor: Features SERP
    const featuresImpact = Math.min(30, data.features.filter(f => f.present).length * 5);
    factors.push({
      factor: 'SERP Features',
      impact: featuresImpact,
      description: `${data.features.filter(f => f.present).length} SERP features compete for clicks`
    });
    totalScore += featuresImpact;

    // Factor: Fuerza de competidores
    const avgDA = organicAnalysis.averageMetrics.domainAuthority;
    const competitorStrengthImpact = Math.min(30, avgDA * 0.375); // 0.375 para que DA 80 = 30 puntos
    factors.push({
      factor: 'Competitor Strength',
      impact: competitorStrengthImpact,
      description: `Average competitor DA: ${avgDA}`
    });
    totalScore += competitorStrengthImpact;

    const score = Math.min(100, Math.round(totalScore));

    return { score, factors };
  }
}

export default SerpAnalyzer;
export type { 
  SerpFeature, 
  OrganicResult, 
  PaidResult, 
  LocalResult, 
  SerpAnalysisData, 
  SerpAnalysisResult 
};
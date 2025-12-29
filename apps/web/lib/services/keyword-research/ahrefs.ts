/**
 * Simulación del servicio Ahrefs API
 * Especializado en análisis de backlinks, keyword difficulty y content gap
 */

interface AhrefsKeywordData {
  keyword: string;
  volume: number;
  kd: number; // Keyword Difficulty (0-100)
  cpc: number;
  clicks: number;
  clicksPercentage: number;
  returnRate: number;
  parent_topic: string;
  traffic_potential: number;
  global_volume: Record<string, number>;
  serp_overview: {
    total_results: number;
    paid_results: number;
    featured_snippet: boolean;
    knowledge_panel: boolean;
    local_pack: boolean;
  };
}

interface AhrefsBacklinkData {
  domain: string;
  url_rating: number; // UR (0-100)
  domain_rating: number; // DR (0-100)
  backlinks: number;
  referring_domains: number;
  organic_keywords: number;
  organic_traffic: number;
  top_backlinks: Array<{
    source_url: string;
    target_url: string;
    anchor_text: string;
    domain_rating: number;
    url_rating: number;
    traffic: number;
    first_seen: string;
    last_seen: string;
  }>;
}

interface AhrefsContentGap {
  competitor_domains: string[];
  gap_keywords: Array<{
    keyword: string;
    volume: number;
    kd: number;
    your_position: number | null;
    competitor_positions: Record<string, number>;
    opportunity_score: number;
  }>;
  content_opportunities: Array<{
    topic: string;
    keywords_count: number;
    total_volume: number;
    avg_kd: number;
    content_type: string;
  }>;
}

interface AhrefsSiteExplorer {
  domain: string;
  domain_rating: number;
  backlinks: number;
  referring_domains: number;
  organic_keywords: number;
  organic_traffic: number;
  paid_keywords: number;
  paid_traffic: number;
  top_pages: Array<{
    url: string;
    traffic: number;
    keywords: number;
    backlinks: number;
    top_keyword: string;
  }>;
  competing_domains: Array<{
    domain: string;
    common_keywords: number;
    se_keywords: number;
    se_traffic: number;
  }>;
}

interface AhrefsRankTracker {
  project_id: string;
  keywords: Array<{
    keyword: string;
    current_position: number;
    previous_position: number;
    best_position: number;
    url: string;
    search_volume: number;
    kd: number;
    traffic: number;
    position_history: Array<{
      date: string;
      position: number;
    }>;
  }>;
  visibility_score: number;
  avg_position: number;
  keywords_in_top10: number;
  keywords_in_top3: number;
}

class AhrefsService {
  private baseUrl = 'https://apiv2.ahrefs.com';
  private apiKey: string;

  constructor(apiKey: string = 'simulated-ahrefs-key') {
    this.apiKey = apiKey;
  }

  /**
   * Obtiene datos de keyword con métricas de Ahrefs
   */
  async getKeywordData(keywords: string[], country: string = 'US'): Promise<AhrefsKeywordData[]> {
    await this.delay(1000 + Math.random() * 600);

    return keywords.map(keyword => this.generateKeywordData(keyword, country));
  }

  /**
   * Análisis de dificultad de keyword (KD)
   */
  async getKeywordDifficulty(keywords: string[]): Promise<Array<{ keyword: string; kd: number; analysis: any }>> {
    await this.delay(1200 + Math.random() * 700);

    return keywords.map(keyword => ({
      keyword,
      kd: this.calculateKD(keyword),
      analysis: this.generateKDAnalysis(keyword)
    }));
  }

  /**
   * Análisis de backlinks de dominio
   */
  async getBacklinkData(domain: string): Promise<AhrefsBacklinkData> {
    await this.delay(1500 + Math.random() * 800);

    return this.generateBacklinkData(domain);
  }

  /**
   * Análisis de content gap entre competidores
   */
  async getContentGap(yourDomain: string, competitors: string[]): Promise<AhrefsContentGap> {
    await this.delay(2000 + Math.random() * 1000);

    return this.generateContentGap(yourDomain, competitors);
  }

  /**
   * Site Explorer - análisis completo de dominio
   */
  async getSiteExplorer(domain: string): Promise<AhrefsSiteExplorer> {
    await this.delay(1800 + Math.random() * 900);

    return this.generateSiteExplorer(domain);
  }

  /**
   * Rank Tracker - seguimiento de posiciones
   */
  async getRankTracker(projectId: string): Promise<AhrefsRankTracker> {
    await this.delay(1000 + Math.random() * 500);

    return this.generateRankTracker(projectId);
  }

  /**
   * Obtiene keywords que rankean para múltiples competidores
   */
  async getCompetitorKeywords(competitors: string[], minCompetitors: number = 2): Promise<Array<{
    keyword: string;
    volume: number;
    kd: number;
    competitors: Array<{ domain: string; position: number; traffic: number }>;
  }>> {
    await this.delay(1400 + Math.random() * 700);

    return this.generateCompetitorKeywords(competitors, minCompetitors);
  }

  /**
   * Genera datos de keyword con métricas de Ahrefs
   */
  private generateKeywordData(keyword: string, country: string): AhrefsKeywordData {
    const volume = this.calculateVolume(keyword);
    const kd = this.calculateKD(keyword);
    const cpc = this.calculateCPC(keyword);
    const clicks = Math.round(volume * (0.3 + Math.random() * 0.4)); // 30-70% de clicks
    const clicksPercentage = Math.round((clicks / volume) * 100);
    const returnRate = Math.round(20 + Math.random() * 60); // 20-80% return rate

    return {
      keyword,
      volume,
      kd,
      cpc,
      clicks,
      clicksPercentage,
      returnRate,
      parent_topic: this.generateParentTopic(keyword),
      traffic_potential: Math.round(volume * (1.2 + Math.random() * 0.8)), // 120-200% del volumen
      global_volume: this.generateGlobalVolume(keyword, volume),
      serp_overview: this.generateSerpOverview(keyword)
    };
  }

  /**
   * Calcula Keyword Difficulty (KD) específico de Ahrefs
   */
  private calculateKD(keyword: string): number {
    const wordCount = keyword.split(' ').length;
    const volume = this.calculateVolume(keyword);
    const isCommercial = this.isCommercialKeyword(keyword);

    let kd = 25; // Base KD

    // Ajustar por volumen
    if (volume > 100000) kd += 30;
    else if (volume > 50000) kd += 25;
    else if (volume > 10000) kd += 20;
    else if (volume > 1000) kd += 10;
    else kd -= 5;

    // Ajustar por longitud (long-tail más fácil)
    if (wordCount > 4) kd -= 20;
    else if (wordCount > 3) kd -= 10;
    else if (wordCount === 1) kd += 15;

    // Ajustar por tipo comercial
    if (isCommercial) kd += 15;

    // Ajustar por industrias competitivas
    const competitiveIndustries = ['insurance', 'loan', 'lawyer', 'real estate', 'finance'];
    if (competitiveIndustries.some(industry => keyword.toLowerCase().includes(industry))) {
      kd += 20;
    }

    return Math.min(Math.max(Math.round(kd), 0), 100);
  }

  /**
   * Genera análisis detallado de KD
   */
  private generateKDAnalysis(keyword: string): any {
    const kd = this.calculateKD(keyword);
    const volume = this.calculateVolume(keyword);

    return {
      kd_score: kd,
      difficulty_level: this.getKDLevel(kd),
      referring_domains_needed: this.estimateReferringDomains(kd),
      top10_analysis: {
        avg_dr: Math.round(30 + (kd / 100) * 50), // DR promedio basado en KD
        avg_backlinks: Math.round(1000 + (kd / 100) * 50000),
        avg_referring_domains: Math.round(50 + (kd / 100) * 500)
      },
      serp_features: this.generateSerpFeatures(keyword),
      recommendations: this.generateKDRecommendations(kd, keyword),
      time_estimate: this.estimateRankingTime(kd),
      content_requirements: this.generateContentRequirements(kd, keyword)
    };
  }

  /**
   * Obtiene nivel de dificultad textual
   */
  private getKDLevel(kd: number): string {
    if (kd < 10) return 'Very Easy';
    if (kd < 20) return 'Easy';
    if (kd < 40) return 'Medium';
    if (kd < 60) return 'Hard';
    if (kd < 80) return 'Very Hard';
    return 'Super Hard';
  }

  /**
   * Estima dominios referentes necesarios
   */
  private estimateReferringDomains(kd: number): number {
    if (kd < 10) return Math.round(5 + Math.random() * 10);
    if (kd < 20) return Math.round(15 + Math.random() * 20);
    if (kd < 40) return Math.round(35 + Math.random() * 40);
    if (kd < 60) return Math.round(75 + Math.random() * 75);
    if (kd < 80) return Math.round(150 + Math.random() * 150);
    return Math.round(300 + Math.random() * 200);
  }

  /**
   * Genera datos de backlinks
   */
  private generateBacklinkData(domain: string): AhrefsBacklinkData {
    const dr = Math.round(20 + Math.random() * 70); // Domain Rating 20-90
    const ur = Math.round(dr * (0.8 + Math.random() * 0.4)); // URL Rating relacionado con DR
    const backlinks = Math.round(1000 + Math.random() * 500000);
    const referring_domains = Math.round(backlinks * (0.1 + Math.random() * 0.2));

    return {
      domain,
      url_rating: ur,
      domain_rating: dr,
      backlinks,
      referring_domains,
      organic_keywords: Math.round(5000 + Math.random() * 100000),
      organic_traffic: Math.round(10000 + Math.random() * 1000000),
      top_backlinks: this.generateTopBacklinks(domain, 10)
    };
  }

  /**
   * Genera top backlinks
   */
  private generateTopBacklinks(domain: string, count: number): Array<any> {
    const backlinks = [];
    const sources = [
      'techcrunch.com', 'forbes.com', 'entrepreneur.com', 'inc.com', 'wired.com',
      'mashable.com', 'venturebeat.com', 'businessinsider.com', 'fastcompany.com'
    ];

    for (let i = 0; i < count; i++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      backlinks.push({
        source_url: `https://${source}/article-${i + 1}`,
        target_url: `https://${domain}/page-${i + 1}`,
        anchor_text: this.generateAnchorText(domain),
        domain_rating: Math.round(60 + Math.random() * 30),
        url_rating: Math.round(40 + Math.random() * 40),
        traffic: Math.round(100 + Math.random() * 5000),
        first_seen: this.generateRandomDate(365),
        last_seen: this.generateRandomDate(30)
      });
    }

    return backlinks;
  }

  /**
   * Genera texto de anclaje realista
   */
  private generateAnchorText(domain: string): string {
    const anchorTypes = [
      domain,
      `visit ${domain}`,
      'click here',
      'learn more',
      'read more',
      'check this out',
      domain.replace('.com', '').replace('.org', ''),
      'this tool',
      'the platform'
    ];

    return anchorTypes[Math.floor(Math.random() * anchorTypes.length)];
  }

  /**
   * Genera análisis de content gap
   */
  private generateContentGap(yourDomain: string, competitors: string[]): AhrefsContentGap {
    const gapKeywords = this.generateGapKeywords(yourDomain, competitors);
    const contentOpportunities = this.generateContentOpportunities(gapKeywords);

    return {
      competitor_domains: competitors,
      gap_keywords: gapKeywords,
      content_opportunities: contentOpportunities
    };
  }

  /**
   * Genera keywords de gap de contenido
   */
  private generateGapKeywords(yourDomain: string, competitors: string[]): Array<any> {
    const baseKeywords = [
      'digital marketing', 'seo optimization', 'content strategy', 'social media marketing',
      'email marketing', 'conversion optimization', 'web analytics', 'ppc advertising',
      'brand management', 'customer acquisition', 'lead generation', 'marketing automation'
    ];

    return baseKeywords.map(keyword => {
      const volume = this.calculateVolume(keyword);
      const kd = this.calculateKD(keyword);
      const competitorPositions: Record<string, number> = {};

      competitors.forEach(competitor => {
        if (Math.random() > 0.3) { // 70% probabilidad de que el competidor rankee
          competitorPositions[competitor] = Math.round(1 + Math.random() * 50);
        }
      });

      const opportunityScore = this.calculateOpportunityScore(volume, kd, Object.keys(competitorPositions).length);

      return {
        keyword,
        volume,
        kd,
        your_position: Math.random() > 0.6 ? Math.round(1 + Math.random() * 100) : null,
        competitor_positions: competitorPositions,
        opportunity_score: opportunityScore
      };
    });
  }

  /**
   * Calcula score de oportunidad
   */
  private calculateOpportunityScore(volume: number, kd: number, competitorCount: number): number {
    let score = 50; // Base score

    // Ajustar por volumen
    if (volume > 10000) score += 20;
    else if (volume > 1000) score += 10;
    else score -= 10;

    // Ajustar por dificultad (invertido)
    score += (100 - kd) * 0.3;

    // Ajustar por número de competidores
    score += competitorCount * 5;

    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  /**
   * Genera oportunidades de contenido
   */
  private generateContentOpportunities(gapKeywords: Array<any>): Array<any> {
    const topics = [
      { topic: 'SEO Fundamentals', type: 'Educational Guide' },
      { topic: 'Digital Marketing Strategy', type: 'Strategy Guide' },
      { topic: 'Content Marketing', type: 'How-to Guide' },
      { topic: 'Social Media Optimization', type: 'Best Practices' },
      { topic: 'Conversion Rate Optimization', type: 'Case Study' }
    ];

    return topics.map(({ topic, type }) => {
      const relatedKeywords = gapKeywords.filter(kw => 
        kw.keyword.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
      );

      return {
        topic,
        keywords_count: relatedKeywords.length,
        total_volume: relatedKeywords.reduce((sum, kw) => sum + kw.volume, 0),
        avg_kd: Math.round(relatedKeywords.reduce((sum, kw) => sum + kw.kd, 0) / relatedKeywords.length) || 0,
        content_type: type
      };
    });
  }

  /**
   * Genera datos de Site Explorer
   */
  private generateSiteExplorer(domain: string): AhrefsSiteExplorer {
    const dr = Math.round(30 + Math.random() * 60);
    const organicTraffic = Math.round(10000 + Math.random() * 500000);

    return {
      domain,
      domain_rating: dr,
      backlinks: Math.round(5000 + Math.random() * 200000),
      referring_domains: Math.round(500 + Math.random() * 10000),
      organic_keywords: Math.round(2000 + Math.random() * 50000),
      organic_traffic: organicTraffic,
      paid_keywords: Math.round(100 + Math.random() * 5000),
      paid_traffic: Math.round(organicTraffic * 0.1 * (0.5 + Math.random())),
      top_pages: this.generateTopPages(domain, 10),
      competing_domains: this.generateCompetingDomains(domain, 10)
    };
  }

  /**
   * Genera páginas principales
   */
  private generateTopPages(domain: string, count: number): Array<any> {
    const pages = [];
    const pageTypes = ['blog', 'product', 'service', 'about', 'contact', 'pricing', 'features'];

    for (let i = 0; i < count; i++) {
      const pageType = pageTypes[Math.floor(Math.random() * pageTypes.length)];
      pages.push({
        url: `https://${domain}/${pageType}-${i + 1}`,
        traffic: Math.round(1000 + Math.random() * 10000),
        keywords: Math.round(50 + Math.random() * 500),
        backlinks: Math.round(10 + Math.random() * 100),
        top_keyword: `${pageType} keyword ${i + 1}`
      });
    }

    return pages.sort((a, b) => b.traffic - a.traffic);
  }

  /**
   * Genera dominios competidores
   */
  private generateCompetingDomains(domain: string, count: number): Array<any> {
    const competitors = [
      'competitor1.com', 'competitor2.com', 'competitor3.com', 'competitor4.com',
      'competitor5.com', 'competitor6.com', 'competitor7.com', 'competitor8.com'
    ];

    return competitors.slice(0, count).map(competitor => ({
      domain: competitor,
      common_keywords: Math.round(100 + Math.random() * 2000),
      se_keywords: Math.round(1000 + Math.random() * 20000),
      se_traffic: Math.round(5000 + Math.random() * 100000)
    }));
  }

  /**
   * Genera datos de Rank Tracker
   */
  private generateRankTracker(projectId: string): AhrefsRankTracker {
    const keywords = this.generateTrackedKeywords(20);
    const avgPosition = keywords.reduce((sum, kw) => sum + kw.current_position, 0) / keywords.length;
    const keywordsInTop10 = keywords.filter(kw => kw.current_position <= 10).length;
    const keywordsInTop3 = keywords.filter(kw => kw.current_position <= 3).length;

    return {
      project_id: projectId,
      keywords,
      visibility_score: Math.round(100 - (avgPosition - 1) * 2), // Score basado en posición promedio
      avg_position: Math.round(avgPosition * 10) / 10,
      keywords_in_top10: keywordsInTop10,
      keywords_in_top3: keywordsInTop3
    };
  }

  /**
   * Genera keywords trackeadas
   */
  private generateTrackedKeywords(count: number): Array<any> {
    const baseKeywords = [
      'seo tools', 'keyword research', 'backlink analysis', 'rank tracking',
      'content optimization', 'technical seo', 'local seo', 'mobile seo'
    ];

    return baseKeywords.slice(0, count).map(keyword => {
      const currentPosition = Math.round(1 + Math.random() * 100);
      const previousPosition = Math.round(1 + Math.random() * 100);
      const bestPosition = Math.min(currentPosition, Math.round(1 + Math.random() * 50));

      return {
        keyword,
        current_position: currentPosition,
        previous_position: previousPosition,
        best_position: bestPosition,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
        search_volume: this.calculateVolume(keyword),
        kd: this.calculateKD(keyword),
        traffic: this.calculateTrafficFromPosition(this.calculateVolume(keyword), currentPosition),
        position_history: this.generatePositionHistory(keyword, 30)
      };
    });
  }

  /**
   * Calcula tráfico basado en posición
   */
  private calculateTrafficFromPosition(volume: number, position: number): number {
    const ctrByPosition: Record<number, number> = {
      1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.07,
      6: 0.05, 7: 0.04, 8: 0.03, 9: 0.025, 10: 0.02
    };

    const ctr = ctrByPosition[position] || (position <= 20 ? 0.01 : 0.005);
    return Math.round(volume * ctr);
  }

  /**
   * Genera historial de posiciones
   */
  private generatePositionHistory(keyword: string, days: number): Array<{ date: string; position: number }> {
    const history = [];
    const currentDate = new Date();
    let currentPosition = Math.round(1 + Math.random() * 100);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      // Simular cambios graduales en posición
      const change = Math.round((Math.random() - 0.5) * 10); // ±5 posiciones
      currentPosition = Math.max(1, Math.min(100, currentPosition + change));

      history.push({
        date: date.toISOString().split('T')[0],
        position: currentPosition
      });
    }

    return history;
  }

  /**
   * Genera keywords de competidores
   */
  private generateCompetitorKeywords(competitors: string[], minCompetitors: number): Array<any> {
    const baseKeywords = [
      'digital marketing tools', 'seo software', 'keyword planner', 'backlink checker',
      'rank tracker', 'content analyzer', 'competitor research', 'site audit'
    ];

    return baseKeywords.map(keyword => {
      const volume = this.calculateVolume(keyword);
      const kd = this.calculateKD(keyword);
      const competitorData = [];

      // Seleccionar competidores aleatorios que rankean para esta keyword
      const rankingCompetitors = competitors
        .sort(() => 0.5 - Math.random())
        .slice(0, minCompetitors + Math.floor(Math.random() * (competitors.length - minCompetitors)));

      for (const competitor of rankingCompetitors) {
        const position = Math.round(1 + Math.random() * 50);
        const traffic = this.calculateTrafficFromPosition(volume, position);

        competitorData.push({
          domain: competitor,
          position,
          traffic
        });
      }

      return {
        keyword,
        volume,
        kd,
        competitors: competitorData.sort((a, b) => a.position - b.position)
      };
    });
  }

  // Métodos auxiliares compartidos

  private calculateVolume(keyword: string): number {
    const wordCount = keyword.split(' ').length;
    let baseVolume: number;

    if (wordCount === 1) {
      baseVolume = 15000 + Math.random() * 85000;
    } else if (wordCount === 2) {
      baseVolume = 3000 + Math.random() * 22000;
    } else if (wordCount === 3) {
      baseVolume = 800 + Math.random() * 7200;
    } else {
      baseVolume = 50 + Math.random() * 1950;
    }

    return Math.round(baseVolume);
  }

  private calculateCPC(keyword: string): number {
    let baseCpc = 0.8 + Math.random() * 2.2;

    if (this.isCommercialKeyword(keyword)) {
      baseCpc *= 2.2;
    }

    const highCpcIndustries = ['insurance', 'loan', 'lawyer', 'attorney', 'mortgage'];
    if (highCpcIndustries.some(industry => keyword.toLowerCase().includes(industry))) {
      baseCpc *= 4;
    }

    return Math.round(baseCpc * 100) / 100;
  }

  private isCommercialKeyword(keyword: string): boolean {
    const commercialTerms = [
      'buy', 'purchase', 'price', 'cost', 'cheap', 'discount', 'sale',
      'best', 'top', 'review', 'compare', 'vs', 'alternative'
    ];
    return commercialTerms.some(term => keyword.toLowerCase().includes(term));
  }

  private generateParentTopic(keyword: string): string {
    const words = keyword.split(' ');
    const mainWord = words[0];
    return `${mainWord} marketing`;
  }

  private generateGlobalVolume(keyword: string, baseVolume: number): Record<string, number> {
    const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'BR', 'IN'];
    const globalVolume: Record<string, number> = {};

    countries.forEach(country => {
      const multiplier = country === 'US' ? 1 : (0.1 + Math.random() * 0.8);
      globalVolume[country] = Math.round(baseVolume * multiplier);
    });

    return globalVolume;
  }

  private generateSerpOverview(keyword: string): any {
    return {
      total_results: Math.round(1000000 + Math.random() * 50000000),
      paid_results: Math.round(Math.random() * 8),
      featured_snippet: Math.random() > 0.7,
      knowledge_panel: Math.random() > 0.8,
      local_pack: Math.random() > 0.6
    };
  }

  private generateSerpFeatures(keyword: string): string[] {
    const allFeatures = [
      'featured_snippet', 'people_also_ask', 'local_pack', 'knowledge_panel',
      'image_pack', 'video_carousel', 'shopping_results', 'news_results'
    ];

    return allFeatures.filter(() => Math.random() > 0.6);
  }

  private generateKDRecommendations(kd: number, keyword: string): string[] {
    const recommendations = [];

    if (kd > 70) {
      recommendations.push('Focus on building high-quality backlinks from authoritative domains');
      recommendations.push('Create comprehensive, expert-level content');
      recommendations.push('Consider targeting long-tail variations first');
    } else if (kd > 40) {
      recommendations.push('Develop in-depth, well-researched content');
      recommendations.push('Build relevant backlinks through outreach');
      recommendations.push('Optimize for user intent and experience');
    } else {
      recommendations.push('Good opportunity for content-focused SEO');
      recommendations.push('Focus on on-page optimization');
      recommendations.push('Consider expanding to related keywords');
    }

    return recommendations;
  }

  private estimateRankingTime(kd: number): string {
    if (kd < 20) return '2-4 months';
    if (kd < 40) return '4-8 months';
    if (kd < 60) return '8-12 months';
    if (kd < 80) return '12-18 months';
    return '18+ months';
  }

  private generateContentRequirements(kd: number, keyword: string): any {
    return {
      min_word_count: kd < 30 ? 1500 : kd < 60 ? 2500 : 4000,
      content_depth: kd < 30 ? 'Basic' : kd < 60 ? 'Comprehensive' : 'Expert-level',
      backlinks_needed: this.estimateReferringDomains(kd),
      content_type: this.suggestContentType(keyword),
      update_frequency: kd > 60 ? 'Monthly' : 'Quarterly'
    };
  }

  private suggestContentType(keyword: string): string {
    if (keyword.includes('how to')) return 'Tutorial/Guide';
    if (keyword.includes('best') || keyword.includes('top')) return 'Listicle/Review';
    if (keyword.includes('vs') || keyword.includes('compare')) return 'Comparison';
    if (keyword.includes('what is')) return 'Definition/Explanation';
    return 'Informational Article';
  }

  private generateRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().split('T')[0];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default AhrefsService;
export type {
  AhrefsKeywordData,
  AhrefsBacklinkData,
  AhrefsContentGap,
  AhrefsSiteExplorer,
  AhrefsRankTracker
};
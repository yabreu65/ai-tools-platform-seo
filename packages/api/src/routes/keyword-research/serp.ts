import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validación para análisis SERP
const serpSchema = z.object({
  keyword: z.string().min(1, 'Keyword es requerida'),
  location: z.string().default('United States'),
  language: z.string().default('en'),
  device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
  include_paid_results: z.boolean().default(false),
  include_local_results: z.boolean().default(true),
  include_features_analysis: z.boolean().default(true),
  depth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed')
});

interface SerpFeature {
  type: string;
  position: number;
  title?: string;
  description?: string;
  url?: string;
  data?: any;
}

interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  display_url: string;
  cached_url?: string;
  serp_features: string[];
  metrics: {
    domain_authority: number;
    page_authority: number;
    trust_score: number;
    spam_score: number;
    backlinks: number;
    referring_domains: number;
    organic_keywords: number;
    organic_traffic: number;
  };
  technical_metrics: {
    page_speed: number;
    mobile_friendly: boolean;
    https: boolean;
    structured_data: boolean;
    amp: boolean;
    content_length: number;
    images_count: number;
    internal_links: number;
    external_links: number;
  };
  content_analysis: {
    title_length: number;
    description_length: number;
    h1_count: number;
    h2_count: number;
    keyword_density: number;
    readability_score: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

interface PaidResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  display_url: string;
  ad_extensions: string[];
  estimated_cpc: number;
}

interface LocalResult {
  position: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  reviews_count: number;
  category: string;
  distance?: string;
}

interface CompetitorInsight {
  domain: string;
  positions: number[];
  avg_position: number;
  visibility_score: number;
  market_share: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface ContentGap {
  topic: string;
  missing_in_top_results: boolean;
  opportunity_score: number;
  suggested_content: string;
  target_position: number;
}

interface SerpAnalysis {
  keyword: string;
  search_params: {
    location: string;
    language: string;
    device: string;
  };
  serp_features: SerpFeature[];
  organic_results: OrganicResult[];
  paid_results: PaidResult[];
  local_results: LocalResult[];
  serp_metrics: {
    total_results: number;
    organic_results_count: number;
    paid_results_count: number;
    local_results_count: number;
    features_count: number;
    avg_domain_authority: number;
    avg_page_authority: number;
    competition_level: 'low' | 'medium' | 'high' | 'very_high';
    serp_volatility: number;
  };
  competitor_analysis: CompetitorInsight[];
  content_analysis: {
    avg_content_length: number;
    common_topics: string[];
    content_gaps: ContentGap[];
    title_patterns: string[];
    meta_patterns: string[];
  };
  opportunities: {
    ranking_opportunities: string[];
    content_opportunities: string[];
    technical_opportunities: string[];
    serp_feature_opportunities: string[];
  };
  insights: {
    type: 'opportunity' | 'warning' | 'info';
    message: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// Función para generar features SERP
const generateSerpFeatures = (keyword: string, device: string): SerpFeature[] => {
  const features: SerpFeature[] = [];
  
  // Featured Snippet (más común en desktop)
  if (Math.random() > (device === 'mobile' ? 0.7 : 0.6)) {
    features.push({
      type: 'featured_snippet',
      position: 0,
      title: `What is ${keyword}?`,
      description: `${keyword} is a comprehensive solution that helps businesses optimize their digital presence...`,
      url: 'https://example.com/what-is-' + keyword.replace(/\s+/g, '-')
    });
  }
  
  // People Also Ask
  if (Math.random() > 0.4) {
    const questions = [
      `How does ${keyword} work?`,
      `What are the benefits of ${keyword}?`,
      `Is ${keyword} worth it?`,
      `How much does ${keyword} cost?`
    ];
    
    features.push({
      type: 'people_also_ask',
      position: Math.floor(Math.random() * 5) + 2,
      data: {
        questions: questions.slice(0, Math.floor(Math.random() * 3) + 2)
      }
    });
  }
  
  // Images
  if (Math.random() > 0.3) {
    features.push({
      type: 'images',
      position: Math.floor(Math.random() * 8) + 1,
      data: {
        images_count: Math.floor(Math.random() * 8) + 4
      }
    });
  }
  
  // Videos (más común para tutorials)
  if (keyword.includes('how to') || keyword.includes('tutorial') || Math.random() > 0.7) {
    features.push({
      type: 'videos',
      position: Math.floor(Math.random() * 6) + 2,
      data: {
        videos_count: Math.floor(Math.random() * 4) + 2,
        source: 'YouTube'
      }
    });
  }
  
  // Related Searches
  if (Math.random() > 0.2) {
    const relatedSearches = [
      `${keyword} tutorial`,
      `${keyword} guide`,
      `${keyword} examples`,
      `${keyword} vs alternatives`,
      `best ${keyword}`,
      `${keyword} pricing`,
      `${keyword} reviews`,
      `free ${keyword}`
    ];
    
    features.push({
      type: 'related_searches',
      position: 20, // Al final
      data: {
        searches: relatedSearches.slice(0, Math.floor(Math.random() * 4) + 4)
      }
    });
  }
  
  // Sitelinks (solo para branded searches o dominios fuertes)
  if (Math.random() > 0.8) {
    features.push({
      type: 'sitelinks',
      position: 1,
      data: {
        main_result: `Official ${keyword} Website`,
        sitelinks: [
          'Features', 'Pricing', 'Documentation', 'Support', 'Login', 'Sign Up'
        ].slice(0, Math.floor(Math.random() * 4) + 3)
      }
    });
  }
  
  // Knowledge Panel (para entidades conocidas)
  if (Math.random() > 0.9) {
    features.push({
      type: 'knowledge_panel',
      position: 0, // Lado derecho
      data: {
        title: keyword,
        description: `Information about ${keyword}`,
        source: 'Wikipedia'
      }
    });
  }
  
  return features.sort((a, b) => a.position - b.position);
};

// Función para generar resultados orgánicos
const generateOrganicResults = (keyword: string, count: number = 10): OrganicResult[] => {
  const domains = [
    'wikipedia.org', 'stackoverflow.com', 'github.com', 'medium.com', 'dev.to',
    'techcrunch.com', 'mashable.com', 'wired.com', 'ahrefs.com', 'semrush.com',
    'moz.com', 'searchengineland.com', 'hubspot.com', 'neil-patel.com',
    'backlinko.com', 'contentking.com', 'screaming-frog.co.uk'
  ];
  
  const results: OrganicResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const position = i + 1;
    
    // Métricas más altas para posiciones superiores
    const positionFactor = (11 - position) / 10;
    const domainAuthority = Math.floor((Math.random() * 30 + 50) * positionFactor);
    const pageAuthority = Math.floor((Math.random() * 25 + 35) * positionFactor);
    
    // SERP features más comunes en top positions
    const possibleFeatures = ['sitelinks', 'reviews', 'faq', 'breadcrumbs', 'structured_data'];
    const serpFeatures = possibleFeatures.filter(() => Math.random() > (0.5 + position * 0.05));
    
    // Métricas técnicas
    const pageSpeed = Math.round((1.5 + Math.random() * 2 + (position * 0.1)) * 100) / 100;
    const contentLength = Math.floor(Math.random() * 3000 + 1000 + (positionFactor * 1000));
    
    // Análisis de contenido
    const titleLength = Math.floor(Math.random() * 30 + 40);
    const descriptionLength = Math.floor(Math.random() * 50 + 120);
    const keywordDensity = Math.round((Math.random() * 3 + 1) * 100) / 100;
    
    results.push({
      position,
      title: `${keyword} - Complete Guide ${position === 1 ? '2024' : ''} | ${domain.split('.')[0]}`,
      url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
      domain,
      description: `Learn everything about ${keyword}. Comprehensive guide with examples, best practices, and expert insights. Updated for 2024.`,
      display_url: `${domain} › ${keyword.replace(/\s+/g, '-')}`,
      cached_url: `https://webcache.googleusercontent.com/search?q=cache:${domain}`,
      serp_features: serpFeatures,
      metrics: {
        domain_authority: domainAuthority,
        page_authority: pageAuthority,
        trust_score: Math.floor(Math.random() * 30 + 60),
        spam_score: Math.floor(Math.random() * 20),
        backlinks: Math.floor(Math.random() * 50000 * positionFactor + 1000),
        referring_domains: Math.floor(Math.random() * 5000 * positionFactor + 100),
        organic_keywords: Math.floor(Math.random() * 100000 * positionFactor + 5000),
        organic_traffic: Math.floor(Math.random() * 1000000 * positionFactor + 10000)
      },
      technical_metrics: {
        page_speed: pageSpeed,
        mobile_friendly: Math.random() > 0.1,
        https: Math.random() > 0.05,
        structured_data: serpFeatures.includes('structured_data'),
        amp: Math.random() > 0.8,
        content_length: contentLength,
        images_count: Math.floor(Math.random() * 20 + 5),
        internal_links: Math.floor(Math.random() * 50 + 10),
        external_links: Math.floor(Math.random() * 20 + 5)
      },
      content_analysis: {
        title_length: titleLength,
        description_length: descriptionLength,
        h1_count: 1,
        h2_count: Math.floor(Math.random() * 8 + 3),
        keyword_density: keywordDensity,
        readability_score: Math.floor(Math.random() * 40 + 60),
        sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
      }
    });
  }
  
  return results;
};

// Función para generar resultados pagados
const generatePaidResults = (keyword: string, includePaid: boolean): PaidResult[] => {
  if (!includePaid || Math.random() > 0.7) return [];
  
  const adDomains = [
    'shopify.com', 'wordpress.com', 'wix.com', 'squarespace.com',
    'hubspot.com', 'salesforce.com', 'mailchimp.com', 'canva.com'
  ];
  
  const results: PaidResult[] = [];
  const adCount = Math.floor(Math.random() * 4) + 1;
  
  for (let i = 0; i < adCount; i++) {
    const domain = adDomains[Math.floor(Math.random() * adDomains.length)];
    const extensions = ['Free Trial', 'Get Started', '30-Day Free', 'Sign Up Now'];
    const selectedExtensions = extensions.filter(() => Math.random() > 0.6);
    
    results.push({
      position: i + 1,
      title: `${keyword} Solution - Start Free Trial | ${domain.split('.')[0]}`,
      url: `https://${domain}/landing/${keyword.replace(/\s+/g, '-')}`,
      domain,
      description: `Get started with ${keyword} today. Free trial available. Trusted by 1M+ users worldwide.`,
      display_url: `${domain}/landing`,
      ad_extensions: selectedExtensions,
      estimated_cpc: Math.round((Math.random() * 15 + 2) * 100) / 100
    });
  }
  
  return results;
};

// Función para generar resultados locales
const generateLocalResults = (keyword: string, includeLocal: boolean): LocalResult[] => {
  if (!includeLocal || !keyword.includes('near') && Math.random() > 0.3) return [];
  
  const businessTypes = [
    'Digital Marketing Agency', 'SEO Company', 'Web Design Studio',
    'Marketing Consultant', 'Software Company', 'Training Center'
  ];
  
  const results: LocalResult[] = [];
  const localCount = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < localCount; i++) {
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    
    results.push({
      position: i + 1,
      name: `${keyword} ${businessType}`,
      address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, State 12345`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://local-${keyword.replace(/\s+/g, '')}-${i + 1}.com`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviews_count: Math.floor(Math.random() * 500) + 50,
      category: businessType,
      distance: `${Math.round((Math.random() * 10 + 0.5) * 10) / 10} mi`
    });
  }
  
  return results;
};

// Función para analizar competidores
const analyzeCompetitors = (organicResults: OrganicResult[]): CompetitorInsight[] => {
  const competitorMap = new Map<string, OrganicResult[]>();
  
  // Agrupar resultados por dominio
  organicResults.forEach(result => {
    const domain = result.domain;
    if (!competitorMap.has(domain)) {
      competitorMap.set(domain, []);
    }
    competitorMap.get(domain)!.push(result);
  });
  
  const insights: CompetitorInsight[] = [];
  
  competitorMap.forEach((results, domain) => {
    const positions = results.map(r => r.position);
    const avgPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    const bestPosition = Math.min(...positions);
    
    // Calcular visibility score (mejor posición = mayor visibilidad)
    const visibilityScore = Math.round((11 - avgPosition) * 10);
    
    // Market share aproximado basado en posiciones
    const marketShare = Math.round((11 - avgPosition) * 2);
    
    // Analizar fortalezas y debilidades
    const avgMetrics = {
      da: results.reduce((sum, r) => sum + r.metrics.domain_authority, 0) / results.length,
      pa: results.reduce((sum, r) => sum + r.metrics.page_authority, 0) / results.length,
      backlinks: results.reduce((sum, r) => sum + r.metrics.backlinks, 0) / results.length,
      contentLength: results.reduce((sum, r) => sum + r.technical_metrics.content_length, 0) / results.length
    };
    
    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    
    if (avgMetrics.da > 70) strengths.push('Alta autoridad de dominio');
    else if (avgMetrics.da < 40) weaknesses.push('Baja autoridad de dominio');
    
    if (avgMetrics.backlinks > 10000) strengths.push('Fuerte perfil de backlinks');
    else if (avgMetrics.backlinks < 1000) weaknesses.push('Perfil de backlinks débil');
    
    if (avgMetrics.contentLength > 2000) strengths.push('Contenido extenso y detallado');
    else if (avgMetrics.contentLength < 1000) weaknesses.push('Contenido superficial');
    
    if (bestPosition > 5) opportunities.push('Oportunidad de superar en top 5');
    if (results.some(r => !r.technical_metrics.mobile_friendly)) {
      opportunities.push('Ventaja en optimización móvil');
    }
    
    insights.push({
      domain,
      positions,
      avg_position: Math.round(avgPosition * 10) / 10,
      visibility_score: visibilityScore,
      market_share: marketShare,
      strengths,
      weaknesses,
      opportunities
    });
  });
  
  return insights.sort((a, b) => a.avg_position - b.avg_position);
};

// Función para analizar contenido y gaps
const analyzeContent = (organicResults: OrganicResult[], keyword: string) => {
  const avgContentLength = Math.round(
    organicResults.reduce((sum, r) => sum + r.technical_metrics.content_length, 0) / organicResults.length
  );
  
  // Temas comunes basados en el keyword
  const commonTopics = [
    `${keyword} basics`,
    `${keyword} benefits`,
    `${keyword} best practices`,
    `${keyword} examples`,
    `${keyword} tutorial`,
    `${keyword} guide`,
    `${keyword} tips`,
    `${keyword} tools`,
    `${keyword} comparison`,
    `${keyword} pricing`
  ];
  
  // Content gaps (oportunidades de contenido no cubiertas)
  const contentGaps: ContentGap[] = [
    {
      topic: `Advanced ${keyword} strategies`,
      missing_in_top_results: true,
      opportunity_score: 85,
      suggested_content: `Create comprehensive guide on advanced ${keyword} techniques`,
      target_position: 3
    },
    {
      topic: `${keyword} case studies`,
      missing_in_top_results: true,
      opportunity_score: 78,
      suggested_content: `Develop real-world case studies and success stories`,
      target_position: 5
    },
    {
      topic: `${keyword} tools comparison`,
      missing_in_top_results: Math.random() > 0.5,
      opportunity_score: 72,
      suggested_content: `Create detailed comparison of ${keyword} tools and platforms`,
      target_position: 4
    },
    {
      topic: `${keyword} ROI calculator`,
      missing_in_top_results: true,
      opportunity_score: 90,
      suggested_content: `Build interactive ROI calculator for ${keyword}`,
      target_position: 2
    }
  ];
  
  // Patrones de títulos
  const titlePatterns = [
    `Complete Guide to ${keyword}`,
    `${keyword}: Everything You Need to Know`,
    `Best ${keyword} Practices`,
    `How to Master ${keyword}`,
    `${keyword} Tutorial for Beginners`
  ];
  
  // Patrones de meta descriptions
  const metaPatterns = [
    `Learn ${keyword} with our comprehensive guide`,
    `Discover the best ${keyword} strategies and techniques`,
    `Master ${keyword} with expert tips and examples`,
    `Complete ${keyword} tutorial with step-by-step instructions`
  ];
  
  return {
    avg_content_length: avgContentLength,
    common_topics: commonTopics.slice(0, 6),
    content_gaps: contentGaps.filter(gap => gap.missing_in_top_results || Math.random() > 0.7),
    title_patterns: titlePatterns,
    meta_patterns: metaPatterns
  };
};

// POST /api/keyword-research/serp/analyze
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = serpSchema.parse(req.body);
    
    const {
      keyword,
      location,
      language,
      device,
      include_paid_results,
      include_local_results,
      include_features_analysis,
      depth
    } = validatedData;

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

    // Generar datos SERP
    const serpFeatures = include_features_analysis ? generateSerpFeatures(keyword, device) : [];
    const organicResults = generateOrganicResults(keyword, depth === 'basic' ? 5 : depth === 'detailed' ? 10 : 15);
    const paidResults = generatePaidResults(keyword, include_paid_results);
    const localResults = generateLocalResults(keyword, include_local_results);
    
    // Calcular métricas SERP
    const avgDA = Math.round(organicResults.reduce((sum, r) => sum + r.metrics.domain_authority, 0) / organicResults.length);
    const avgPA = Math.round(organicResults.reduce((sum, r) => sum + r.metrics.page_authority, 0) / organicResults.length);
    
    // Determinar nivel de competencia
    let competitionLevel: 'low' | 'medium' | 'high' | 'very_high' = 'medium';
    if (avgDA > 80) competitionLevel = 'very_high';
    else if (avgDA > 65) competitionLevel = 'high';
    else if (avgDA > 45) competitionLevel = 'medium';
    else competitionLevel = 'low';
    
    // Calcular volatilidad SERP (simulada)
    const serpVolatility = Math.floor(Math.random() * 100);
    
    const serpMetrics = {
      total_results: Math.floor(Math.random() * 10000000) + 1000000,
      organic_results_count: organicResults.length,
      paid_results_count: paidResults.length,
      local_results_count: localResults.length,
      features_count: serpFeatures.length,
      avg_domain_authority: avgDA,
      avg_page_authority: avgPA,
      competition_level: competitionLevel,
      serp_volatility: serpVolatility
    };
    
    // Análisis de competidores
    const competitorAnalysis = depth !== 'basic' ? analyzeCompetitors(organicResults) : [];
    
    // Análisis de contenido
    const contentAnalysis = depth === 'comprehensive' ? analyzeContent(organicResults, keyword) : {
      avg_content_length: 0,
      common_topics: [],
      content_gaps: [],
      title_patterns: [],
      meta_patterns: []
    };
    
    // Generar oportunidades
    const opportunities = {
      ranking_opportunities: [] as string[],
      content_opportunities: [] as string[],
      technical_opportunities: [] as string[],
      serp_feature_opportunities: [] as string[]
    };
    
    // Oportunidades de ranking
    if (competitionLevel === 'low' || competitionLevel === 'medium') {
      opportunities.ranking_opportunities.push('Competencia moderada - buena oportunidad de ranking');
    }
    
    const weakCompetitors = organicResults.filter(r => r.metrics.domain_authority < 50).length;
    if (weakCompetitors > 3) {
      opportunities.ranking_opportunities.push(`${weakCompetitors} competidores con DA bajo - oportunidad de superarlos`);
    }
    
    // Oportunidades de contenido
    if (contentAnalysis.avg_content_length > 0) {
      if (contentAnalysis.avg_content_length < 1500) {
        opportunities.content_opportunities.push('Crear contenido más extenso que la competencia');
      }
      
      contentAnalysis.content_gaps.forEach(gap => {
        opportunities.content_opportunities.push(gap.suggested_content);
      });
    }
    
    // Oportunidades técnicas
    const slowSites = organicResults.filter(r => r.technical_metrics.page_speed > 3).length;
    if (slowSites > 3) {
      opportunities.technical_opportunities.push('Ventaja competitiva con mejor velocidad de carga');
    }
    
    const nonMobileFriendly = organicResults.filter(r => !r.technical_metrics.mobile_friendly).length;
    if (nonMobileFriendly > 0) {
      opportunities.technical_opportunities.push('Oportunidad con mejor optimización móvil');
    }
    
    // Oportunidades SERP features
    if (!serpFeatures.some(f => f.type === 'featured_snippet')) {
      opportunities.serp_feature_opportunities.push('Oportunidad de capturar featured snippet');
    }
    
    if (!serpFeatures.some(f => f.type === 'people_also_ask')) {
      opportunities.serp_feature_opportunities.push('Optimizar para People Also Ask');
    }
    
    // Generar insights
    const insights = [];
    
    if (competitionLevel === 'very_high') {
      insights.push({
        type: 'warning' as const,
        message: 'Competencia muy alta detectada en SERP',
        recommendation: 'Considerar keywords long-tail o nichos específicos',
        priority: 'high' as const
      });
    }
    
    if (serpFeatures.length > 5) {
      insights.push({
        type: 'info' as const,
        message: `${serpFeatures.length} SERP features detectadas`,
        recommendation: 'Optimizar contenido para capturar features específicas',
        priority: 'medium' as const
      });
    }
    
    if (paidResults.length > 3) {
      insights.push({
        type: 'info' as const,
        message: 'Alta actividad de anuncios pagados',
        recommendation: 'Keyword con alto valor comercial - considerar PPC',
        priority: 'medium' as const
      });
    }
    
    const topResult = organicResults[0];
    if (topResult && topResult.metrics.domain_authority < 60) {
      insights.push({
        type: 'opportunity' as const,
        message: 'Resultado #1 con autoridad moderada',
        recommendation: 'Oportunidad realista de alcanzar top position',
        priority: 'high' as const
      });
    }

    const analysis: SerpAnalysis = {
      keyword,
      search_params: {
        location,
        language,
        device
      },
      serp_features: serpFeatures,
      organic_results: organicResults,
      paid_results: paidResults,
      local_results: localResults,
      serp_metrics: serpMetrics,
      competitor_analysis: competitorAnalysis,
      content_analysis: contentAnalysis,
      opportunities,
      insights
    };

    res.json({
      success: true,
      data: analysis,
      analysis_params: {
        keyword,
        location,
        language,
        device,
        depth,
        analysis_scope: {
          paid_results: include_paid_results,
          local_results: include_local_results,
          features_analysis: include_features_analysis
        }
      }
    });

  } catch (error) {
    console.error('Error en análisis SERP:', error);
    
    if (error instanceof z.ZodError) {
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
});

export default router;
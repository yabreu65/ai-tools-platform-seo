import { NextRequest, NextResponse } from 'next/server';
import { SerpAnalyzer } from '@/lib/algorithms/keyword-research';

interface SerpAnalysisRequest {
  keywords: string[];
  country?: string;
  language?: string;
  device?: 'desktop' | 'mobile';
  includeFeatures?: boolean;
  includeCompetitors?: boolean;
  includeOpportunities?: boolean;
}

interface SerpFeature {
  type: string;
  present: boolean;
  position?: number;
  description?: string;
  impact: 'high' | 'medium' | 'low';
  clickShare?: number;
}

interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  domainAuthority: number;
  pageAuthority: number;
  backlinks: number;
  contentLength: number;
  titleOptimization: number;
  metaOptimization: number;
  structuredData: boolean;
  https: boolean;
  mobileOptimized: boolean;
  pageSpeed: number;
}

interface PaidResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  extensions: string[];
}

interface SerpAnalysisResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  serpFeatures: SerpFeature[];
  organicResults: OrganicResult[];
  paidResults: PaidResult[];
  clickDistribution: {
    organic: number;
    paid: number;
    features: number;
    noClick: number;
  };
  competitorInsights: {
    topDomains: string[];
    avgDomainAuthority: number;
    avgContentLength: number;
    commonTitlePatterns: string[];
    technicalGaps: string[];
  };
  opportunities: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  recommendations: {
    content: string[];
    technical: string[];
    seo: string[];
  };
  serpDifficulty: {
    score: number;
    factors: string[];
    reasoning: string;
  };
}

// Base de datos de features SERP
const serpFeaturesDatabase = [
  {
    type: 'Featured Snippet',
    impact: 'high' as const,
    clickShare: 35,
    description: 'Fragmento destacado en posición 0'
  },
  {
    type: 'People Also Ask',
    impact: 'medium' as const,
    clickShare: 15,
    description: 'Preguntas relacionadas expandibles'
  },
  {
    type: 'Local Pack',
    impact: 'high' as const,
    clickShare: 25,
    description: 'Resultados de negocios locales'
  },
  {
    type: 'Knowledge Panel',
    impact: 'medium' as const,
    clickShare: 10,
    description: 'Panel de información lateral'
  },
  {
    type: 'Image Pack',
    impact: 'low' as const,
    clickShare: 8,
    description: 'Carrusel de imágenes'
  },
  {
    type: 'Video Results',
    impact: 'medium' as const,
    clickShare: 12,
    description: 'Resultados de video integrados'
  },
  {
    type: 'Shopping Results',
    impact: 'high' as const,
    clickShare: 20,
    description: 'Productos de Google Shopping'
  },
  {
    type: 'News Results',
    impact: 'medium' as const,
    clickShare: 10,
    description: 'Noticias recientes'
  },
  {
    type: 'Top Stories',
    impact: 'medium' as const,
    clickShare: 12,
    description: 'Historias principales'
  },
  {
    type: 'Reviews',
    impact: 'low' as const,
    clickShare: 5,
    description: 'Reseñas y calificaciones'
  }
];

// Dominios competidores comunes
const competitorDomains = [
  'semrush.com', 'ahrefs.com', 'moz.com', 'ubersuggest.com', 'keywordtool.io',
  'serpstat.com', 'spyfu.com', 'kwfinder.com', 'seranking.com', 'mangools.com',
  'searchenginejournal.com', 'searchengineland.com', 'backlinko.com', 'neilpatel.com',
  'hubspot.com', 'wordstream.com', 'searchenginewatch.com', 'marketingland.com'
];

// Generar features SERP para una keyword
function generateSerpFeatures(keyword: string): SerpFeature[] {
  const features: SerpFeature[] = [];
  
  serpFeaturesDatabase.forEach(featureTemplate => {
    let probability = 0.3; // Probabilidad base
    
    // Ajustar probabilidad basada en la keyword
    if (keyword.includes('how to') || keyword.includes('what is')) {
      if (featureTemplate.type === 'Featured Snippet') probability = 0.8;
      if (featureTemplate.type === 'People Also Ask') probability = 0.9;
    }
    
    if (keyword.includes('near me') || keyword.includes('local')) {
      if (featureTemplate.type === 'Local Pack') probability = 0.9;
    }
    
    if (keyword.includes('buy') || keyword.includes('price') || keyword.includes('shop')) {
      if (featureTemplate.type === 'Shopping Results') probability = 0.8;
    }
    
    if (keyword.includes('news') || keyword.includes('latest')) {
      if (featureTemplate.type === 'News Results') probability = 0.7;
      if (featureTemplate.type === 'Top Stories') probability = 0.6;
    }
    
    if (keyword.includes('video') || keyword.includes('tutorial')) {
      if (featureTemplate.type === 'Video Results') probability = 0.7;
    }
    
    const present = Math.random() < probability;
    
    if (present || Math.random() < 0.1) { // Siempre incluir algunos features
      features.push({
        type: featureTemplate.type,
        present,
        position: present ? Math.floor(Math.random() * 3) + 1 : undefined,
        description: featureTemplate.description,
        impact: featureTemplate.impact,
        clickShare: present ? featureTemplate.clickShare : 0
      });
    }
  });
  
  return features;
}

// Generar resultados orgánicos
function generateOrganicResults(keyword: string, count: number = 10): OrganicResult[] {
  const results: OrganicResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const domain = competitorDomains[Math.floor(Math.random() * competitorDomains.length)];
    const domainAuthority = Math.floor(Math.random() * 40) + 60; // 60-100
    const pageAuthority = Math.floor(Math.random() * 30) + 50; // 50-80
    
    // Título optimizado basado en posición
    const titleOptimization = Math.max(20, 100 - (i * 8) + Math.floor(Math.random() * 20));
    
    results.push({
      position: i + 1,
      title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Complete Guide | ${domain}`,
      url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
      domain,
      snippet: `Comprehensive guide about ${keyword}. Learn everything you need to know about ${keyword} with our expert insights and practical tips.`,
      domainAuthority,
      pageAuthority,
      backlinks: Math.floor(Math.random() * 50000) + 1000,
      contentLength: Math.floor(Math.random() * 3000) + 1500,
      titleOptimization,
      metaOptimization: Math.floor(Math.random() * 40) + 60,
      structuredData: Math.random() > 0.3,
      https: Math.random() > 0.1,
      mobileOptimized: Math.random() > 0.2,
      pageSpeed: Math.floor(Math.random() * 40) + 60
    });
  }
  
  return results;
}

// Generar resultados pagados
function generatePaidResults(keyword: string, count: number = 4): PaidResult[] {
  const results: PaidResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const domain = competitorDomains[Math.floor(Math.random() * competitorDomains.length)];
    
    results.push({
      position: i + 1,
      title: `${keyword} - Best Tools & Solutions | ${domain}`,
      url: `https://${domain}/ads/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
      domain,
      description: `Get the best ${keyword} solutions. Free trial available. Trusted by thousands of professionals worldwide.`,
      extensions: ['Free Trial', 'Expert Support', '24/7 Help', 'Money Back Guarantee'].slice(0, Math.floor(Math.random() * 3) + 1)
    });
  }
  
  return results;
}

// Calcular distribución de clics
function calculateClickDistribution(serpFeatures: SerpFeature[], organicCount: number, paidCount: number) {
  const featuresClickShare = serpFeatures
    .filter(f => f.present)
    .reduce((sum, f) => sum + (f.clickShare || 0), 0);
  
  const paidClickShare = paidCount > 0 ? Math.min(25, paidCount * 6) : 0;
  const remainingClicks = Math.max(0, 100 - featuresClickShare - paidClickShare);
  const organicClickShare = Math.min(remainingClicks, organicCount * 8);
  const noClickShare = 100 - featuresClickShare - paidClickShare - organicClickShare;
  
  return {
    organic: Math.round(organicClickShare),
    paid: Math.round(paidClickShare),
    features: Math.round(featuresClickShare),
    noClick: Math.round(Math.max(0, noClickShare))
  };
}

// Analizar competidores
function analyzeCompetitors(organicResults: OrganicResult[]) {
  const domains = organicResults.map(r => r.domain);
  const uniqueDomains = [...new Set(domains)];
  const topDomains = uniqueDomains.slice(0, 5);
  
  const avgDomainAuthority = Math.round(
    organicResults.reduce((sum, r) => sum + r.domainAuthority, 0) / organicResults.length
  );
  
  const avgContentLength = Math.round(
    organicResults.reduce((sum, r) => sum + r.contentLength, 0) / organicResults.length
  );
  
  // Patrones comunes en títulos
  const titleWords = organicResults.flatMap(r => 
    r.title.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  );
  const wordCounts: { [key: string]: number } = {};
  titleWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  const commonTitlePatterns = Object.entries(wordCounts)
    .filter(([_, count]) => count >= 3)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Gaps técnicos
  const technicalGaps = [];
  const httpsRate = organicResults.filter(r => r.https).length / organicResults.length;
  const mobileRate = organicResults.filter(r => r.mobileOptimized).length / organicResults.length;
  const structuredDataRate = organicResults.filter(r => r.structuredData).length / organicResults.length;
  const avgPageSpeed = organicResults.reduce((sum, r) => sum + r.pageSpeed, 0) / organicResults.length;
  
  if (httpsRate < 0.9) technicalGaps.push('Oportunidad HTTPS');
  if (mobileRate < 0.8) technicalGaps.push('Optimización móvil');
  if (structuredDataRate < 0.6) technicalGaps.push('Datos estructurados');
  if (avgPageSpeed < 70) technicalGaps.push('Velocidad de página');
  
  return {
    topDomains,
    avgDomainAuthority,
    avgContentLength,
    commonTitlePatterns,
    technicalGaps
  };
}

// Generar oportunidades
function generateOpportunities(
  serpFeatures: SerpFeature[],
  organicResults: OrganicResult[],
  competitorInsights: any
) {
  const opportunities = {
    immediate: [] as string[],
    shortTerm: [] as string[],
    longTerm: [] as string[]
  };
  
  // Oportunidades inmediatas
  const featuredSnippet = serpFeatures.find(f => f.type === 'Featured Snippet');
  if (!featuredSnippet?.present) {
    opportunities.immediate.push('Optimizar para Featured Snippet');
  }
  
  if (competitorInsights.technicalGaps.includes('Datos estructurados')) {
    opportunities.immediate.push('Implementar schema markup');
  }
  
  if (competitorInsights.avgContentLength < 2000) {
    opportunities.immediate.push('Crear contenido más extenso');
  }
  
  // Oportunidades a corto plazo
  const paaFeature = serpFeatures.find(f => f.type === 'People Also Ask');
  if (paaFeature?.present) {
    opportunities.shortTerm.push('Crear contenido para PAA');
  }
  
  if (competitorInsights.avgDomainAuthority < 70) {
    opportunities.shortTerm.push('Construir autoridad de dominio');
  }
  
  opportunities.shortTerm.push('Optimizar para múltiples features SERP');
  
  // Oportunidades a largo plazo
  opportunities.longTerm.push('Desarrollar hub de contenido temático');
  opportunities.longTerm.push('Estrategia de link building sostenible');
  
  if (serpFeatures.some(f => f.type === 'Video Results' && f.present)) {
    opportunities.longTerm.push('Crear contenido de video');
  }
  
  return opportunities;
}

// Generar recomendaciones
function generateRecommendations(
  serpFeatures: SerpFeature[],
  organicResults: OrganicResult[],
  competitorInsights: any
) {
  const recommendations = {
    content: [] as string[],
    technical: [] as string[],
    seo: [] as string[]
  };
  
  // Recomendaciones de contenido
  recommendations.content.push('Crear contenido comprehensivo y bien estructurado');
  
  if (competitorInsights.commonTitlePatterns.length > 0) {
    recommendations.content.push(`Incluir términos clave: ${competitorInsights.commonTitlePatterns.join(', ')}`);
  }
  
  const avgContentLength = competitorInsights.avgContentLength;
  recommendations.content.push(`Apuntar a ${Math.round(avgContentLength * 1.2)} palabras mínimo`);
  
  // Recomendaciones técnicas
  if (competitorInsights.technicalGaps.includes('Velocidad de página')) {
    recommendations.technical.push('Optimizar velocidad de carga');
  }
  
  if (competitorInsights.technicalGaps.includes('Optimización móvil')) {
    recommendations.technical.push('Mejorar experiencia móvil');
  }
  
  recommendations.technical.push('Implementar Core Web Vitals');
  
  // Recomendaciones SEO
  recommendations.seo.push('Optimizar título y meta descripción');
  recommendations.seo.push('Usar encabezados H1-H6 estructurados');
  
  if (serpFeatures.some(f => f.type === 'Featured Snippet' && f.present)) {
    recommendations.seo.push('Formatear contenido para snippets');
  }
  
  return recommendations;
}

// Calcular dificultad SERP
function calculateSerpDifficulty(
  serpFeatures: SerpFeature[],
  organicResults: OrganicResult[],
  competitorInsights: any
) {
  let score = 50; // Base score
  const factors = [];
  
  // Ajustar por features SERP
  const presentFeatures = serpFeatures.filter(f => f.present);
  const highImpactFeatures = presentFeatures.filter(f => f.impact === 'high');
  
  score += highImpactFeatures.length * 15;
  score += presentFeatures.length * 5;
  
  if (highImpactFeatures.length > 0) {
    factors.push(`${highImpactFeatures.length} features de alto impacto`);
  }
  
  // Ajustar por autoridad de competidores
  if (competitorInsights.avgDomainAuthority > 80) {
    score += 20;
    factors.push('Competidores de alta autoridad');
  } else if (competitorInsights.avgDomainAuthority > 60) {
    score += 10;
    factors.push('Competidores de autoridad media');
  }
  
  // Ajustar por optimización técnica
  const wellOptimized = organicResults.filter(r => 
    r.https && r.mobileOptimized && r.structuredData && r.pageSpeed > 70
  ).length;
  
  if (wellOptimized > 7) {
    score += 15;
    factors.push('Competidores bien optimizados técnicamente');
  }
  
  // Ajustar por contenido
  if (competitorInsights.avgContentLength > 3000) {
    score += 10;
    factors.push('Contenido extenso requerido');
  }
  
  score = Math.min(100, Math.max(1, score));
  
  let reasoning = '';
  if (score > 80) {
    reasoning = 'SERP muy competitivo con múltiples features y competidores fuertes';
  } else if (score > 60) {
    reasoning = 'SERP moderadamente competitivo, requiere estrategia sólida';
  } else if (score > 40) {
    reasoning = 'SERP con competencia media, buenas oportunidades';
  } else {
    reasoning = 'SERP con baja competencia, excelente oportunidad';
  }
  
  return {
    score: Math.round(score),
    factors,
    reasoning
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SerpAnalysisRequest = await request.json();
    
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
    
    // Analizar cada keyword
    const results: SerpAnalysisResult[] = [];
    
    for (const keyword of keywordsToAnalyze) {
      // Generar datos SERP
      const serpFeatures = body.includeFeatures !== false ? generateSerpFeatures(keyword) : [];
      const organicResults = body.includeCompetitors !== false ? generateOrganicResults(keyword) : [];
      const paidResults = generatePaidResults(keyword);
      
      // Calcular métricas
      const clickDistribution = calculateClickDistribution(serpFeatures, organicResults.length, paidResults.length);
      const competitorInsights = analyzeCompetitors(organicResults);
      
      // Generar insights
      const opportunities = body.includeOpportunities !== false ? 
        generateOpportunities(serpFeatures, organicResults, competitorInsights) : 
        { immediate: [], shortTerm: [], longTerm: [] };
      
      const recommendations = generateRecommendations(serpFeatures, organicResults, competitorInsights);
      const serpDifficulty = calculateSerpDifficulty(serpFeatures, organicResults, competitorInsights);
      
      // Datos base de la keyword
      const searchVolume = Math.floor(Math.random() * 50000) + 5000;
      const difficulty = Math.floor(Math.random() * 80) + 20;
      
      results.push({
        keyword,
        searchVolume,
        difficulty,
        serpFeatures,
        organicResults,
        paidResults,
        clickDistribution,
        competitorInsights,
        opportunities,
        recommendations,
        serpDifficulty
      });
    }
    
    // Calcular estadísticas generales
    const stats = {
      totalKeywords: results.length,
      avgSerpDifficulty: Math.round(results.reduce((sum, r) => sum + r.serpDifficulty.score, 0) / results.length),
      avgOrganicClicks: Math.round(results.reduce((sum, r) => sum + r.clickDistribution.organic, 0) / results.length),
      mostCommonFeatures: serpFeaturesDatabase
        .map(feature => ({
          type: feature.type,
          frequency: results.filter(r => 
            r.serpFeatures.some(f => f.type === feature.type && f.present)
          ).length
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5),
      competitorDomains: [...new Set(results.flatMap(r => r.competitorInsights.topDomains))]
        .slice(0, 10),
      avgContentLength: Math.round(
        results.reduce((sum, r) => sum + r.competitorInsights.avgContentLength, 0) / results.length
      )
    };
    
    return NextResponse.json({
      success: true,
      data: {
        results,
        stats,
        timestamp: new Date().toISOString(),
        analysisOptions: body
      }
    });
    
  } catch (error) {
    console.error('Error in SERP analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
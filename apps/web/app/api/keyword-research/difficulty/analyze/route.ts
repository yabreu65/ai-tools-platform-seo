import { NextRequest, NextResponse } from 'next/server';
import { KeywordDifficultyAnalyzer } from '@/lib/algorithms/keyword-research';

interface DifficultyAnalysisRequest {
  keywords: string[];
  country?: string;
  language?: string;
  includeCompetitors?: boolean;
  includeSerp?: boolean;
}

interface CompetitorData {
  domain: string;
  title: string;
  url: string;
  domainAuthority: number;
  pageAuthority: number;
  backlinks: number;
  referringDomains: number;
  contentLength: number;
  titleMatch: boolean;
  urlMatch: boolean;
}

interface SerpFeature {
  type: string;
  present: boolean;
  description?: string;
}

interface KeywordDifficultyResult {
  keyword: string;
  difficulty: number;
  volume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  trend: number[];
  serpFeatures: SerpFeature[];
  competitors: CompetitorData[];
  opportunities: string[];
  recommendations: string[];
  metrics: {
    titleCompetition: number;
    urlCompetition: number;
    contentGap: number;
    authorityGap: number;
    backlinkGap: number;
  };
}

// Simulación de datos SERP
const serpFeaturesDatabase = [
  { type: 'Featured Snippet', present: true, description: 'Fragmento destacado presente' },
  { type: 'People Also Ask', present: true, description: 'Preguntas relacionadas' },
  { type: 'Local Pack', present: false, description: 'Resultados locales' },
  { type: 'Knowledge Panel', present: false, description: 'Panel de conocimiento' },
  { type: 'Image Pack', present: true, description: 'Pack de imágenes' },
  { type: 'Video Results', present: false, description: 'Resultados de video' },
  { type: 'Shopping Results', present: false, description: 'Resultados de compras' },
  { type: 'News Results', present: false, description: 'Resultados de noticias' }
];

// Simulación de competidores
const competitorsDatabase = [
  {
    domain: 'semrush.com',
    title: 'SEMrush - All-in-one Marketing Toolkit',
    url: 'https://semrush.com/features/keyword-research/',
    domainAuthority: 91,
    pageAuthority: 78,
    backlinks: 125000,
    referringDomains: 8500,
    contentLength: 2400,
    titleMatch: true,
    urlMatch: true
  },
  {
    domain: 'ahrefs.com',
    title: 'Ahrefs - SEO Tools & Resources',
    url: 'https://ahrefs.com/keyword-explorer',
    domainAuthority: 89,
    pageAuthority: 82,
    backlinks: 98000,
    referringDomains: 7200,
    contentLength: 3100,
    titleMatch: true,
    urlMatch: true
  },
  {
    domain: 'moz.com',
    title: 'Moz - SEO Software and Data',
    url: 'https://moz.com/explorer',
    domainAuthority: 85,
    pageAuthority: 75,
    backlinks: 67000,
    referringDomains: 5800,
    contentLength: 1900,
    titleMatch: false,
    urlMatch: true
  },
  {
    domain: 'ubersuggest.com',
    title: 'Ubersuggest - Keyword Research Tool',
    url: 'https://neilpatel.com/ubersuggest/',
    domainAuthority: 78,
    pageAuthority: 71,
    backlinks: 45000,
    referringDomains: 4200,
    contentLength: 2800,
    titleMatch: true,
    urlMatch: false
  },
  {
    domain: 'keywordtool.io',
    title: 'Keyword Tool - Free Keyword Research',
    url: 'https://keywordtool.io/',
    domainAuthority: 72,
    pageAuthority: 68,
    backlinks: 32000,
    referringDomains: 3100,
    contentLength: 2200,
    titleMatch: true,
    urlMatch: true
  }
];

function generateSerpFeatures(keyword: string): SerpFeature[] {
  const features = [...serpFeaturesDatabase];
  
  // Ajustar probabilidades basadas en el tipo de keyword
  if (keyword.includes('how to') || keyword.includes('what is')) {
    features.find(f => f.type === 'Featured Snippet')!.present = Math.random() > 0.2;
    features.find(f => f.type === 'People Also Ask')!.present = Math.random() > 0.1;
  }
  
  if (keyword.includes('near me') || keyword.includes('local')) {
    features.find(f => f.type === 'Local Pack')!.present = Math.random() > 0.3;
  }
  
  if (keyword.includes('buy') || keyword.includes('price')) {
    features.find(f => f.type === 'Shopping Results')!.present = Math.random() > 0.4;
  }
  
  return features;
}

function generateCompetitors(keyword: string, count: number = 5): CompetitorData[] {
  const competitors = [...competitorsDatabase]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  
  return competitors.map(comp => ({
    ...comp,
    titleMatch: keyword.split(' ').some(word => 
      comp.title.toLowerCase().includes(word.toLowerCase())
    ),
    urlMatch: keyword.split(' ').some(word => 
      comp.url.toLowerCase().includes(word.toLowerCase())
    )
  }));
}

function calculateDifficultyMetrics(keyword: string, competitors: CompetitorData[]): any {
  const avgDA = competitors.reduce((sum, comp) => sum + comp.domainAuthority, 0) / competitors.length;
  const avgPA = competitors.reduce((sum, comp) => sum + comp.pageAuthority, 0) / competitors.length;
  const avgBacklinks = competitors.reduce((sum, comp) => sum + comp.backlinks, 0) / competitors.length;
  const titleMatches = competitors.filter(comp => comp.titleMatch).length;
  const urlMatches = competitors.filter(comp => comp.urlMatch).length;
  
  return {
    titleCompetition: Math.round((titleMatches / competitors.length) * 100),
    urlCompetition: Math.round((urlMatches / competitors.length) * 100),
    contentGap: Math.round(100 - (avgDA / 100 * 100)),
    authorityGap: Math.round(avgDA),
    backlinkGap: Math.round(avgBacklinks / 1000)
  };
}

function generateOpportunities(keyword: string, metrics: any, serpFeatures: SerpFeature[]): string[] {
  const opportunities = [];
  
  if (metrics.titleCompetition < 60) {
    opportunities.push('Optimizar título con keyword exacta');
  }
  
  if (metrics.urlCompetition < 40) {
    opportunities.push('Incluir keyword en URL');
  }
  
  if (!serpFeatures.find(f => f.type === 'Featured Snippet')?.present) {
    opportunities.push('Oportunidad para Featured Snippet');
  }
  
  if (metrics.authorityGap < 70) {
    opportunities.push('Competencia de autoridad moderada');
  }
  
  if (metrics.backlinkGap < 50) {
    opportunities.push('Brecha de backlinks alcanzable');
  }
  
  return opportunities;
}

function generateRecommendations(keyword: string, difficulty: number, metrics: any): string[] {
  const recommendations = [];
  
  if (difficulty > 70) {
    recommendations.push('Considerar keywords de cola larga menos competitivas');
    recommendations.push('Enfocar en contenido de alta calidad y autoridad');
  } else if (difficulty > 40) {
    recommendations.push('Crear contenido comprehensivo y bien estructurado');
    recommendations.push('Construir backlinks de calidad gradualmente');
  } else {
    recommendations.push('Oportunidad excelente para ranking rápido');
    recommendations.push('Crear contenido optimizado y publicar pronto');
  }
  
  if (metrics.titleCompetition < 50) {
    recommendations.push('Optimizar meta título con keyword principal');
  }
  
  if (metrics.contentGap > 30) {
    recommendations.push('Crear contenido más extenso que la competencia');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body: DifficultyAnalysisRequest = await request.json();
    
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
    
    // Limitar a 50 keywords por análisis
    const keywordsToAnalyze = validKeywords.slice(0, 50);
    
    // Analizar cada keyword
    const results: KeywordDifficultyResult[] = [];
    
    for (const keyword of keywordsToAnalyze) {
      // Simulamos análisis de dificultad para demo
      const difficultyData = {
        keyword: keyword,
        difficulty: Math.floor(Math.random() * 100),
        volume: Math.floor(Math.random() * 10000),
        cpc: (Math.random() * 5).toFixed(2),
        competition: Math.random() > 0.5 ? 'high' : 'medium'
      };
      
      // Generar datos adicionales
      const serpFeatures = body.includeSerp ? generateSerpFeatures(keyword) : [];
      const competitors = body.includeCompetitors ? generateCompetitors(keyword) : [];
      const metrics = calculateDifficultyMetrics(keyword, competitors);
      const opportunities = generateOpportunities(keyword, metrics, serpFeatures);
      const recommendations = generateRecommendations(keyword, difficultyData.difficulty, metrics);
      
      results.push({
        keyword,
        difficulty: difficultyData.difficulty,
        volume: difficultyData.volume,
        cpc: parseFloat(difficultyData.cpc),
        competition: difficultyData.competition as 'high' | 'medium' | 'low',
        intent: 'informational',
        trend: [50, 55, 60, 58, 62],
        serpFeatures,
        competitors,
        opportunities,
        recommendations,
        metrics
      });
    }
    
    // Calcular estadísticas generales
    const stats = {
      totalKeywords: results.length,
      avgDifficulty: Math.round(results.reduce((sum, r) => sum + r.difficulty, 0) / results.length),
      avgVolume: Math.round(results.reduce((sum, r) => sum + r.volume, 0) / results.length),
      avgCpc: Math.round((results.reduce((sum, r) => sum + r.cpc, 0) / results.length) * 100) / 100,
      difficultyDistribution: {
        easy: results.filter(r => r.difficulty < 30).length,
        medium: results.filter(r => r.difficulty >= 30 && r.difficulty < 70).length,
        hard: results.filter(r => r.difficulty >= 70).length
      },
      topOpportunities: results
        .filter(r => r.difficulty < 50 && r.volume > 1000)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)
        .map(r => r.keyword)
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
    console.error('Error in difficulty analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
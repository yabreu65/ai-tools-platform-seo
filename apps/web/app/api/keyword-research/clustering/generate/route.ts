import { NextRequest, NextResponse } from 'next/server';
import { NLPKeywordClustering } from '@/lib/algorithms/keyword-research';

interface ClusteringRequest {
  keywords: string[];
  clusteringMethod?: 'semantic' | 'intent' | 'hybrid';
  maxClusters?: number;
  minClusterSize?: number;
  includeMetrics?: boolean;
}

interface KeywordWithMetrics {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

interface ClusterResult {
  id: string;
  name: string;
  primaryKeyword: string;
  keywords: KeywordWithMetrics[];
  size: number;
  avgVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  dominantIntent: string;
  coherenceScore: number;
  commonThemes: string[];
  opportunities: string[];
  recommendations: string[];
  metrics: {
    totalVolume: number;
    competitionLevel: 'low' | 'medium' | 'high';
    contentGaps: string[];
    priorityScore: number;
  };
}

// Base de datos simulada de keywords con métricas
const keywordMetricsDatabase: { [key: string]: Omit<KeywordWithMetrics, 'keyword'> } = {
  'seo tools': { volume: 49500, difficulty: 67, cpc: 12.45, competition: 'high', intent: 'commercial' },
  'keyword research tool': { volume: 33100, difficulty: 72, cpc: 8.92, competition: 'high', intent: 'commercial' },
  'backlink checker': { volume: 27100, difficulty: 58, cpc: 15.67, competition: 'medium', intent: 'commercial' },
  'competitor analysis seo': { volume: 18100, difficulty: 64, cpc: 11.23, competition: 'medium', intent: 'informational' },
  'long tail keywords': { volume: 14800, difficulty: 45, cpc: 6.78, competition: 'low', intent: 'informational' },
  'content optimization': { volume: 22400, difficulty: 52, cpc: 9.34, competition: 'medium', intent: 'informational' },
  'page speed optimization': { volume: 16700, difficulty: 48, cpc: 7.89, competition: 'medium', intent: 'informational' },
  'local seo': { volume: 35600, difficulty: 55, cpc: 13.45, competition: 'high', intent: 'commercial' },
  'seo audit': { volume: 28900, difficulty: 61, cpc: 10.23, competition: 'high', intent: 'commercial' },
  'link building': { volume: 31200, difficulty: 69, cpc: 14.56, competition: 'high', intent: 'informational' },
  'technical seo': { volume: 19800, difficulty: 58, cpc: 11.78, competition: 'medium', intent: 'informational' },
  'on page seo': { volume: 24600, difficulty: 54, cpc: 8.91, competition: 'medium', intent: 'informational' },
  'off page seo': { volume: 15300, difficulty: 52, cpc: 9.45, competition: 'medium', intent: 'informational' },
  'seo strategy': { volume: 21700, difficulty: 49, cpc: 7.23, competition: 'medium', intent: 'informational' },
  'seo best practices': { volume: 12400, difficulty: 43, cpc: 6.12, competition: 'low', intent: 'informational' }
};

// Enriquecer keywords con métricas
function enrichKeywordsWithMetrics(keywords: string[]): KeywordWithMetrics[] {
  return keywords.map(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    // Buscar métricas exactas o generar basadas en patrones
    let metrics = keywordMetricsDatabase[normalizedKeyword];
    
    if (!metrics) {
      // Generar métricas basadas en patrones de la keyword
      metrics = generateMetricsForKeyword(normalizedKeyword);
    }
    
    return {
      keyword,
      ...metrics
    };
  });
}

// Generar métricas para keywords no encontradas
function generateMetricsForKeyword(keyword: string): Omit<KeywordWithMetrics, 'keyword'> {
  let baseVolume = 5000;
  let baseDifficulty = 50;
  let baseCpc = 5.0;
  let competition: 'low' | 'medium' | 'high' = 'medium';
  let intent: 'informational' | 'commercial' | 'transactional' | 'navigational' = 'informational';
  
  // Ajustar basado en patrones de la keyword
  if (keyword.includes('tool') || keyword.includes('software')) {
    baseVolume *= 1.5;
    baseDifficulty += 15;
    baseCpc *= 1.8;
    competition = 'high';
    intent = 'commercial';
  }
  
  if (keyword.includes('free') || keyword.includes('how to')) {
    baseVolume *= 1.2;
    baseDifficulty -= 10;
    baseCpc *= 0.6;
    competition = 'low';
    intent = 'informational';
  }
  
  if (keyword.includes('buy') || keyword.includes('price') || keyword.includes('cost')) {
    baseCpc *= 2;
    intent = 'transactional';
    competition = 'high';
  }
  
  if (keyword.includes('best') || keyword.includes('top') || keyword.includes('review')) {
    baseVolume *= 1.3;
    baseDifficulty += 10;
    intent = 'commercial';
  }
  
  // Añadir variación aleatoria
  const volumeVariation = (Math.random() - 0.5) * 0.4;
  const difficultyVariation = (Math.random() - 0.5) * 20;
  const cpcVariation = (Math.random() - 0.5) * 0.6;
  
  return {
    volume: Math.max(100, Math.round(baseVolume * (1 + volumeVariation))),
    difficulty: Math.max(1, Math.min(100, Math.round(baseDifficulty + difficultyVariation))),
    cpc: Math.max(0.1, Math.round((baseCpc + cpcVariation) * 100) / 100),
    competition,
    intent
  };
}

// Agrupar keywords por similitud semántica
function clusterBySemantic(keywords: KeywordWithMetrics[]): ClusterResult[] {
  const clusters: ClusterResult[] = [];
  const processed = new Set<string>();
  
  keywords.forEach((keyword, index) => {
    if (processed.has(keyword.keyword)) return;
    
    const cluster: KeywordWithMetrics[] = [keyword];
    processed.add(keyword.keyword);
    
    // Buscar keywords similares
    keywords.forEach((otherKeyword, otherIndex) => {
      if (index !== otherIndex && !processed.has(otherKeyword.keyword)) {
        const similarity = calculateSemanticSimilarity(keyword.keyword, otherKeyword.keyword);
        if (similarity > 0.6) {
          cluster.push(otherKeyword);
          processed.add(otherKeyword.keyword);
        }
      }
    });
    
    if (cluster.length >= 2) {
      clusters.push(createClusterResult(cluster, `Cluster Semántico ${clusters.length + 1}`));
    }
  });
  
  return clusters;
}

// Agrupar keywords por intención
function clusterByIntent(keywords: KeywordWithMetrics[]): ClusterResult[] {
  const intentGroups: { [key: string]: KeywordWithMetrics[] } = {};
  
  keywords.forEach(keyword => {
    if (!intentGroups[keyword.intent]) {
      intentGroups[keyword.intent] = [];
    }
    intentGroups[keyword.intent].push(keyword);
  });
  
  return Object.entries(intentGroups)
    .filter(([_, keywords]) => keywords.length >= 2)
    .map(([intent, keywords]) => 
      createClusterResult(keywords, `Keywords ${intent.charAt(0).toUpperCase() + intent.slice(1)}`)
    );
}

// Clustering híbrido
function clusterHybrid(keywords: KeywordWithMetrics[]): ClusterResult[] {
  // Usar el algoritmo NLP de clustering
  const keywordData = keywords.map(kw => ({
    keyword: kw.keyword,
    volume: kw.volume,
    difficulty: kw.difficulty,
    cpc: kw.cpc,
    intent: kw.intent
  }));
  
  // Simulamos clustering para demo
  const clusteringResult = {
    clusters: [
      {
        id: 1,
        name: 'Cluster Principal',
        keywords: keywordData.slice(0, 5),
        score: 0.8
      }
    ]
  };
  
  return clusteringResult.clusters.map((cluster, index) => {
    const clusterKeywords = cluster.keywords.map(kw => {
      const originalKeyword = keywords.find(k => k.keyword === kw.keyword);
      return originalKeyword || {
        keyword: kw.keyword,
        volume: kw.volume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        competition: 'medium' as const,
        intent: kw.intent as any
      };
    });
    
    return createClusterResult(clusterKeywords, cluster.name || `Cluster ${index + 1}`);
  });
}

// Calcular similitud semántica básica
function calculateSemanticSimilarity(keyword1: string, keyword2: string): number {
  const words1 = keyword1.toLowerCase().split(' ');
  const words2 = keyword2.toLowerCase().split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return commonWords.length / totalWords;
}

// Crear resultado de cluster
function createClusterResult(keywords: KeywordWithMetrics[], name: string): ClusterResult {
  const totalVolume = keywords.reduce((sum, kw) => sum + kw.volume, 0);
  const avgVolume = Math.round(totalVolume / keywords.length);
  const avgDifficulty = Math.round(keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length);
  const avgCpc = Math.round((keywords.reduce((sum, kw) => sum + kw.cpc, 0) / keywords.length) * 100) / 100;
  
  // Encontrar intención dominante
  const intentCounts: { [key: string]: number } = {};
  keywords.forEach(kw => {
    intentCounts[kw.intent] = (intentCounts[kw.intent] || 0) + 1;
  });
  const dominantIntent = Object.entries(intentCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  // Calcular nivel de competencia
  const competitionScores = { low: 1, medium: 2, high: 3 };
  const avgCompetitionScore = keywords.reduce((sum, kw) => sum + competitionScores[kw.competition], 0) / keywords.length;
  const competitionLevel: 'low' | 'medium' | 'high' = 
    avgCompetitionScore < 1.5 ? 'low' : avgCompetitionScore < 2.5 ? 'medium' : 'high';
  
  // Keyword principal (mayor volumen)
  const primaryKeyword = keywords.sort((a, b) => b.volume - a.volume)[0].keyword;
  
  // Temas comunes
  const allWords = keywords.flatMap(kw => kw.keyword.toLowerCase().split(' '));
  const wordCounts: { [key: string]: number } = {};
  allWords.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  const commonThemes = Object.entries(wordCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Calcular coherencia (basada en similitud promedio)
  let totalSimilarity = 0;
  let comparisons = 0;
  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      totalSimilarity += calculateSemanticSimilarity(keywords[i].keyword, keywords[j].keyword);
      comparisons++;
    }
  }
  const coherenceScore = comparisons > 0 ? Math.round((totalSimilarity / comparisons) * 100) : 0;
  
  // Generar oportunidades
  const opportunities = generateClusterOpportunities(keywords, dominantIntent, competitionLevel);
  
  // Generar recomendaciones
  const recommendations = generateClusterRecommendations(keywords, avgDifficulty, competitionLevel);
  
  // Calcular score de prioridad
  const priorityScore = calculatePriorityScore(totalVolume, avgDifficulty, competitionLevel);
  
  return {
    id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    primaryKeyword,
    keywords,
    size: keywords.length,
    avgVolume,
    avgDifficulty,
    avgCpc,
    dominantIntent,
    coherenceScore,
    commonThemes,
    opportunities,
    recommendations,
    metrics: {
      totalVolume,
      competitionLevel,
      contentGaps: generateContentGaps(keywords),
      priorityScore
    }
  };
}

// Generar oportunidades del cluster
function generateClusterOpportunities(keywords: KeywordWithMetrics[], intent: string, competition: string): string[] {
  const opportunities = [];
  
  if (competition === 'low') {
    opportunities.push('Baja competencia - oportunidad de ranking rápido');
  }
  
  if (intent === 'commercial') {
    opportunities.push('Intención comercial - potencial de conversión alto');
  }
  
  if (intent === 'informational') {
    opportunities.push('Contenido educativo - oportunidad de autoridad');
  }
  
  const highVolumeKeywords = keywords.filter(kw => kw.volume > 20000);
  if (highVolumeKeywords.length > 0) {
    opportunities.push(`${highVolumeKeywords.length} keywords de alto volumen identificadas`);
  }
  
  const lowDifficultyKeywords = keywords.filter(kw => kw.difficulty < 40);
  if (lowDifficultyKeywords.length > 0) {
    opportunities.push(`${lowDifficultyKeywords.length} keywords de baja dificultad`);
  }
  
  return opportunities;
}

// Generar recomendaciones del cluster
function generateClusterRecommendations(keywords: KeywordWithMetrics[], avgDifficulty: number, competition: string): string[] {
  const recommendations = [];
  
  if (avgDifficulty > 70) {
    recommendations.push('Crear contenido de alta calidad y autoridad');
    recommendations.push('Enfocar en link building estratégico');
  } else if (avgDifficulty > 40) {
    recommendations.push('Desarrollar contenido comprehensivo');
    recommendations.push('Optimizar para múltiples keywords del cluster');
  } else {
    recommendations.push('Oportunidad de contenido rápido');
    recommendations.push('Crear páginas pillar para el cluster');
  }
  
  if (competition === 'high') {
    recommendations.push('Considerar keywords de cola larga');
  }
  
  recommendations.push('Crear hub de contenido para el tema');
  recommendations.push('Implementar linking interno entre páginas del cluster');
  
  return recommendations;
}

// Generar gaps de contenido
function generateContentGaps(keywords: KeywordWithMetrics[]): string[] {
  const gaps = [];
  
  const hasCommercialIntent = keywords.some(kw => kw.intent === 'commercial');
  const hasInformationalIntent = keywords.some(kw => kw.intent === 'informational');
  
  if (hasCommercialIntent && !hasInformationalIntent) {
    gaps.push('Contenido educativo para nutrir leads');
  }
  
  if (hasInformationalIntent && !hasCommercialIntent) {
    gaps.push('Páginas comerciales para conversión');
  }
  
  const hasHowToKeywords = keywords.some(kw => kw.keyword.includes('how to'));
  if (!hasHowToKeywords) {
    gaps.push('Guías paso a paso');
  }
  
  const hasComparisonKeywords = keywords.some(kw => 
    kw.keyword.includes('vs') || kw.keyword.includes('comparison') || kw.keyword.includes('best')
  );
  if (!hasComparisonKeywords) {
    gaps.push('Contenido de comparación');
  }
  
  return gaps;
}

// Calcular score de prioridad
function calculatePriorityScore(volume: number, difficulty: number, competition: string): number {
  const volumeScore = Math.min(volume / 1000, 100);
  const difficultyScore = 100 - difficulty;
  const competitionScore = competition === 'low' ? 100 : competition === 'medium' ? 60 : 30;
  
  return Math.round((volumeScore * 0.4 + difficultyScore * 0.4 + competitionScore * 0.2));
}

export async function POST(request: NextRequest) {
  try {
    const body: ClusteringRequest = await request.json();
    
    // Validaciones
    if (!body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword para agrupar' },
        { status: 400 }
      );
    }
    
    // Filtrar keywords vacías
    const validKeywords = body.keywords.filter(kw => kw.trim().length > 0);
    
    if (validKeywords.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 keywords válidas para clustering' },
        { status: 400 }
      );
    }
    
    // Limitar a 200 keywords por análisis
    const keywordsToAnalyze = validKeywords.slice(0, 200);
    
    // Enriquecer keywords con métricas
    const enrichedKeywords = enrichKeywordsWithMetrics(keywordsToAnalyze);
    
    // Aplicar método de clustering
    let clusters: ClusterResult[] = [];
    const method = body.clusteringMethod || 'hybrid';
    
    switch (method) {
      case 'semantic':
        clusters = clusterBySemantic(enrichedKeywords);
        break;
      case 'intent':
        clusters = clusterByIntent(enrichedKeywords);
        break;
      case 'hybrid':
      default:
        clusters = clusterHybrid(enrichedKeywords);
        break;
    }
    
    // Aplicar filtros de tamaño
    const minSize = body.minClusterSize || 2;
    const maxClusters = body.maxClusters || 20;
    
    clusters = clusters
      .filter(cluster => cluster.size >= minSize)
      .sort((a, b) => b.metrics.priorityScore - a.metrics.priorityScore)
      .slice(0, maxClusters);
    
    // Calcular estadísticas
    const totalKeywordsInClusters = clusters.reduce((sum, cluster) => sum + cluster.size, 0);
    const unclustered = enrichedKeywords.length - totalKeywordsInClusters;
    
    const stats = {
      totalKeywords: enrichedKeywords.length,
      totalClusters: clusters.length,
      keywordsInClusters: totalKeywordsInClusters,
      unclusteredKeywords: unclustered,
      avgClusterSize: Math.round(totalKeywordsInClusters / clusters.length),
      avgCoherenceScore: Math.round(clusters.reduce((sum, c) => sum + c.coherenceScore, 0) / clusters.length),
      topClusters: clusters.slice(0, 5).map(c => ({
        name: c.name,
        size: c.size,
        totalVolume: c.metrics.totalVolume,
        priorityScore: c.metrics.priorityScore
      })),
      intentDistribution: {
        informational: clusters.filter(c => c.dominantIntent === 'informational').length,
        commercial: clusters.filter(c => c.dominantIntent === 'commercial').length,
        transactional: clusters.filter(c => c.dominantIntent === 'transactional').length,
        navigational: clusters.filter(c => c.dominantIntent === 'navigational').length
      }
    };
    
    return NextResponse.json({
      success: true,
      data: {
        clusters,
        stats,
        method,
        timestamp: new Date().toISOString(),
        options: body
      }
    });
    
  } catch (error) {
    console.error('Error in keyword clustering:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
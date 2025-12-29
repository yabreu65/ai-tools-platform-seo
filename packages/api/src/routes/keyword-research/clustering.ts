import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validación para clustering
const clusteringSchema = z.object({
  keywords: z.array(z.string()).min(5, 'Mínimo 5 keywords requeridas para clustering').max(500, 'Máximo 500 keywords por análisis'),
  method: z.enum(['semantic', 'intent', 'metrics', 'hybrid']).default('hybrid'),
  min_cluster_size: z.number().min(2).max(20).default(3),
  max_clusters: z.number().min(2).max(50).default(15),
  similarity_threshold: z.number().min(0.1).max(1.0).default(0.6),
  include_metrics: z.boolean().default(true),
  include_intent_analysis: z.boolean().default(true),
  language: z.string().default('en')
});

interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: number;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  intent_confidence: number;
}

interface ClusterKeyword extends KeywordMetrics {
  similarity_to_centroid: number;
  cluster_relevance_score: number;
}

interface Cluster {
  id: string;
  name: string;
  centroid_keyword: string;
  keywords: ClusterKeyword[];
  size: number;
  avg_search_volume: number;
  avg_difficulty: number;
  avg_cpc: number;
  dominant_intent: string;
  intent_distribution: {
    informational: number;
    navigational: number;
    commercial: number;
    transactional: number;
  };
  cluster_score: number;
  suggested_content_type: string;
  content_opportunities: string[];
}

interface ClusteringResult {
  clusters: Cluster[];
  unclustered_keywords: KeywordMetrics[];
  clustering_stats: {
    total_keywords: number;
    clustered_keywords: number;
    unclustered_keywords: number;
    total_clusters: number;
    avg_cluster_size: number;
    clustering_score: number;
    method_used: string;
  };
  intent_analysis: {
    overall_distribution: {
      informational: number;
      navigational: number;
      commercial: number;
      transactional: number;
    };
    dominant_intent: string;
    intent_diversity_score: number;
  };
  recommendations: {
    content_strategy: string[];
    cluster_optimization: string[];
    keyword_expansion: string[];
  };
}

// Función para determinar intención de búsqueda
const determineSearchIntent = (keyword: string): { intent: KeywordMetrics['intent'], confidence: number } => {
  const lowerKeyword = keyword.toLowerCase();
  
  // Patrones para diferentes intenciones
  const intentPatterns = {
    transactional: [
      'buy', 'purchase', 'order', 'shop', 'price', 'cost', 'cheap', 'discount',
      'deal', 'sale', 'coupon', 'free shipping', 'checkout', 'cart'
    ],
    commercial: [
      'best', 'top', 'review', 'compare', 'vs', 'alternative', 'recommendation',
      'guide to buying', 'which', 'should i', 'pros and cons'
    ],
    navigational: [
      'login', 'sign in', 'download', 'official', 'website', 'homepage',
      'contact', 'support', 'account', 'dashboard'
    ],
    informational: [
      'what is', 'how to', 'why', 'when', 'where', 'tutorial', 'guide',
      'learn', 'definition', 'meaning', 'explain', 'examples'
    ]
  };
  
  let maxScore = 0;
  let detectedIntent: KeywordMetrics['intent'] = 'informational';
  
  Object.entries(intentPatterns).forEach(([intent, patterns]) => {
    const score = patterns.reduce((acc, pattern) => {
      if (lowerKeyword.includes(pattern)) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent as KeywordMetrics['intent'];
    }
  });
  
  // Calcular confianza basada en número de matches
  const confidence = Math.min(0.95, 0.3 + (maxScore * 0.2));
  
  return { intent: detectedIntent, confidence };
};

// Función para generar métricas de keywords
const generateKeywordMetrics = (keywords: string[]): KeywordMetrics[] => {
  return keywords.map(keyword => {
    const { intent, confidence } = determineSearchIntent(keyword);
    
    // Generar métricas simuladas basadas en características de la keyword
    const wordCount = keyword.split(' ').length;
    const isCommercial = intent === 'commercial' || intent === 'transactional';
    
    // Volumen de búsqueda (keywords más largas = menor volumen)
    let baseVolume = 50000;
    if (wordCount > 3) baseVolume = 10000;
    else if (wordCount > 2) baseVolume = 25000;
    
    const searchVolume = Math.floor(Math.random() * baseVolume) + 1000;
    
    // Dificultad (keywords comerciales = mayor dificultad)
    let baseDifficulty = 40;
    if (isCommercial) baseDifficulty = 60;
    if (wordCount === 1) baseDifficulty += 20;
    
    const difficulty = Math.min(100, baseDifficulty + Math.floor(Math.random() * 30));
    
    // CPC (keywords comerciales = mayor CPC)
    let baseCpc = 1.0;
    if (isCommercial) baseCpc = 3.0;
    
    const cpc = Math.round((baseCpc + Math.random() * 5) * 100) / 100;
    
    // Competencia
    const competition = Math.round(Math.random() * 100) / 100;
    
    return {
      keyword,
      search_volume: searchVolume,
      difficulty,
      cpc,
      competition,
      intent,
      intent_confidence: Math.round(confidence * 100) / 100
    };
  });
};

// Función para calcular similitud semántica entre keywords
const calculateSemanticSimilarity = (keyword1: string, keyword2: string): number => {
  const words1 = keyword1.toLowerCase().split(' ');
  const words2 = keyword2.toLowerCase().split(' ');
  
  // Similitud basada en palabras comunes
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  const wordSimilarity = commonWords.length / totalWords;
  
  // Similitud basada en caracteres comunes (para detectar variaciones)
  const chars1 = new Set(keyword1.toLowerCase().replace(/\s/g, ''));
  const chars2 = new Set(keyword2.toLowerCase().replace(/\s/g, ''));
  const commonChars = [...chars1].filter(char => chars2.has(char));
  const charSimilarity = commonChars.length / Math.max(chars1.size, chars2.size);
  
  // Similitud basada en longitud (keywords de longitud similar son más relacionadas)
  const lengthDiff = Math.abs(keyword1.length - keyword2.length);
  const maxLength = Math.max(keyword1.length, keyword2.length);
  const lengthSimilarity = 1 - (lengthDiff / maxLength);
  
  // Combinar similitudes con pesos
  return (wordSimilarity * 0.6) + (charSimilarity * 0.2) + (lengthSimilarity * 0.2);
};

// Función para calcular similitud de intención
const calculateIntentSimilarity = (intent1: string, intent2: string): number => {
  if (intent1 === intent2) return 1.0;
  
  // Intenciones relacionadas tienen mayor similitud
  const intentRelations: { [key: string]: { [key: string]: number } } = {
    'commercial': { 'transactional': 0.7, 'informational': 0.3, 'navigational': 0.2 },
    'transactional': { 'commercial': 0.7, 'informational': 0.2, 'navigational': 0.3 },
    'informational': { 'commercial': 0.3, 'transactional': 0.2, 'navigational': 0.4 },
    'navigational': { 'informational': 0.4, 'commercial': 0.2, 'transactional': 0.3 }
  };
  
  return intentRelations[intent1]?.[intent2] || 0.1;
};

// Función para calcular similitud de métricas
const calculateMetricsSimilarity = (metrics1: KeywordMetrics, metrics2: KeywordMetrics): number => {
  // Normalizar métricas para comparación
  const volumeDiff = Math.abs(Math.log10(metrics1.search_volume + 1) - Math.log10(metrics2.search_volume + 1));
  const difficultyDiff = Math.abs(metrics1.difficulty - metrics2.difficulty) / 100;
  const cpcDiff = Math.abs(metrics1.cpc - metrics2.cpc) / Math.max(metrics1.cpc, metrics2.cpc, 1);
  
  // Calcular similitud (menor diferencia = mayor similitud)
  const volumeSimilarity = Math.max(0, 1 - (volumeDiff / 2));
  const difficultySimilarity = 1 - difficultyDiff;
  const cpcSimilarity = 1 - Math.min(1, cpcDiff);
  
  return (volumeSimilarity * 0.4) + (difficultySimilarity * 0.4) + (cpcSimilarity * 0.2);
};

// Función principal de clustering
const performClustering = (
  keywordMetrics: KeywordMetrics[],
  method: string,
  minClusterSize: number,
  maxClusters: number,
  similarityThreshold: number
): { clusters: Cluster[], unclustered: KeywordMetrics[] } => {
  
  const clusters: Cluster[] = [];
  const unclustered: KeywordMetrics[] = [];
  const processed = new Set<string>();
  
  // Calcular matriz de similitud
  const similarities: { [key: string]: { [key: string]: number } } = {};
  
  keywordMetrics.forEach((kw1, i) => {
    similarities[kw1.keyword] = {};
    keywordMetrics.forEach((kw2, j) => {
      if (i !== j) {
        let similarity = 0;
        
        switch (method) {
          case 'semantic':
            similarity = calculateSemanticSimilarity(kw1.keyword, kw2.keyword);
            break;
          case 'intent':
            similarity = calculateIntentSimilarity(kw1.intent, kw2.intent);
            break;
          case 'metrics':
            similarity = calculateMetricsSimilarity(kw1, kw2);
            break;
          case 'hybrid':
            const semantic = calculateSemanticSimilarity(kw1.keyword, kw2.keyword);
            const intent = calculateIntentSimilarity(kw1.intent, kw2.intent);
            const metrics = calculateMetricsSimilarity(kw1, kw2);
            similarity = (semantic * 0.5) + (intent * 0.3) + (metrics * 0.2);
            break;
        }
        
        similarities[kw1.keyword][kw2.keyword] = similarity;
      }
    });
  });
  
  // Algoritmo de clustering basado en similitud
  keywordMetrics.forEach(centroidKeyword => {
    if (processed.has(centroidKeyword.keyword) || clusters.length >= maxClusters) return;
    
    const clusterKeywords: ClusterKeyword[] = [];
    
    // Encontrar keywords similares al centroide
    keywordMetrics.forEach(keyword => {
      if (!processed.has(keyword.keyword)) {
        const similarity = keyword.keyword === centroidKeyword.keyword ? 1.0 : 
          similarities[centroidKeyword.keyword][keyword.keyword];
        
        if (similarity >= similarityThreshold) {
          clusterKeywords.push({
            ...keyword,
            similarity_to_centroid: similarity,
            cluster_relevance_score: similarity * (keyword.search_volume / 10000) // Factor de volumen
          });
        }
      }
    });
    
    // Crear cluster si tiene suficientes keywords
    if (clusterKeywords.length >= minClusterSize) {
      // Marcar keywords como procesadas
      clusterKeywords.forEach(kw => processed.add(kw.keyword));
      
      // Calcular métricas del cluster
      const avgSearchVolume = Math.round(
        clusterKeywords.reduce((sum, kw) => sum + kw.search_volume, 0) / clusterKeywords.length
      );
      const avgDifficulty = Math.round(
        clusterKeywords.reduce((sum, kw) => sum + kw.difficulty, 0) / clusterKeywords.length
      );
      const avgCpc = Math.round(
        (clusterKeywords.reduce((sum, kw) => sum + kw.cpc, 0) / clusterKeywords.length) * 100
      ) / 100;
      
      // Análisis de intención
      const intentCounts = clusterKeywords.reduce((acc, kw) => {
        acc[kw.intent] = (acc[kw.intent] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const dominantIntent = Object.entries(intentCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      const intentDistribution = {
        informational: Math.round((intentCounts['informational'] || 0) / clusterKeywords.length * 100),
        navigational: Math.round((intentCounts['navigational'] || 0) / clusterKeywords.length * 100),
        commercial: Math.round((intentCounts['commercial'] || 0) / clusterKeywords.length * 100),
        transactional: Math.round((intentCounts['transactional'] || 0) / clusterKeywords.length * 100)
      };
      
      // Calcular score del cluster
      const avgSimilarity = clusterKeywords.reduce((sum, kw) => sum + kw.similarity_to_centroid, 0) / clusterKeywords.length;
      const volumeScore = Math.min(100, avgSearchVolume / 1000);
      const clusterScore = Math.round((avgSimilarity * 50) + (volumeScore * 0.3) + (clusterKeywords.length * 2));
      
      // Generar nombre del cluster
      const commonWords = centroidKeyword.keyword.split(' ').slice(0, 2).join(' ');
      const clusterName = `${commonWords} cluster`.replace(/^\w/, c => c.toUpperCase());
      
      // Sugerir tipo de contenido
      let suggestedContentType = 'Blog post';
      switch (dominantIntent) {
        case 'informational':
          suggestedContentType = 'Tutorial/Guide';
          break;
        case 'commercial':
          suggestedContentType = 'Comparison/Review';
          break;
        case 'transactional':
          suggestedContentType = 'Product/Landing page';
          break;
        case 'navigational':
          suggestedContentType = 'Resource/Tool page';
          break;
      }
      
      // Generar oportunidades de contenido
      const contentOpportunities = [
        `Crear ${suggestedContentType.toLowerCase()} enfocado en "${centroidKeyword.keyword}"`,
        `Incluir ${clusterKeywords.length} keywords relacionadas en el contenido`,
        `Optimizar para intención ${dominantIntent}`,
        `Target de volumen: ${avgSearchVolume.toLocaleString()} búsquedas mensuales`
      ];
      
      clusters.push({
        id: `cluster_${clusters.length + 1}`,
        name: clusterName,
        centroid_keyword: centroidKeyword.keyword,
        keywords: clusterKeywords.sort((a, b) => b.cluster_relevance_score - a.cluster_relevance_score),
        size: clusterKeywords.length,
        avg_search_volume: avgSearchVolume,
        avg_difficulty: avgDifficulty,
        avg_cpc: avgCpc,
        dominant_intent: dominantIntent,
        intent_distribution: intentDistribution,
        cluster_score: clusterScore,
        suggested_content_type: suggestedContentType,
        content_opportunities: contentOpportunities
      });
    }
  });
  
  // Keywords no agrupadas
  keywordMetrics.forEach(kw => {
    if (!processed.has(kw.keyword)) {
      unclustered.push(kw);
    }
  });
  
  return { clusters, unclustered };
};

// POST /api/keyword-research/clustering/generate
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = clusteringSchema.parse(req.body);
    
    const {
      keywords,
      method,
      min_cluster_size,
      max_clusters,
      similarity_threshold,
      include_metrics,
      include_intent_analysis,
      language
    } = validatedData;

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 6000));

    // Generar métricas para todas las keywords
    const keywordMetrics = generateKeywordMetrics(keywords);
    
    // Realizar clustering
    const { clusters, unclustered } = performClustering(
      keywordMetrics,
      method,
      min_cluster_size,
      max_clusters,
      similarity_threshold
    );
    
    // Calcular estadísticas de clustering
    const totalKeywords = keywords.length;
    const clusteredKeywords = clusters.reduce((sum, cluster) => sum + cluster.size, 0);
    const unclusteredKeywords = unclustered.length;
    const avgClusterSize = clusters.length > 0 ? 
      Math.round(clusteredKeywords / clusters.length) : 0;
    
    // Score de clustering (qué tan bien se agruparon las keywords)
    const clusteringScore = Math.round((clusteredKeywords / totalKeywords) * 100);
    
    const clusteringStats = {
      total_keywords: totalKeywords,
      clustered_keywords: clusteredKeywords,
      unclustered_keywords: unclusteredKeywords,
      total_clusters: clusters.length,
      avg_cluster_size: avgClusterSize,
      clustering_score: clusteringScore,
      method_used: method
    };
    
    // Análisis de intención general
    let intentAnalysis = {
      overall_distribution: {
        informational: 0,
        navigational: 0,
        commercial: 0,
        transactional: 0
      },
      dominant_intent: 'informational',
      intent_diversity_score: 0
    };
    
    if (include_intent_analysis) {
      const allIntents = keywordMetrics.map(kw => kw.intent);
      const intentCounts = allIntents.reduce((acc, intent) => {
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      intentAnalysis.overall_distribution = {
        informational: Math.round((intentCounts['informational'] || 0) / totalKeywords * 100),
        navigational: Math.round((intentCounts['navigational'] || 0) / totalKeywords * 100),
        commercial: Math.round((intentCounts['commercial'] || 0) / totalKeywords * 100),
        transactional: Math.round((intentCounts['transactional'] || 0) / totalKeywords * 100)
      };
      
      intentAnalysis.dominant_intent = Object.entries(intentCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      // Diversidad de intención (qué tan variadas son las intenciones)
      const intentValues = Object.values(intentAnalysis.overall_distribution);
      const maxIntent = Math.max(...intentValues);
      intentAnalysis.intent_diversity_score = Math.round(100 - maxIntent);
    }
    
    // Generar recomendaciones
    const recommendations = {
      content_strategy: [] as string[],
      cluster_optimization: [] as string[],
      keyword_expansion: [] as string[]
    };
    
    // Recomendaciones de estrategia de contenido
    if (clusters.length > 0) {
      const topCluster = clusters.sort((a, b) => b.cluster_score - a.cluster_score)[0];
      recommendations.content_strategy.push(
        `Priorizar el cluster "${topCluster.name}" con ${topCluster.size} keywords`,
        `Crear contenido pillar para intención ${intentAnalysis.dominant_intent}`,
        `Aprovechar clusters con alto volumen de búsqueda promedio`
      );
    }
    
    // Recomendaciones de optimización de clusters
    if (clusteringScore < 70) {
      recommendations.cluster_optimization.push(
        'Ajustar threshold de similitud para mejorar agrupación',
        'Considerar método de clustering híbrido para mejores resultados'
      );
    }
    
    if (unclusteredKeywords > totalKeywords * 0.3) {
      recommendations.cluster_optimization.push(
        'Muchas keywords sin agrupar - revisar criterios de similitud',
        'Considerar crear clusters adicionales para keywords aisladas'
      );
    }
    
    // Recomendaciones de expansión de keywords
    recommendations.keyword_expansion.push(
      'Buscar keywords long-tail para cada cluster identificado',
      'Investigar keywords relacionadas semánticamente',
      'Analizar keywords de competidores en cada cluster'
    );
    
    const result: ClusteringResult = {
      clusters: clusters.sort((a, b) => b.cluster_score - a.cluster_score),
      unclustered_keywords: unclustered,
      clustering_stats: clusteringStats,
      intent_analysis: intentAnalysis,
      recommendations
    };

    res.json({
      success: true,
      data: result,
      analysis_params: {
        method,
        min_cluster_size,
        max_clusters,
        similarity_threshold,
        language,
        analysis_depth: {
          metrics: include_metrics,
          intent_analysis: include_intent_analysis
        }
      }
    });

  } catch (error) {
    console.error('Error en clustering de keywords:', error);
    
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
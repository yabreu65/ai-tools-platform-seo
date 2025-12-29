/**
 * Algoritmos de análisis para Keyword Research Tool
 * Exporta todos los algoritmos especializados
 */

// Algoritmo de análisis de dificultad
export { default as KeywordDifficultyAnalyzer } from './difficulty-analyzer';
export type { 
  DifficultyFactor, 
  CompetitorMetrics, 
  SerpAnalysis, 
  DifficultyAnalysisResult 
} from './difficulty-analyzer';

// Algoritmo de clustering NLP
export { default as NLPKeywordClustering } from './nlp-clustering';
export type { 
  KeywordData as ClusteringKeywordData, 
  KeywordCluster, 
  ClusteringOptions, 
  ClusteringResult 
} from './nlp-clustering';

// Algoritmo de análisis de tendencias
export { default as TrendAnalyzer } from './trend-analyzer';
export type { 
  TrendDataPoint, 
  TrendAnalysisResult, 
  TrendAnalysisOptions, 
  SeasonalityPattern 
} from './trend-analyzer';

// Algoritmo de análisis SERP
export { default as SerpAnalyzer } from './serp-analyzer';
export type { 
  SerpFeature, 
  OrganicResult, 
  PaidResult, 
  LocalResult, 
  SerpAnalysisData, 
  SerpAnalysisResult 
} from './serp-analyzer';

// Instancias singleton para uso global
export const difficultyAnalyzer = new KeywordDifficultyAnalyzer();
export const nlpClustering = new NLPKeywordClustering();
export const trendAnalyzer = new TrendAnalyzer();
export const serpAnalyzer = new SerpAnalyzer();

// Utilidades comunes
export const AnalysisUtils = {
  /**
   * Normaliza un score a escala 0-100
   */
  normalizeScore: (value: number, min: number, max: number): number => {
    return Math.round(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
  },

  /**
   * Calcula percentil de un valor en un array
   */
  calculatePercentile: (value: number, array: number[]): number => {
    const sorted = [...array].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index === -1 ? 100 : Math.round((index / sorted.length) * 100);
  },

  /**
   * Calcula correlación entre dos arrays
   */
  calculateCorrelation: (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  },

  /**
   * Calcula media móvil
   */
  movingAverage: (data: number[], window: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.floor(window / 2) + 1);
      const windowData = data.slice(start, end);
      const avg = windowData.reduce((sum, val) => sum + val, 0) / windowData.length;
      result.push(avg);
    }
    return result;
  },

  /**
   * Detecta outliers usando IQR
   */
  detectOutliers: (data: number[]): { outliers: number[]; cleaned: number[] } => {
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = data.filter(val => val < lowerBound || val > upperBound);
    const cleaned = data.filter(val => val >= lowerBound && val <= upperBound);

    return { outliers, cleaned };
  },

  /**
   * Calcula confianza estadística
   */
  calculateConfidence: (sampleSize: number, variance: number): number => {
    if (sampleSize < 2) return 0;
    
    // Usar distribución t para muestras pequeñas
    const tValue = sampleSize < 30 ? 2.0 : 1.96; // Aproximación
    const standardError = Math.sqrt(variance / sampleSize);
    const marginOfError = tValue * standardError;
    
    // Convertir a score de confianza 0-1
    return Math.max(0, Math.min(1, 1 - (marginOfError / Math.sqrt(variance))));
  }
};

// Constantes útiles
export const ANALYSIS_CONSTANTS = {
  // Umbrales de dificultad
  DIFFICULTY_THRESHOLDS: {
    VERY_EASY: 20,
    EASY: 35,
    MEDIUM: 50,
    HARD: 65,
    VERY_HARD: 80
  },

  // Umbrales de volumen
  VOLUME_THRESHOLDS: {
    LOW: 1000,
    MEDIUM: 10000,
    HIGH: 50000,
    VERY_HIGH: 100000
  },

  // Umbrales de CPC
  CPC_THRESHOLDS: {
    LOW: 0.5,
    MEDIUM: 2.0,
    HIGH: 5.0,
    VERY_HIGH: 10.0
  },

  // Pesos para scoring
  SCORING_WEIGHTS: {
    VOLUME: 0.25,
    DIFFICULTY: 0.30,
    CPC: 0.15,
    COMPETITION: 0.20,
    TREND: 0.10
  },

  // Configuraciones de clustering
  CLUSTERING_DEFAULTS: {
    MIN_CLUSTER_SIZE: 3,
    MAX_CLUSTERS: 50,
    SIMILARITY_THRESHOLD: 0.6
  },

  // Configuraciones de tendencias
  TREND_DEFAULTS: {
    SMOOTHING_WINDOW: 7,
    SEASONALITY_THRESHOLD: 0.3,
    VOLATILITY_WINDOW: 30
  }
};

export default {
  difficultyAnalyzer,
  nlpClustering,
  trendAnalyzer,
  serpAnalyzer,
  AnalysisUtils,
  ANALYSIS_CONSTANTS
};
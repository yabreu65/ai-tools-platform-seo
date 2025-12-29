export { default as KeywordTable } from './KeywordTable';
export { default as TrendChart } from './TrendChart';
export { default as DifficultyMeter } from './DifficultyMeter';
export { default as ClusteringVisualization } from './ClusteringVisualization';
export { default as SerpAnalysis } from './SerpAnalysis';
export { default as MetricsCard, KeywordMetrics } from './MetricsCard';
export { default as AdvancedFilters } from './AdvancedFilters';
export { default as KeywordSearch } from './KeywordSearch';

// Tipos exportados para uso en otras partes de la aplicación
export type {
  KeywordData,
  TrendDataPoint,
  SeasonalityData,
  DifficultyAnalysis,
  DifficultyFactor,
  KeywordCluster,
  SerpAnalysisData,
  SerpFeature,
  OrganicResult,
  PaidResult,
  LocalResult
} from './types';

export type { FilterState } from './AdvancedFilters';
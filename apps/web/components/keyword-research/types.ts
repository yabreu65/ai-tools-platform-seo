// Tipos para KeywordTable
export interface KeywordData {
  keyword: string;
  position?: number | null;
  positionChange?: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trafficPotential: number;
  serpFeatures: string[];
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
  competition?: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
}

// Tipos para TrendChart
export interface TrendDataPoint {
  date: string;
  volume: number;
  difficulty?: number;
  cpc?: number;
  competition?: number;
  interest?: number;
}

export interface SeasonalityData {
  month: string;
  avgVolume: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// Tipos para DifficultyMeter
export interface DifficultyFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface DifficultyAnalysis {
  overallScore: number;
  factors: DifficultyFactor[];
  recommendation: string;
  timeToRank?: string;
  competitorStrength?: 'low' | 'medium' | 'high';
  opportunities?: string[];
  challenges?: string[];
}

// Tipos para ClusteringVisualization
export interface KeywordCluster {
  id: string;
  name: string;
  keywords: string[];
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  avgVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  color: string;
  size: number;
  topKeywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
  }>;
}

// Tipos para SerpAnalysis
export interface SerpFeature {
  type: string;
  name: string;
  present: boolean;
  position?: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  domainAuthority: number;
  pageSpeed: number;
  contentLength: number;
  keywordDensity: number;
  backlinks: number;
  socialSignals: number;
  isCompetitor?: boolean;
}

export interface PaidResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  extensions: string[];
}

export interface LocalResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  category: string;
}

export interface SerpAnalysisData {
  keyword: string;
  location: string;
  device: 'desktop' | 'mobile';
  totalResults: number;
  features: SerpFeature[];
  organicResults: OrganicResult[];
  paidResults: PaidResult[];
  localResults: LocalResult[];
  competitorInsights: {
    topCompetitors: string[];
    avgDomainAuthority: number;
    avgContentLength: number;
    commonFeatures: string[];
  };
  opportunities: string[];
  threats: string[];
}

// Tipos comunes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  minVolume?: number;
  maxVolume?: number;
  minDifficulty?: number;
  maxDifficulty?: number;
  intent?: string;
  competition?: string;
  country?: string;
  language?: string;
}
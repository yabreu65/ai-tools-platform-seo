export interface KeywordAnalysisConfig {
  depth: number;
  language: string;
  includeMetaTags: boolean;
  includeHeadings: boolean;
  includeContent: boolean;
  userAgent?: string;
  excludeElements?: string[];
}

export interface KeywordAnalysis {
  id: string;
  userId: string;
  urls: string[];
  config: KeywordAnalysisConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metrics: AnalysisMetrics;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
  error?: string;
}

export interface ExtractedKeyword {
  id: string;
  analysisId: string;
  keyword: string;
  frequency: number;
  density: number;
  category: 'primary' | 'secondary' | 'long-tail' | 'brand';
  positions: string[];
  relevanceScore: number;
  sourceUrl: string;
  createdAt: Date;
}

export interface CompetitorData {
  id: string;
  analysisId: string;
  url: string;
  title: string;
  metaDescription: string;
  extractedContent: {
    headings: { [key: string]: string[] };
    metaTags: { [key: string]: string };
    paragraphs: string[];
    links: { text: string; href: string }[];
  };
  totalKeywords: number;
  processingTime: number;
  createdAt: Date;
}

export interface Opportunity {
  id: string;
  analysisId: string;
  type: 'gap' | 'optimization' | 'expansion' | 'trending';
  description: string;
  suggestedKeywords: string[];
  priority: number; // 1-5
  confidenceScore: number;
  createdAt: Date;
}

export interface AnalysisMetrics {
  totalKeywords: number;
  processingTime: number;
  urlsProcessed: number;
  urlsFailed: number;
  keywordsByCategory: {
    primary: number;
    secondary: number;
    longTail: number;
    brand: number;
  };
  averageDensity: number;
  topKeywords: Array<{
    keyword: string;
    frequency: number;
    density: number;
  }>;
}

export interface AnalysisRequest {
  urls: string[];
  depth?: number;
  language?: string;
  includeMetaTags?: boolean;
  includeHeadings?: boolean;
  includeContent?: boolean;
}

export interface AnalysisResponse {
  analysisId: string;
  status: string;
  estimatedTime: number;
}

export interface ResultsResponse {
  analysis: KeywordAnalysis;
  keywords: ExtractedKeyword[];
  competitors: CompetitorData[];
  opportunities: Opportunity[];
  metrics: AnalysisMetrics;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  includeMetrics?: boolean;
  includeOpportunities?: boolean;
}

export interface UserPlanLimits {
  maxUrls: number;
  maxAnalysesPerMonth: number;
  maxKeywordsPerResult: number;
  canExportPdf: boolean;
}

export interface ScrapingResult {
  url: string;
  success: boolean;
  title?: string;
  metaDescription?: string;
  content?: {
    headings: { [key: string]: string[] };
    metaTags: { [key: string]: string };
    paragraphs: string[];
    links: { text: string; href: string }[];
  };
  error?: string;
  processingTime: number;
}

export interface KeywordExtractionResult {
  keywords: Array<{
    keyword: string;
    frequency: number;
    density: number;
    positions: string[];
    category: string;
    relevanceScore: number;
  }>;
  totalWords: number;
  uniqueWords: number;
}

export interface AIAnalysisResult {
  keywords: Array<{
    keyword: string;
    category: 'primary' | 'secondary' | 'long-tail' | 'brand';
    relevanceScore: number;
    semanticGroup?: string;
  }>;
  opportunities: Array<{
    type: 'gap' | 'optimization' | 'expansion' | 'trending';
    description: string;
    suggestedKeywords: string[];
    priority: number;
    confidenceScore: number;
  }>;
}
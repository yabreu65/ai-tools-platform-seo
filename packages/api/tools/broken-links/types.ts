export interface BrokenLink {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  errorType: string;
  linkType: 'internal' | 'external';
}

export interface AnalysisStatus {
  analysisId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  pagesAnalyzed: number;
  linksFound: number;
  brokenLinks: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface AnalysisResults {
  summary: {
    totalPages: number;
    totalLinks: number;
    brokenLinks: number;
    healthScore: number;
    analysisTime: number;
  };
  brokenLinks: BrokenLink[];
  recommendations: string[];
}

export interface AnalysisConfig {
  url: string;
  depth: number;
  excludePaths: string[];
  includeExternal: boolean;
  timeout: number;
  userId?: string;
  userPlan?: string;
}

export interface ProgressData {
  percentage: number;
  pagesAnalyzed: number;
  linksFound: number;
  brokenLinks: number;
}

export interface PageData {
  url: string;
  statusCode: number;
  linksCount: number;
}

export interface BrokenLinkData {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  errorType: string;
  linkType: 'internal' | 'external';
}
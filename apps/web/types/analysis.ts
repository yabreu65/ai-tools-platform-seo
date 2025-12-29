export interface Analysis {
  id: string;
  userId: string;
  toolType: ToolType;
  title: string;
  description?: string;
  input: Record<string, any>;
  output: Record<string, any>;
  metadata: AnalysisMetadata;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  isPublic: boolean;
  shareToken?: string;
  category?: string;
  tags: string[];
}

export interface AnalysisMetadata {
  executionTime: number;
  inputSize: number;
  outputSize: number;
  version: string;
  userAgent?: string;
  ipAddress?: string;
}

export type ToolType = 
  | 'seo-title-generator'
  | 'content-optimizer'
  | 'duplicate-detector'
  | 'seo-audit'
  | 'broken-links'
  | 'core-web-vitals'
  | 'sitemap-generator'
  | 'robots-generator'
  | 'keyword-scraper'
  | 'competitor-analysis'
  | 'image-renamer'
  | 'image-compressor';

export interface SavedAnalysis {
  analysis: Analysis;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface AnalysisFilter {
  toolType?: ToolType[];
  category?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  isFavorite?: boolean;
  isPublic?: boolean;
  search?: string;
}

export interface AnalysisStats {
  totalAnalysis: number;
  toolsUsed: number;
  favoriteCount: number;
  publicCount: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  mostUsedTool: ToolType;
  avgExecutionTime: number;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'excel';
  includeMetadata: boolean;
  includeCharts: boolean;
  template?: 'professional' | 'simple' | 'detailed';
  branding: {
    logo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
  filters?: AnalysisFilter;
}

export interface ShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  expiresAt?: Date;
  password?: string;
  downloadEnabled: boolean;
}
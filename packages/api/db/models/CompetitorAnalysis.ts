import mongoose, { Document, Schema } from 'mongoose';

// Interfaces
export interface ICompetitorAnalysis extends Document {
  userId: string;
  analysisId: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Configuration
  config: {
    competitors: string[];
    analysisType: 'basic' | 'advanced' | 'comprehensive';
    depth: number;
    includeHistoricalData: boolean;
    keywordLimit: number;
    includeBacklinks: boolean;
    includeContent: boolean;
    includeTechnical: boolean;
  };
  
  // Results
  results?: {
    overview: {
      totalCompetitors: number;
      totalKeywords: number;
      totalBacklinks: number;
      averageDomainRating: number;
      processingTime: number;
    };
    
    competitors: ICompetitorData[];
    
    insights: {
      keywordGaps: IKeywordGap[];
      contentGaps: IContentGap[];
      backlinkOpportunities: IBacklinkOpportunity[];
      technicalInsights: ITechnicalInsight[];
      aiInsights: string[];
    };
    
    comparisons: {
      keywordOverlap: IKeywordOverlap[];
      contentSimilarity: IContentSimilarity[];
      backlinkComparison: IBacklinkComparison[];
      technicalComparison: ITechnicalComparison[];
    };
  };
  
  // Metadata
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  lastAnalyzedAt?: Date;
}

export interface ICompetitorData {
  domain: string;
  name?: string;
  
  // SEO Metrics
  metrics: {
    domainRating: number;
    organicKeywords: number;
    organicTraffic: number;
    backlinks: number;
    referringDomains: number;
    technicalScore: number;
    contentScore: number;
  };
  
  // Keywords
  topKeywords: IKeywordData[];
  keywordDistribution: {
    branded: number;
    nonBranded: number;
    longTail: number;
    shortTail: number;
  };
  
  // Content
  topPages: IPageData[];
  contentCategories: IContentCategory[];
  
  // Backlinks
  backlinkProfile: IBacklinkProfile;
  
  // Technical
  technicalMetrics: ITechnicalMetrics;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  lastUpdated: Date;
}

export interface IKeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  traffic: number;
  url: string;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  trend: 'rising' | 'stable' | 'declining';
}

export interface IPageData {
  url: string;
  title: string;
  traffic: number;
  keywords: number;
  backlinks: number;
  contentType: string;
  wordCount: number;
  lastModified?: Date;
}

export interface IBacklinkProfile {
  totalBacklinks: number;
  referringDomains: number;
  domainRatingDistribution: {
    high: number; // DR 70+
    medium: number; // DR 30-69
    low: number; // DR 0-29
  };
  linkTypes: {
    dofollow: number;
    nofollow: number;
  };
  anchorTextDistribution: {
    branded: number;
    exact: number;
    partial: number;
    generic: number;
  };
  topBacklinks: IBacklinkData[];
}

export interface IBacklinkData {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainRating: number;
  linkType: 'dofollow' | 'nofollow';
  firstSeen: Date;
  lastSeen: Date;
}

export interface ITechnicalMetrics {
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  seoScore: number;
  mobileFriendly: boolean;
  httpsEnabled: boolean;
  structuredData: boolean;
  xmlSitemap: boolean;
  robotsTxt: boolean;
}

export interface IContentCategory {
  category: string;
  pageCount: number;
  avgWordCount: number;
  avgTraffic: number;
  topKeywords: string[];
}

export interface IKeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  competitorPositions: { [domain: string]: number };
  opportunity: 'high' | 'medium' | 'low';
  reason: string;
}

export interface IContentGap {
  topic: string;
  competitorCoverage: { [domain: string]: number };
  suggestedContent: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTraffic: number;
}

export interface IBacklinkOpportunity {
  domain: string;
  domainRating: number;
  competitorBacklinks: number;
  linkType: string;
  contactInfo?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ITechnicalInsight {
  category: 'performance' | 'seo' | 'mobile' | 'security';
  issue: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  competitorComparison: { [domain: string]: boolean };
}

export interface IKeywordOverlap {
  keyword: string;
  volume: number;
  positions: { [domain: string]: number };
  overlapType: 'shared' | 'unique' | 'gap';
}

export interface IContentSimilarity {
  topic: string;
  similarity: number;
  competitors: string[];
  differentiators: string[];
}

export interface IBacklinkComparison {
  metric: string;
  values: { [domain: string]: number };
  leader: string;
  insights: string[];
}

export interface ITechnicalComparison {
  metric: string;
  values: { [domain: string]: number | boolean };
  benchmark: number | boolean;
  recommendations: string[];
}

// Schemas
const keywordDataSchema = new Schema<IKeywordData>({
  keyword: { type: String, required: true },
  position: { type: Number, required: true },
  volume: { type: Number, default: 0 },
  difficulty: { type: Number, default: 0 },
  traffic: { type: Number, default: 0 },
  url: { type: String, required: true },
  intent: { 
    type: String, 
    enum: ['informational', 'navigational', 'commercial', 'transactional'],
    default: 'informational'
  },
  trend: {
    type: String,
    enum: ['rising', 'stable', 'declining'],
    default: 'stable'
  }
});

const pageDataSchema = new Schema<IPageData>({
  url: { type: String, required: true },
  title: { type: String, required: true },
  traffic: { type: Number, default: 0 },
  keywords: { type: Number, default: 0 },
  backlinks: { type: Number, default: 0 },
  contentType: { type: String, default: 'page' },
  wordCount: { type: Number, default: 0 },
  lastModified: { type: Date }
});

const backlinkDataSchema = new Schema<IBacklinkData>({
  sourceUrl: { type: String, required: true },
  targetUrl: { type: String, required: true },
  anchorText: { type: String, required: true },
  domainRating: { type: Number, default: 0 },
  linkType: { 
    type: String, 
    enum: ['dofollow', 'nofollow'],
    default: 'dofollow'
  },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

const competitorDataSchema = new Schema<ICompetitorData>({
  domain: { type: String, required: true },
  name: { type: String },
  
  metrics: {
    domainRating: { type: Number, default: 0 },
    organicKeywords: { type: Number, default: 0 },
    organicTraffic: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 },
    referringDomains: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    contentScore: { type: Number, default: 0 }
  },
  
  topKeywords: [keywordDataSchema],
  keywordDistribution: {
    branded: { type: Number, default: 0 },
    nonBranded: { type: Number, default: 0 },
    longTail: { type: Number, default: 0 },
    shortTail: { type: Number, default: 0 }
  },
  
  topPages: [pageDataSchema],
  contentCategories: [{
    category: { type: String, required: true },
    pageCount: { type: Number, default: 0 },
    avgWordCount: { type: Number, default: 0 },
    avgTraffic: { type: Number, default: 0 },
    topKeywords: [{ type: String }]
  }],
  
  backlinkProfile: {
    totalBacklinks: { type: Number, default: 0 },
    referringDomains: { type: Number, default: 0 },
    domainRatingDistribution: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 }
    },
    linkTypes: {
      dofollow: { type: Number, default: 0 },
      nofollow: { type: Number, default: 0 }
    },
    anchorTextDistribution: {
      branded: { type: Number, default: 0 },
      exact: { type: Number, default: 0 },
      partial: { type: Number, default: 0 },
      generic: { type: Number, default: 0 }
    },
    topBacklinks: [backlinkDataSchema]
  },
  
  technicalMetrics: {
    pageSpeed: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 }
    },
    coreWebVitals: {
      lcp: { type: Number, default: 0 },
      fid: { type: Number, default: 0 },
      cls: { type: Number, default: 0 }
    },
    seoScore: { type: Number, default: 0 },
    mobileFriendly: { type: Boolean, default: false },
    httpsEnabled: { type: Boolean, default: false },
    structuredData: { type: Boolean, default: false },
    xmlSitemap: { type: Boolean, default: false },
    robotsTxt: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

const competitorAnalysisSchema = new Schema<ICompetitorAnalysis>({
  userId: { type: String, required: true, index: true },
  analysisId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  config: {
    competitors: [{ type: String, required: true }],
    analysisType: {
      type: String,
      enum: ['basic', 'advanced', 'comprehensive'],
      default: 'basic'
    },
    depth: { type: Number, default: 1, min: 1, max: 5 },
    includeHistoricalData: { type: Boolean, default: false },
    keywordLimit: { type: Number, default: 100 },
    includeBacklinks: { type: Boolean, default: true },
    includeContent: { type: Boolean, default: true },
    includeTechnical: { type: Boolean, default: false }
  },
  
  results: {
    overview: {
      totalCompetitors: { type: Number, default: 0 },
      totalKeywords: { type: Number, default: 0 },
      totalBacklinks: { type: Number, default: 0 },
      averageDomainRating: { type: Number, default: 0 },
      processingTime: { type: Number, default: 0 }
    },
    
    competitors: [competitorDataSchema],
    
    insights: {
      keywordGaps: [{
        keyword: { type: String, required: true },
        volume: { type: Number, default: 0 },
        difficulty: { type: Number, default: 0 },
        competitorPositions: { type: Schema.Types.Mixed, default: {} },
        opportunity: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium'
        },
        reason: { type: String, required: true }
      }],
      
      contentGaps: [{
        topic: { type: String, required: true },
        competitorCoverage: { type: Schema.Types.Mixed, default: {} },
        suggestedContent: [{ type: String }],
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium'
        },
        estimatedTraffic: { type: Number, default: 0 }
      }],
      
      backlinkOpportunities: [{
        domain: { type: String, required: true },
        domainRating: { type: Number, default: 0 },
        competitorBacklinks: { type: Number, default: 0 },
        linkType: { type: String, required: true },
        contactInfo: { type: String },
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium'
        }
      }],
      
      technicalInsights: [{
        category: {
          type: String,
          enum: ['performance', 'seo', 'mobile', 'security'],
          required: true
        },
        issue: { type: String, required: true },
        impact: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium'
        },
        recommendation: { type: String, required: true },
        competitorComparison: { type: Schema.Types.Mixed, default: {} }
      }],
      
      aiInsights: [{ type: String }]
    },
    
    comparisons: {
      keywordOverlap: [{
        keyword: { type: String, required: true },
        volume: { type: Number, default: 0 },
        positions: { type: Schema.Types.Mixed, default: {} },
        overlapType: {
          type: String,
          enum: ['shared', 'unique', 'gap'],
          default: 'shared'
        }
      }],
      
      contentSimilarity: [{
        topic: { type: String, required: true },
        similarity: { type: Number, default: 0 },
        competitors: [{ type: String }],
        differentiators: [{ type: String }]
      }],
      
      backlinkComparison: [{
        metric: { type: String, required: true },
        values: { type: Schema.Types.Mixed, default: {} },
        leader: { type: String },
        insights: [{ type: String }]
      }],
      
      technicalComparison: [{
        metric: { type: String, required: true },
        values: { type: Schema.Types.Mixed, default: {} },
        benchmark: { type: Schema.Types.Mixed },
        recommendations: [{ type: String }]
      }]
    }
  },
  
  error: { type: String },
  completedAt: { type: Date },
  lastAnalyzedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for performance
competitorAnalysisSchema.index({ userId: 1, createdAt: -1 });
competitorAnalysisSchema.index({ status: 1, createdAt: -1 });
competitorAnalysisSchema.index({ analysisId: 1 });
competitorAnalysisSchema.index({ 'config.competitors': 1 });

export default mongoose.model<ICompetitorAnalysis>('CompetitorAnalysis', competitorAnalysisSchema);
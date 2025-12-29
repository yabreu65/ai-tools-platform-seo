import mongoose, { Schema, Document } from 'mongoose';
import {
  KeywordAnalysis,
  ExtractedKeyword,
  CompetitorData,
  Opportunity,
  AnalysisMetrics,
  KeywordAnalysisConfig
} from './types';

// Keyword Analysis Schema
const keywordAnalysisConfigSchema = new Schema<KeywordAnalysisConfig>({
  depth: { type: Number, default: 1, min: 1, max: 5 },
  language: { type: String, default: 'auto' },
  includeMetaTags: { type: Boolean, default: true },
  includeHeadings: { type: Boolean, default: true },
  includeContent: { type: Boolean, default: true },
  userAgent: { type: String },
  excludeElements: [{ type: String }]
});

const analysisMetricsSchema = new Schema<AnalysisMetrics>({
  totalKeywords: { type: Number, default: 0 },
  processingTime: { type: Number, default: 0 },
  urlsProcessed: { type: Number, default: 0 },
  urlsFailed: { type: Number, default: 0 },
  keywordsByCategory: {
    primary: { type: Number, default: 0 },
    secondary: { type: Number, default: 0 },
    longTail: { type: Number, default: 0 },
    brand: { type: Number, default: 0 }
  },
  averageDensity: { type: Number, default: 0 },
  topKeywords: [{
    keyword: { type: String, required: true },
    frequency: { type: Number, required: true },
    density: { type: Number, required: true }
  }]
});

const keywordAnalysisSchema = new Schema<KeywordAnalysis & Document>({
  userId: { type: String, required: true, index: true },
  urls: [{ type: String, required: true }],
  config: { type: keywordAnalysisConfigSchema, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  metrics: { type: analysisMetricsSchema, default: {} },
  error: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now }
});

// Extracted Keywords Schema
const extractedKeywordSchema = new Schema<ExtractedKeyword & Document>({
  analysisId: { type: String, required: true, index: true },
  keyword: { type: String, required: true, index: true },
  frequency: { type: Number, required: true, min: 0 },
  density: { type: Number, required: true, min: 0, max: 100 },
  category: {
    type: String,
    enum: ['primary', 'secondary', 'long-tail', 'brand'],
    default: 'primary',
    index: true
  },
  positions: [{ type: String }],
  relevanceScore: { type: Number, min: 0, max: 1, default: 0 },
  sourceUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Competitor Data Schema
const competitorDataSchema = new Schema<CompetitorData & Document>({
  analysisId: { type: String, required: true, index: true },
  url: { type: String, required: true, index: true },
  title: { type: String },
  metaDescription: { type: String },
  extractedContent: {
    headings: { type: Schema.Types.Mixed, default: {} },
    metaTags: { type: Schema.Types.Mixed, default: {} },
    paragraphs: [{ type: String }],
    links: [{
      text: { type: String },
      href: { type: String }
    }]
  },
  totalKeywords: { type: Number, default: 0 },
  processingTime: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Opportunities Schema
const opportunitySchema = new Schema<Opportunity & Document>({
  analysisId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['gap', 'optimization', 'expansion', 'trending'],
    required: true,
    index: true
  },
  description: { type: String, required: true },
  suggestedKeywords: [{ type: String }],
  priority: { type: Number, min: 1, max: 5, default: 1, index: true },
  confidenceScore: { type: Number, min: 0, max: 1, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
keywordAnalysisSchema.index({ userId: 1, createdAt: -1 });
keywordAnalysisSchema.index({ status: 1, createdAt: -1 });
extractedKeywordSchema.index({ analysisId: 1, relevanceScore: -1 });
extractedKeywordSchema.index({ analysisId: 1, category: 1 });
competitorDataSchema.index({ analysisId: 1, url: 1 });
opportunitySchema.index({ analysisId: 1, priority: -1 });

// Models
export const KeywordAnalysisModel = mongoose.model<KeywordAnalysis & Document>(
  'KeywordAnalysis',
  keywordAnalysisSchema
);

export const ExtractedKeywordModel = mongoose.model<ExtractedKeyword & Document>(
  'ExtractedKeyword',
  extractedKeywordSchema
);

export const CompetitorDataModel = mongoose.model<CompetitorData & Document>(
  'CompetitorData',
  competitorDataSchema
);

export const OpportunityModel = mongoose.model<Opportunity & Document>(
  'Opportunity',
  opportunitySchema
);
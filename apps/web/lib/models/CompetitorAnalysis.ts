import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetitorAnalysis extends Document {
  userId: string;
  analysisId: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
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
  
  results?: {
    overview: {
      totalCompetitors: number;
      totalKeywords: number;
      totalBacklinks: number;
      averageDomainRating: number;
      processingTime: number;
    };
    competitors: any[];
    insights: {
      keywordGaps: any[];
      contentGaps: any[];
      backlinkOpportunities: any[];
      technicalInsights: any[];
      aiInsights: string[];
    };
    comparisons: {
      keywordOverlap: any[];
      contentSimilarity: any[];
      backlinkComparison: any[];
      technicalComparison: any[];
    };
  };
  
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

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
    competitors: [{ type: Schema.Types.Mixed }],
    insights: {
      keywordGaps: [{ type: Schema.Types.Mixed }],
      contentGaps: [{ type: Schema.Types.Mixed }],
      backlinkOpportunities: [{ type: Schema.Types.Mixed }],
      technicalInsights: [{ type: Schema.Types.Mixed }],
      aiInsights: [{ type: String }]
    },
    comparisons: {
      keywordOverlap: [{ type: Schema.Types.Mixed }],
      contentSimilarity: [{ type: Schema.Types.Mixed }],
      backlinkComparison: [{ type: Schema.Types.Mixed }],
      technicalComparison: [{ type: Schema.Types.Mixed }]
    }
  },
  
  error: { type: String },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for performance
competitorAnalysisSchema.index({ userId: 1, createdAt: -1 });
competitorAnalysisSchema.index({ status: 1, createdAt: -1 });
competitorAnalysisSchema.index({ analysisId: 1 });

export default mongoose.models.CompetitorAnalysis || mongoose.model<ICompetitorAnalysis>('CompetitorAnalysis', competitorAnalysisSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetitorReport extends Document {
  userId: string;
  reportId: string;
  name: string;
  description?: string;
  
  // Report configuration
  config: {
    analysisId: string;
    reportType: 'summary' | 'detailed' | 'executive' | 'technical';
    format: 'pdf' | 'excel' | 'csv' | 'json';
    sections: {
      overview: boolean;
      keywordAnalysis: boolean;
      backlinkAnalysis: boolean;
      contentAnalysis: boolean;
      technicalAnalysis: boolean;
      competitorComparison: boolean;
      recommendations: boolean;
      charts: boolean;
    };
    customization: {
      logo?: string;
      brandColors?: {
        primary: string;
        secondary: string;
      };
      includeRawData: boolean;
      includeMethodology: boolean;
    };
  };
  
  // Generation status
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Generated files
  files: {
    pdf?: {
      url: string;
      size: number;
      pages: number;
      generatedAt: Date;
    };
    excel?: {
      url: string;
      size: number;
      sheets: string[];
      generatedAt: Date;
    };
    csv?: {
      url: string;
      size: number;
      rows: number;
      generatedAt: Date;
    };
    json?: {
      url: string;
      size: number;
      generatedAt: Date;
    };
  };
  
  // Report metadata
  metadata: {
    totalCompetitors: number;
    totalKeywords: number;
    totalBacklinks: number;
    dataPoints: number;
    generationTime: number; // milliseconds
    templateVersion: string;
  };
  
  // Sharing and access
  sharing: {
    isPublic: boolean;
    shareToken?: string;
    expiresAt?: Date;
    downloadCount: number;
    lastDownloaded?: Date;
  };
  
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface IReportTemplate extends Document {
  templateId: string;
  name: string;
  description: string;
  category: 'business' | 'technical' | 'executive' | 'custom';
  
  // Template configuration
  config: {
    format: 'pdf' | 'excel' | 'powerpoint';
    sections: {
      [key: string]: {
        enabled: boolean;
        order: number;
        customizable: boolean;
      };
    };
    styling: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      fonts: {
        heading: string;
        body: string;
      };
      layout: 'modern' | 'classic' | 'minimal';
    };
  };
  
  // Template content
  content: {
    coverPage: {
      title: string;
      subtitle: string;
      logo: boolean;
    };
    sections: {
      [key: string]: {
        title: string;
        description: string;
        charts: string[];
        tables: string[];
        insights: boolean;
      };
    };
  };
  
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportTemplateSchema = new Schema<IReportTemplate>({
  templateId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['business', 'technical', 'executive', 'custom'],
    default: 'business'
  },
  
  config: {
    format: {
      type: String,
      enum: ['pdf', 'excel', 'powerpoint'],
      default: 'pdf'
    },
    sections: { type: Schema.Types.Mixed, default: {} },
    styling: {
      colors: {
        primary: { type: String, default: '#3B82F6' },
        secondary: { type: String, default: '#64748B' },
        accent: { type: String, default: '#10B981' }
      },
      fonts: {
        heading: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' }
      },
      layout: {
        type: String,
        enum: ['modern', 'classic', 'minimal'],
        default: 'modern'
      }
    }
  },
  
  content: {
    coverPage: {
      title: { type: String, default: 'Competitor Analysis Report' },
      subtitle: { type: String, default: 'Comprehensive SEO Intelligence' },
      logo: { type: Boolean, default: true }
    },
    sections: { type: Schema.Types.Mixed, default: {} }
  },
  
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

const competitorReportSchema = new Schema<ICompetitorReport>({
  userId: { type: String, required: true, index: true },
  reportId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  
  config: {
    analysisId: { type: String, required: true, index: true },
    reportType: {
      type: String,
      enum: ['summary', 'detailed', 'executive', 'technical'],
      default: 'summary'
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json'],
      default: 'pdf'
    },
    sections: {
      overview: { type: Boolean, default: true },
      keywordAnalysis: { type: Boolean, default: true },
      backlinkAnalysis: { type: Boolean, default: true },
      contentAnalysis: { type: Boolean, default: false },
      technicalAnalysis: { type: Boolean, default: false },
      competitorComparison: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      charts: { type: Boolean, default: true }
    },
    customization: {
      logo: { type: String },
      brandColors: {
        primary: { type: String, default: '#3B82F6' },
        secondary: { type: String, default: '#64748B' }
      },
      includeRawData: { type: Boolean, default: false },
      includeMethodology: { type: Boolean, default: true }
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  files: {
    pdf: {
      url: { type: String },
      size: { type: Number },
      pages: { type: Number },
      generatedAt: { type: Date }
    },
    excel: {
      url: { type: String },
      size: { type: Number },
      sheets: [{ type: String }],
      generatedAt: { type: Date }
    },
    csv: {
      url: { type: String },
      size: { type: Number },
      rows: { type: Number },
      generatedAt: { type: Date }
    },
    json: {
      url: { type: String },
      size: { type: Number },
      generatedAt: { type: Date }
    }
  },
  
  metadata: {
    totalCompetitors: { type: Number, default: 0 },
    totalKeywords: { type: Number, default: 0 },
    totalBacklinks: { type: Number, default: 0 },
    dataPoints: { type: Number, default: 0 },
    generationTime: { type: Number, default: 0 },
    templateVersion: { type: String, default: '1.0' }
  },
  
  sharing: {
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String },
    expiresAt: { type: Date },
    downloadCount: { type: Number, default: 0 },
    lastDownloaded: { type: Date }
  },
  
  error: { type: String },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes
competitorReportSchema.index({ userId: 1, createdAt: -1 });
competitorReportSchema.index({ status: 1, createdAt: -1 });
competitorReportSchema.index({ 'config.analysisId': 1 });
competitorReportSchema.index({ 'sharing.shareToken': 1 });

reportTemplateSchema.index({ category: 1, isActive: 1 });
reportTemplateSchema.index({ isDefault: 1 });
reportTemplateSchema.index({ createdBy: 1 });

export const CompetitorReport = mongoose.model<ICompetitorReport>('CompetitorReport', competitorReportSchema);
export const ReportTemplate = mongoose.model<IReportTemplate>('ReportTemplate', reportTemplateSchema);

export default CompetitorReport;
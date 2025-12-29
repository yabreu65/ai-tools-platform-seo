import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetitorAlert extends Document {
  userId: string;
  alertId: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Configuration
  config: {
    competitors: string[];
    triggers: {
      keywordChanges: boolean;
      rankingChanges: boolean;
      backlinkChanges: boolean;
      contentChanges: boolean;
      technicalChanges: boolean;
    };
    thresholds: {
      keywordPositionChange: number; // positions
      trafficChange: number; // percentage
      backlinkChange: number; // count
      domainRatingChange: number; // points
    };
    frequency: 'daily' | 'weekly' | 'monthly';
    notificationMethods: ('email' | 'webhook' | 'dashboard')[];
  };
  
  // Notification settings
  notifications: {
    email?: {
      recipients: string[];
      template: string;
    };
    webhook?: {
      url: string;
      headers?: { [key: string]: string };
    };
    dashboard: {
      priority: 'high' | 'medium' | 'low';
      showInSummary: boolean;
    };
  };
  
  // Execution tracking
  execution: {
    lastRun?: Date;
    nextRun?: Date;
    runCount: number;
    successCount: number;
    failureCount: number;
    lastError?: string;
  };
  
  // Alert history
  history: IAlertTrigger[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertTrigger {
  triggeredAt: Date;
  triggerType: 'keyword' | 'ranking' | 'backlink' | 'content' | 'technical';
  competitor: string;
  change: {
    metric: string;
    oldValue: any;
    newValue: any;
    changePercent?: number;
  };
  severity: 'high' | 'medium' | 'low';
  message: string;
  notificationSent: boolean;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

const alertTriggerSchema = new Schema<IAlertTrigger>({
  triggeredAt: { type: Date, default: Date.now },
  triggerType: {
    type: String,
    enum: ['keyword', 'ranking', 'backlink', 'content', 'technical'],
    required: true
  },
  competitor: { type: String, required: true },
  change: {
    metric: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed, required: true },
    newValue: { type: Schema.Types.Mixed, required: true },
    changePercent: { type: Number }
  },
  severity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  message: { type: String, required: true },
  notificationSent: { type: Boolean, default: false },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date },
  acknowledgedBy: { type: String }
});

const competitorAlertSchema = new Schema<ICompetitorAlert>({
  userId: { type: String, required: true, index: true },
  alertId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true, index: true },
  
  config: {
    competitors: [{ type: String, required: true }],
    triggers: {
      keywordChanges: { type: Boolean, default: true },
      rankingChanges: { type: Boolean, default: true },
      backlinkChanges: { type: Boolean, default: false },
      contentChanges: { type: Boolean, default: false },
      technicalChanges: { type: Boolean, default: false }
    },
    thresholds: {
      keywordPositionChange: { type: Number, default: 5 },
      trafficChange: { type: Number, default: 20 },
      backlinkChange: { type: Number, default: 10 },
      domainRatingChange: { type: Number, default: 2 }
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    notificationMethods: [{
      type: String,
      enum: ['email', 'webhook', 'dashboard'],
      default: 'dashboard'
    }]
  },
  
  notifications: {
    email: {
      recipients: [{ type: String }],
      template: { type: String, default: 'default' }
    },
    webhook: {
      url: { type: String },
      headers: { type: Schema.Types.Mixed, default: {} }
    },
    dashboard: {
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      showInSummary: { type: Boolean, default: true }
    }
  },
  
  execution: {
    lastRun: { type: Date },
    nextRun: { type: Date },
    runCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    lastError: { type: String }
  },
  
  history: [alertTriggerSchema]
}, {
  timestamps: true
});

// Indexes
competitorAlertSchema.index({ userId: 1, isActive: 1 });
competitorAlertSchema.index({ 'execution.nextRun': 1, isActive: 1 });
competitorAlertSchema.index({ 'config.competitors': 1 });
competitorAlertSchema.index({ createdAt: -1 });

export default mongoose.model<ICompetitorAlert>('CompetitorAlert', competitorAlertSchema);
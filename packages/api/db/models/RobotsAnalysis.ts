import mongoose, { Document, Model } from 'mongoose';

// Interfaz para el documento
interface IRobotsAnalysis extends Document {
  userId?: string;
  url: string;
  status: 'ok' | 'missing' | 'invalid' | 'error';
  message: string;
  robotsContent?: string;
  downloadUrl?: string;
  analysis?: {
    hasUserAgent: boolean;
    hasDisallow: boolean;
    hasSitemap: boolean;
    hasAllowDirective: boolean;
    hasCrawlDelay: boolean;
    userAgents: string[];
    sitemaps: string[];
    disallowedPaths: string[];
    allowedPaths: string[];
    issues: string[];
    recommendations: string[];
  };
  generationConfig?: {
    template: string;
    siteType: string;
    customRules: any[];
    includeSitemap: boolean;
    crawlDelay?: number;
  };
  metadata: {
    fileSize: number;
    processingTime: number;
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para los métodos estáticos
interface IRobotsAnalysisModel extends Model<IRobotsAnalysis> {
  getByUserId(userId: string, limit?: number): Promise<IRobotsAnalysis[]>;
  getMonthlyCount(userId: string): Promise<number>;
  getStats(userId?: string): Promise<any[]>;
}

const robotsAnalysisSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: false, // Permitir análisis anónimos
    index: true 
  },
  url: { 
    type: String, 
    required: true,
    trim: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['ok', 'missing', 'invalid', 'error'],
    default: 'ok'
  },
  message: { 
    type: String, 
    required: true 
  },
  robotsContent: { 
    type: String, 
    required: false // Contenido del robots.txt
  },
  downloadUrl: { 
    type: String, 
    required: false // URL de descarga del robots.txt generado
  },
  analysis: {
    hasUserAgent: { type: Boolean, default: false },
    hasDisallow: { type: Boolean, default: false },
    hasSitemap: { type: Boolean, default: false },
    hasAllowDirective: { type: Boolean, default: false },
    hasCrawlDelay: { type: Boolean, default: false },
    userAgents: [{ type: String }],
    sitemaps: [{ type: String }],
    disallowedPaths: [{ type: String }],
    allowedPaths: [{ type: String }],
    issues: [{ type: String }],
    recommendations: [{ type: String }]
  },
  generationConfig: {
    template: { type: String },
    siteType: { type: String },
    customRules: [{ type: mongoose.Schema.Types.Mixed }],
    includeSitemap: { type: Boolean, default: true },
    crawlDelay: { type: Number }
  },
  metadata: {
    fileSize: { type: Number, default: 0 },
    processingTime: { type: Number, default: 0 }, // en milisegundos
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'robots_analyses'
});

// Índices para optimizar consultas
robotsAnalysisSchema.index({ userId: 1, createdAt: -1 });
robotsAnalysisSchema.index({ url: 1, createdAt: -1 });
robotsAnalysisSchema.index({ status: 1 });

// Middleware para actualizar updatedAt
robotsAnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método estático para obtener análisis por usuario
robotsAnalysisSchema.statics.getByUserId = function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Método estático para contar análisis del mes actual por usuario
robotsAnalysisSchema.statics.getMonthlyCount = function(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return this.countDocuments({
    userId,
    createdAt: { $gte: startOfMonth }
  });
};

// Método estático para obtener estadísticas
robotsAnalysisSchema.statics.getStats = function(userId?: string) {
  const match = userId ? { userId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ['$status', 'ok'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $ne: ['$status', 'ok'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$metadata.processingTime' }
      }
    }
  ]);
};

export default (mongoose.models.RobotsAnalysis as IRobotsAnalysisModel) || mongoose.model<IRobotsAnalysis, IRobotsAnalysisModel>('RobotsAnalysis', robotsAnalysisSchema);
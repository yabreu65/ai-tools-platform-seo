import mongoose, { Document, Model } from 'mongoose'

// Interfaz para el documento
interface ISitemapAnalysis extends Document {
  userId?: string;
  url: string;
  status: 'ok' | 'missing' | 'invalid' | 'error';
  message: string;
  sitemap?: string;
  downloadUrl?: string;
  metadata: {
    linksFound: number;
    sitemapSize: number;
    processingTime: number;
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para los métodos estáticos
interface ISitemapAnalysisModel extends Model<ISitemapAnalysis> {
  getByUserId(userId: string, limit?: number): Promise<ISitemapAnalysis[]>;
  getMonthlyCount(userId: string): Promise<number>;
  getStats(userId?: string): Promise<any[]>;
}

const sitemapAnalysisSchema = new mongoose.Schema({
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
  sitemap: { 
    type: String, 
    required: false // Solo si se genera un sitemap
  },
  downloadUrl: { 
    type: String, 
    required: false // URL de descarga del sitemap generado
  },
  metadata: {
    linksFound: { type: Number, default: 0 },
    sitemapSize: { type: Number, default: 0 },
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
  collection: 'sitemap_analyses'
})

// Índices para optimizar consultas
sitemapAnalysisSchema.index({ userId: 1, createdAt: -1 })
sitemapAnalysisSchema.index({ url: 1, createdAt: -1 })
sitemapAnalysisSchema.index({ status: 1 })

// Middleware para actualizar updatedAt
sitemapAnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Método estático para obtener análisis por usuario
sitemapAnalysisSchema.statics.getByUserId = function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

// Método estático para contar análisis del mes actual por usuario
sitemapAnalysisSchema.statics.getMonthlyCount = function(userId: string) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  return this.countDocuments({
    userId,
    createdAt: { $gte: startOfMonth }
  })
}

// Método estático para obtener estadísticas
sitemapAnalysisSchema.statics.getStats = function(userId?: string) {
  const match = userId ? { userId } : {}
  
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
  ])
}

export default (mongoose.models.SitemapAnalysis as ISitemapAnalysisModel) || mongoose.model<ISitemapAnalysis, ISitemapAnalysisModel>('SitemapAnalysis', sitemapAnalysisSchema)
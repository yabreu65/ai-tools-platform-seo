"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sitemapAnalysisSchema = new mongoose_1.default.Schema({
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
});
// Índices para optimizar consultas
sitemapAnalysisSchema.index({ userId: 1, createdAt: -1 });
sitemapAnalysisSchema.index({ url: 1, createdAt: -1 });
sitemapAnalysisSchema.index({ status: 1 });
// Middleware para actualizar updatedAt
sitemapAnalysisSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
// Método estático para obtener análisis por usuario
sitemapAnalysisSchema.statics.getByUserId = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
// Método estático para contar análisis del mes actual por usuario
sitemapAnalysisSchema.statics.getMonthlyCount = function (userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.countDocuments({
        userId,
        createdAt: { $gte: startOfMonth }
    });
};
// Método estático para obtener estadísticas
sitemapAnalysisSchema.statics.getStats = function (userId) {
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
exports.default = mongoose_1.default.models.SitemapAnalysis || mongoose_1.default.model('SitemapAnalysis', sitemapAnalysisSchema);

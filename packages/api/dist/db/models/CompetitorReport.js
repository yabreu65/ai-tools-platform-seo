"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportTemplate = exports.CompetitorReport = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reportTemplateSchema = new mongoose_1.Schema({
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
        sections: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
        sections: { type: mongoose_1.Schema.Types.Mixed, default: {} }
    },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});
const competitorReportSchema = new mongoose_1.Schema({
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
exports.CompetitorReport = mongoose_1.default.model('CompetitorReport', competitorReportSchema);
exports.ReportTemplate = mongoose_1.default.model('ReportTemplate', reportTemplateSchema);
exports.default = exports.CompetitorReport;

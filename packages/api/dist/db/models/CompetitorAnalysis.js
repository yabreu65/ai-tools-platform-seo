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
const mongoose_1 = __importStar(require("mongoose"));
// Schemas
const keywordDataSchema = new mongoose_1.Schema({
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
const pageDataSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    traffic: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 },
    contentType: { type: String, default: 'page' },
    wordCount: { type: Number, default: 0 },
    lastModified: { type: Date }
});
const backlinkDataSchema = new mongoose_1.Schema({
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
const competitorDataSchema = new mongoose_1.Schema({
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
const competitorAnalysisSchema = new mongoose_1.Schema({
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
                    competitorPositions: { type: mongoose_1.Schema.Types.Mixed, default: {} },
                    opportunity: {
                        type: String,
                        enum: ['high', 'medium', 'low'],
                        default: 'medium'
                    },
                    reason: { type: String, required: true }
                }],
            contentGaps: [{
                    topic: { type: String, required: true },
                    competitorCoverage: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
                    competitorComparison: { type: mongoose_1.Schema.Types.Mixed, default: {} }
                }],
            aiInsights: [{ type: String }]
        },
        comparisons: {
            keywordOverlap: [{
                    keyword: { type: String, required: true },
                    volume: { type: Number, default: 0 },
                    positions: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
                    values: { type: mongoose_1.Schema.Types.Mixed, default: {} },
                    leader: { type: String },
                    insights: [{ type: String }]
                }],
            technicalComparison: [{
                    metric: { type: String, required: true },
                    values: { type: mongoose_1.Schema.Types.Mixed, default: {} },
                    benchmark: { type: mongoose_1.Schema.Types.Mixed },
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
exports.default = mongoose_1.default.model('CompetitorAnalysis', competitorAnalysisSchema);

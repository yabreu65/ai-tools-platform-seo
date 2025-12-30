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
exports.OpportunityModel = exports.CompetitorDataModel = exports.ExtractedKeywordModel = exports.KeywordAnalysisModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Keyword Analysis Schema
const keywordAnalysisConfigSchema = new mongoose_1.Schema({
    depth: { type: Number, default: 1, min: 1, max: 5 },
    language: { type: String, default: 'auto' },
    includeMetaTags: { type: Boolean, default: true },
    includeHeadings: { type: Boolean, default: true },
    includeContent: { type: Boolean, default: true },
    userAgent: { type: String },
    excludeElements: [{ type: String }]
});
const analysisMetricsSchema = new mongoose_1.Schema({
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
const keywordAnalysisSchema = new mongoose_1.Schema({
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
const extractedKeywordSchema = new mongoose_1.Schema({
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
const competitorDataSchema = new mongoose_1.Schema({
    analysisId: { type: String, required: true, index: true },
    url: { type: String, required: true, index: true },
    title: { type: String },
    metaDescription: { type: String },
    extractedContent: {
        headings: { type: mongoose_1.Schema.Types.Mixed, default: {} },
        metaTags: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
const opportunitySchema = new mongoose_1.Schema({
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
exports.KeywordAnalysisModel = mongoose_1.default.model('KeywordAnalysis', keywordAnalysisSchema);
exports.ExtractedKeywordModel = mongoose_1.default.model('ExtractedKeyword', extractedKeywordSchema);
exports.CompetitorDataModel = mongoose_1.default.model('CompetitorData', competitorDataSchema);
exports.OpportunityModel = mongoose_1.default.model('Opportunity', opportunitySchema);

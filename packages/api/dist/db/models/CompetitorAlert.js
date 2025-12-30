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
const alertTriggerSchema = new mongoose_1.Schema({
    triggeredAt: { type: Date, default: Date.now },
    triggerType: {
        type: String,
        enum: ['keyword', 'ranking', 'backlink', 'content', 'technical'],
        required: true
    },
    competitor: { type: String, required: true },
    change: {
        metric: { type: String, required: true },
        oldValue: { type: mongoose_1.Schema.Types.Mixed, required: true },
        newValue: { type: mongoose_1.Schema.Types.Mixed, required: true },
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
const competitorAlertSchema = new mongoose_1.Schema({
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
            headers: { type: mongoose_1.Schema.Types.Mixed, default: {} }
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
exports.default = mongoose_1.default.model('CompetitorAlert', competitorAlertSchema);

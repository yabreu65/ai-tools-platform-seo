"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordScraperRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analysis_service_1 = require("./analysis-service");
const export_service_1 = require("./export-service");
const router = express_1.default.Router();
exports.keywordScraperRoutes = router;
const analysisService = new analysis_service_1.AnalysisService();
const exportService = new export_service_1.ExportService();
// User plan limits based on subscription
const getPlanLimits = (userPlan) => {
    const limits = {
        free: {
            maxUrls: 5,
            maxAnalysesPerMonth: 10,
            maxKeywordsPerResult: 50,
            canExportPdf: false
        },
        pro: {
            maxUrls: 50,
            maxAnalysesPerMonth: 100,
            maxKeywordsPerResult: 500,
            canExportPdf: true
        },
        enterprise: {
            maxUrls: 1000,
            maxAnalysesPerMonth: -1, // unlimited
            maxKeywordsPerResult: -1, // unlimited
            canExportPdf: true
        }
    };
    return limits[userPlan] || limits.free;
};
// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userPlan = req.headers['x-user-plan'] || 'free';
    if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    req.userId = userId;
    req.userPlan = userPlan;
    req.planLimits = getPlanLimits(userPlan);
    next();
};
// Start keyword analysis
router.post('/analyze', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, planLimits } = req;
        const analysisRequest = req.body;
        // Validate request
        if (!analysisRequest.urls || !Array.isArray(analysisRequest.urls) || analysisRequest.urls.length === 0) {
            res.status(400).json({ error: 'URLs array is required' });
            return;
        }
        // Check monthly usage limits (if applicable)
        if (planLimits.maxAnalysesPerMonth > 0) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            // This would typically check against a usage tracking system
            // For now, we'll skip this check
        }
        // Start analysis
        const analysisId = yield analysisService.startAnalysis(userId, analysisRequest, planLimits);
        // Estimate processing time (rough calculation)
        const estimatedTime = analysisRequest.urls.length * (analysisRequest.depth || 1) * 10; // 10 seconds per URL per depth
        res.json({
            analysisId,
            status: 'started',
            estimatedTime
        });
    }
    catch (error) {
        console.error('Error starting analysis:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to start analysis'
        });
    }
}));
// Get analysis status and results
router.get('/results/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, planLimits } = req;
        const { analysisId } = req.params;
        const results = yield analysisService.getAnalysisResults(analysisId, userId);
        // Apply plan limits to results
        if (planLimits.maxKeywordsPerResult > 0) {
            results.keywords = results.keywords.slice(0, planLimits.maxKeywordsPerResult);
        }
        res.json(results);
    }
    catch (error) {
        console.error('Error getting results:', error);
        if (error instanceof Error && error.message === 'Analysis not found') {
            res.status(404).json({ error: 'Analysis not found' });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to get results'
            });
        }
    }
}));
// Export analysis results
router.get('/export/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, planLimits } = req;
        const { analysisId } = req.params;
        const format = req.query.format || 'csv';
        const includeMetrics = req.query.includeMetrics === 'true';
        const includeOpportunities = req.query.includeOpportunities === 'true';
        // Check if user can export in requested format
        if (format === 'pdf' && !planLimits.canExportPdf) {
            res.status(403).json({ error: 'PDF export requires Pro or Enterprise plan' });
            return;
        }
        const results = yield analysisService.getAnalysisResults(analysisId, userId);
        // Apply plan limits
        let keywords = results.keywords;
        if (planLimits.maxKeywordsPerResult > 0) {
            keywords = keywords.slice(0, planLimits.maxKeywordsPerResult);
        }
        const exportOptions = {
            format,
            includeMetrics,
            includeOpportunities
        };
        let buffer;
        let contentType;
        let filename;
        if (format === 'pdf') {
            buffer = yield exportService.exportToPDF(keywords, results.competitors, results.opportunities, results.metrics, exportOptions);
            contentType = 'application/pdf';
            filename = exportService.generateFileName(analysisId, 'pdf');
        }
        else {
            buffer = yield exportService.exportToCSV(keywords, results.competitors, results.opportunities, results.metrics, exportOptions);
            contentType = 'text/csv';
            filename = exportService.generateFileName(analysisId, 'csv');
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    catch (error) {
        console.error('Error exporting results:', error);
        if (error instanceof Error && error.message === 'Analysis not found') {
            res.status(404).json({ error: 'Analysis not found' });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to export results'
            });
        }
    }
}));
// Get user's analysis history
router.get('/history', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = yield analysisService.getUserAnalysisHistory(userId, page, limit);
        res.json(history);
    }
    catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to get history'
        });
    }
}));
// Delete analysis
router.delete('/analysis/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { analysisId } = req.params;
        yield analysisService.deleteAnalysis(analysisId, userId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting analysis:', error);
        if (error instanceof Error && error.message === 'Analysis not found') {
            res.status(404).json({ error: 'Analysis not found' });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to delete analysis'
            });
        }
    }
}));
// Get analysis status (for polling)
router.get('/status/:analysisId', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { analysisId } = req.params;
        const results = yield analysisService.getAnalysisResults(analysisId, userId);
        res.json({
            status: results.analysis.status,
            progress: results.analysis.status === 'completed' ? 100 :
                results.analysis.status === 'processing' ? 50 : 0,
            metrics: results.analysis.status === 'completed' ? results.metrics : null,
            error: results.analysis.error
        });
    }
    catch (error) {
        console.error('Error getting status:', error);
        if (error instanceof Error && error.message === 'Analysis not found') {
            res.status(404).json({ error: 'Analysis not found' });
        }
        else {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to get status'
            });
        }
    }
}));
// Compare multiple analyses
router.post('/compare', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { analysisIds } = req.body;
        if (!analysisIds || !Array.isArray(analysisIds) || analysisIds.length < 2) {
            res.status(400).json({ error: 'At least 2 analysis IDs required for comparison' });
            return;
        }
        const comparisons = [];
        for (const analysisId of analysisIds) {
            try {
                const results = yield analysisService.getAnalysisResults(analysisId, userId);
                comparisons.push({
                    analysisId,
                    urls: results.analysis.urls,
                    metrics: results.metrics,
                    topKeywords: results.keywords
                        .sort((a, b) => b.relevanceScore - a.relevanceScore)
                        .slice(0, 20)
                });
            }
            catch (error) {
                // Skip invalid analysis IDs
                continue;
            }
        }
        if (comparisons.length < 2) {
            res.status(400).json({ error: 'Not enough valid analyses for comparison' });
            return;
        }
        // Find common and unique keywords
        const allKeywords = new Map();
        comparisons.forEach((comp, index) => {
            comp.topKeywords.forEach((kw) => {
                if (!allKeywords.has(kw.keyword)) {
                    allKeywords.set(kw.keyword, []);
                }
                allKeywords.get(kw.keyword).push(Object.assign(Object.assign({}, kw), { analysisIndex: index }));
            });
        });
        const commonKeywords = Array.from(allKeywords.entries())
            .filter(([, instances]) => instances.length > 1)
            .map(([keyword, instances]) => ({ keyword, instances }));
        const uniqueKeywords = Array.from(allKeywords.entries())
            .filter(([, instances]) => instances.length === 1)
            .map(([keyword, instances]) => ({ keyword, instance: instances[0] }));
        res.json({
            comparisons,
            commonKeywords,
            uniqueKeywords,
            summary: {
                totalAnalyses: comparisons.length,
                commonKeywordsCount: commonKeywords.length,
                uniqueKeywordsCount: uniqueKeywords.length
            }
        });
    }
    catch (error) {
        console.error('Error comparing analyses:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to compare analyses'
        });
    }
}));
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'keyword-scraper',
        timestamp: new Date().toISOString()
    });
});

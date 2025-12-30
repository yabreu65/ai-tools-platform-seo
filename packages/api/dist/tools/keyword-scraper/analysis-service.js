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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const uuid_1 = require("uuid");
const scraping_service_1 = require("./scraping-service");
const ai_analysis_service_1 = require("./ai-analysis-service");
const models_1 = require("./models");
class AnalysisService {
    constructor() {
        this.scrapingService = new scraping_service_1.ScrapingService();
        this.aiService = new ai_analysis_service_1.AIAnalysisService();
    }
    startAnalysis(userId, request, userLimits) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate request against user limits
            this.validateRequest(request, userLimits);
            // Create analysis record
            const analysisId = (0, uuid_1.v4)();
            const analysis = new models_1.KeywordAnalysisModel({
                id: analysisId,
                userId,
                urls: request.urls,
                config: {
                    depth: request.depth || 1,
                    language: request.language || 'auto',
                    includeMetaTags: request.includeMetaTags !== false,
                    includeHeadings: request.includeHeadings !== false,
                    includeContent: request.includeContent !== false
                },
                status: 'pending',
                metrics: {
                    totalKeywords: 0,
                    processingTime: 0,
                    urlsProcessed: 0,
                    urlsFailed: 0,
                    keywordsByCategory: {
                        primary: 0,
                        secondary: 0,
                        longTail: 0,
                        brand: 0
                    },
                    averageDensity: 0,
                    topKeywords: []
                }
            });
            yield analysis.save();
            // Start processing asynchronously
            this.processAnalysis(analysisId).catch(error => {
                console.error(`Error processing analysis ${analysisId}:`, error);
                this.markAnalysisAsFailed(analysisId, error.message);
            });
            return analysisId;
        });
    }
    processAnalysis(analysisId) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            try {
                // Update status to processing
                yield models_1.KeywordAnalysisModel.findOneAndUpdate({ id: analysisId }, {
                    status: 'processing',
                    updatedAt: new Date()
                });
                const analysis = yield models_1.KeywordAnalysisModel.findOne({ id: analysisId });
                if (!analysis) {
                    throw new Error('Analysis not found');
                }
                // Step 1: Scrape all URLs
                const scrapingResults = yield this.scrapeUrls(analysis);
                // Step 2: Process each successful scraping result
                const allKeywords = [];
                const competitors = [];
                for (const result of scrapingResults) {
                    if (result.success) {
                        // Save competitor data
                        const competitor = yield this.saveCompetitorData(analysisId, result);
                        competitors.push(competitor);
                        // Extract and analyze keywords
                        const keywords = yield this.extractKeywordsFromResult(analysisId, result, analysis.config.language);
                        allKeywords.push(...keywords);
                    }
                }
                // Step 3: AI-powered competitive analysis
                const aiAnalysis = yield this.aiService.analyzeCompetitiveOpportunities(scrapingResults, analysis.config.language);
                // Step 4: Save opportunities
                const opportunities = yield this.saveOpportunities(analysisId, aiAnalysis.opportunities);
                // Step 5: Calculate final metrics
                const metrics = this.calculateMetrics(allKeywords, scrapingResults, Date.now() - startTime);
                // Step 6: Update analysis as completed
                yield models_1.KeywordAnalysisModel.findOneAndUpdate({ id: analysisId }, {
                    status: 'completed',
                    metrics,
                    completedAt: new Date(),
                    updatedAt: new Date()
                });
            }
            catch (error) {
                yield this.markAnalysisAsFailed(analysisId, error instanceof Error ? error.message : 'Unknown error');
                throw error;
            }
        });
    }
    scrapeUrls(analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const allResults = [];
            for (const url of analysis.urls) {
                if (analysis.config.depth > 1) {
                    // Deep scraping with multiple pages
                    const results = yield this.scrapingService.scrapeWithDepth(url, analysis.config);
                    allResults.push(...results);
                }
                else {
                    // Single page scraping
                    const result = yield this.scrapingService.scrapeUrl(url, analysis.config);
                    allResults.push(result);
                }
            }
            return allResults;
        });
    }
    saveCompetitorData(analysisId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const competitor = new models_1.CompetitorDataModel({
                id: (0, uuid_1.v4)(),
                analysisId,
                url: result.url,
                title: result.title || '',
                metaDescription: result.metaDescription || '',
                extractedContent: result.content || {
                    headings: {},
                    metaTags: {},
                    paragraphs: [],
                    links: []
                },
                totalKeywords: 0, // Will be updated later
                processingTime: result.processingTime
            });
            yield competitor.save();
            return competitor.toObject();
        });
    }
    extractKeywordsFromResult(analysisId, result, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!result.content)
                return [];
            // Combine all text content
            const allText = [
                result.title || '',
                result.metaDescription || '',
                ...Object.values(result.content.headings).flat(),
                ...result.content.paragraphs,
                ...result.content.links.map(link => link.text)
            ].join(' ');
            // Extract keywords using AI
            const keywordResult = yield this.aiService.extractKeywords(allText, language);
            // Save keywords to database
            const savedKeywords = [];
            for (const kw of keywordResult.keywords) {
                const keyword = new models_1.ExtractedKeywordModel({
                    id: (0, uuid_1.v4)(),
                    analysisId,
                    keyword: kw.keyword,
                    frequency: kw.frequency,
                    density: kw.density,
                    category: kw.category,
                    positions: kw.positions || ['content'],
                    relevanceScore: kw.relevanceScore,
                    sourceUrl: result.url
                });
                yield keyword.save();
                savedKeywords.push(keyword.toObject());
            }
            // Update competitor total keywords
            yield models_1.CompetitorDataModel.findOneAndUpdate({ analysisId, url: result.url }, { totalKeywords: savedKeywords.length });
            return savedKeywords;
        });
    }
    saveOpportunities(analysisId, opportunities) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedOpportunities = [];
            for (const opp of opportunities) {
                const opportunity = new models_1.OpportunityModel({
                    id: (0, uuid_1.v4)(),
                    analysisId,
                    type: opp.type,
                    description: opp.description,
                    suggestedKeywords: opp.suggestedKeywords || [],
                    priority: opp.priority || 3,
                    confidenceScore: opp.confidenceScore || 0.5
                });
                yield opportunity.save();
                savedOpportunities.push(opportunity.toObject());
            }
            return savedOpportunities;
        });
    }
    calculateMetrics(keywords, scrapingResults, processingTime) {
        const successfulResults = scrapingResults.filter(r => r.success);
        const failedResults = scrapingResults.filter(r => !r.success);
        const keywordsByCategory = {
            primary: keywords.filter(k => k.category === 'primary').length,
            secondary: keywords.filter(k => k.category === 'secondary').length,
            longTail: keywords.filter(k => k.category === 'long-tail').length,
            brand: keywords.filter(k => k.category === 'brand').length
        };
        const averageDensity = keywords.length > 0
            ? keywords.reduce((sum, k) => sum + k.density, 0) / keywords.length
            : 0;
        const topKeywords = keywords
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10)
            .map(k => ({
            keyword: k.keyword,
            frequency: k.frequency,
            density: k.density
        }));
        return {
            totalKeywords: keywords.length,
            processingTime,
            urlsProcessed: successfulResults.length,
            urlsFailed: failedResults.length,
            keywordsByCategory,
            averageDensity,
            topKeywords
        };
    }
    markAnalysisAsFailed(analysisId, error) {
        return __awaiter(this, void 0, void 0, function* () {
            yield models_1.KeywordAnalysisModel.findOneAndUpdate({ id: analysisId }, {
                status: 'failed',
                error,
                completedAt: new Date(),
                updatedAt: new Date()
            });
        });
    }
    validateRequest(request, limits) {
        if (request.urls.length > limits.maxUrls) {
            throw new Error(`Maximum ${limits.maxUrls} URLs allowed for your plan`);
        }
        if (request.depth && request.depth > 5) {
            throw new Error('Maximum depth is 5 levels');
        }
        // Validate URLs
        for (const url of request.urls) {
            try {
                new URL(url);
            }
            catch (_a) {
                throw new Error(`Invalid URL: ${url}`);
            }
        }
    }
    getAnalysisResults(analysisId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield models_1.KeywordAnalysisModel.findOne({ id: analysisId, userId });
            if (!analysis) {
                throw new Error('Analysis not found');
            }
            const keywords = yield models_1.ExtractedKeywordModel.find({ analysisId }).sort({ relevanceScore: -1 });
            const competitors = yield models_1.CompetitorDataModel.find({ analysisId });
            const opportunities = yield models_1.OpportunityModel.find({ analysisId }).sort({ priority: -1 });
            return {
                analysis: analysis.toObject(),
                keywords: keywords.map(k => k.toObject()),
                competitors: competitors.map(c => c.toObject()),
                opportunities: opportunities.map(o => o.toObject()),
                metrics: analysis.metrics
            };
        });
    }
    getUserAnalysisHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const analyses = yield models_1.KeywordAnalysisModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = yield models_1.KeywordAnalysisModel.countDocuments({ userId });
            return {
                analyses: analyses.map(a => a.toObject()),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        });
    }
    deleteAnalysis(analysisId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield models_1.KeywordAnalysisModel.findOne({ id: analysisId, userId });
            if (!analysis) {
                throw new Error('Analysis not found');
            }
            // Delete all related data
            yield Promise.all([
                models_1.KeywordAnalysisModel.deleteOne({ id: analysisId }),
                models_1.ExtractedKeywordModel.deleteMany({ analysisId }),
                models_1.CompetitorDataModel.deleteMany({ analysisId }),
                models_1.OpportunityModel.deleteMany({ analysisId })
            ]);
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrapingService.close();
        });
    }
}
exports.AnalysisService = AnalysisService;

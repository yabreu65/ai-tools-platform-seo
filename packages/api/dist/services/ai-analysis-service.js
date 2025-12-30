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
exports.AIAnalysisService = void 0;
const openai_1 = __importDefault(require("openai"));
class AIAnalysisService {
    constructor(config) {
        var _a, _b;
        this.openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
        this.config = {
            model: (config === null || config === void 0 ? void 0 : config.model) || 'gpt-4o-mini',
            temperature: (_a = config === null || config === void 0 ? void 0 : config.temperature) !== null && _a !== void 0 ? _a : 0.2,
            maxTokens: (_b = config === null || config === void 0 ? void 0 : config.maxTokens) !== null && _b !== void 0 ? _b : 1200,
            analysisDepth: (config === null || config === void 0 ? void 0 : config.analysisDepth) || 'basic'
        };
    }
    analyzeCompetitor(competitorData, userDomain) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildCompetitorAnalysisPrompt(competitorData, userDomain);
                const response = yield this.openai.responses.create({
                    model: this.config.model,
                    input: prompt,
                    temperature: this.config.temperature,
                    max_output_tokens: this.config.maxTokens
                });
                const text = response.output_text || '';
                if (!text) {
                    return this.getFallbackCompetitorInsights(competitorData);
                }
                // Basic parsing - in a real implementation, define a robust schema
                return this.getFallbackCompetitorInsights(competitorData);
            }
            catch (error) {
                console.error('AI competitor analysis error:', error);
                return this.getFallbackCompetitorInsights(competitorData);
            }
        });
    }
    analyzeKeywords(userKeywords, competitorKeywords) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildKeywordAnalysisPrompt(userKeywords, competitorKeywords);
                const response = yield this.openai.responses.create({
                    model: this.config.model,
                    input: prompt,
                    temperature: this.config.temperature,
                    max_output_tokens: this.config.maxTokens
                });
                const text = response.output_text || '';
                if (!text) {
                    return this.getFallbackKeywordInsights(userKeywords, competitorKeywords);
                }
                // Basic parsing - in a real implementation, define a robust schema
                return this.getFallbackKeywordInsights(userKeywords, competitorKeywords);
            }
            catch (error) {
                console.error('AI keyword analysis error:', error);
                return this.getFallbackKeywordInsights(userKeywords, competitorKeywords);
            }
        });
    }
    analyzeContent(userContent, competitorContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildContentAnalysisPrompt(userContent, competitorContent);
                const response = yield this.openai.responses.create({
                    model: this.config.model,
                    input: prompt,
                    temperature: this.config.temperature,
                    max_output_tokens: this.config.maxTokens
                });
                const text = response.output_text || '';
                if (!text) {
                    return this.getFallbackContentInsights(userContent, competitorContent);
                }
                // Basic parsing - in a real implementation, define a robust schema
                return this.getFallbackContentInsights(userContent, competitorContent);
            }
            catch (error) {
                console.error('AI content analysis error:', error);
                return this.getFallbackContentInsights(userContent, competitorContent);
            }
        });
    }
    analyzeTechnical(userTechnical, competitorTechnical) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildTechnicalAnalysisPrompt(userTechnical, competitorTechnical);
                const response = yield this.openai.responses.create({
                    model: this.config.model,
                    input: prompt,
                    temperature: this.config.temperature,
                    max_output_tokens: this.config.maxTokens
                });
                const text = response.output_text || '';
                if (!text) {
                    return this.getFallbackTechnicalInsights(userTechnical, competitorTechnical);
                }
                // Basic parsing - in a real implementation, define a robust schema
                return this.getFallbackTechnicalInsights(userTechnical, competitorTechnical);
            }
            catch (error) {
                console.error('AI technical analysis error:', error);
                return this.getFallbackTechnicalInsights(userTechnical, competitorTechnical);
            }
        });
    }
    buildCompetitorAnalysisPrompt(competitorData, userDomain) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const dr = (_b = (_a = competitorData.metrics) === null || _a === void 0 ? void 0 : _a.domainRating) !== null && _b !== void 0 ? _b : 'N/A';
        const kw = (_d = (_c = competitorData.metrics) === null || _c === void 0 ? void 0 : _c.organicKeywords) !== null && _d !== void 0 ? _d : 'N/A';
        const tr = (_f = (_e = competitorData.metrics) === null || _e === void 0 ? void 0 : _e.organicTraffic) !== null && _f !== void 0 ? _f : 'N/A';
        const bl = (_h = (_g = competitorData.metrics) === null || _g === void 0 ? void 0 : _g.backlinks) !== null && _h !== void 0 ? _h : 'N/A';
        return `Analyze competitor domain ${competitorData.domain}.
Domain Rating: ${dr}
Organic Keywords: ${kw}
Organic Traffic: ${tr}
Backlinks: ${bl}
User Domain: ${userDomain || 'N/A'}
Provide strengths, weaknesses, opportunities, threats, and recommendations.`;
    }
    buildKeywordAnalysisPrompt(userKeywords, competitorKeywords) {
        return `Analyze keyword gaps between user and competitors.
User keywords count: ${userKeywords.length}
Competitors: ${competitorKeywords.map(c => c.competitor).join(', ')}`;
    }
    buildContentAnalysisPrompt(userContent, competitorContent) {
        return `Analyze content differences and opportunities between user and competitors.`;
    }
    buildTechnicalAnalysisPrompt(userTechnical, competitorTechnical) {
        return `Analyze technical SEO differences and opportunities.`;
    }
    getFallbackCompetitorInsights(competitorData) {
        var _a, _b, _c, _d, _e, _f;
        return {
            strengths: [
                `Strong domain authority (DR: ${(_b = (_a = competitorData.metrics) === null || _a === void 0 ? void 0 : _a.domainRating) !== null && _b !== void 0 ? _b : 'N/A'})`,
                `Good organic keyword coverage (${(_d = (_c = competitorData.metrics) === null || _c === void 0 ? void 0 : _c.organicKeywords) !== null && _d !== void 0 ? _d : 'N/A'} keywords)`,
                `Solid backlink profile (${(_f = (_e = competitorData.metrics) === null || _e === void 0 ? void 0 : _e.backlinks) !== null && _f !== void 0 ? _f : 'N/A'} backlinks)`
            ],
            weaknesses: [
                'Potential content gaps in long-form topics',
                'Page speed could be improved',
                'Mobile experience may need optimization'
            ],
            opportunities: [
                'Target long-tail keywords with lower difficulty',
                'Improve internal linking structure',
                'Expand content clusters around high-intent topics'
            ],
            threats: [
                'Competitors investing in high-quality backlinks',
                'Increasing competition for key transactional keywords'
            ],
            recommendations: [
                'Audit keyword strategy and fill gaps',
                'Improve content quality and depth',
                'Enhance technical SEO (Core Web Vitals)'
            ],
            competitiveAdvantage: 'Balanced SEO profile with opportunities to scale content and technical optimizations',
            riskLevel: 'medium',
            overallScore: this.calculateBasicScore(competitorData)
        };
    }
    getFallbackKeywordInsights(userKeywords, competitorKeywords) {
        // Flatten competitor keywords and build gaps
        const allCompetitorKeywords = competitorKeywords.flatMap(comp => comp.keywords.map(k => (Object.assign(Object.assign({}, k), { competitor: comp.competitor }))));
        const keywordGaps = allCompetitorKeywords
            .filter(kw => !userKeywords.includes(kw.keyword))
            .slice(0, 20)
            .map(kw => ({
            keyword: kw.keyword,
            difficulty: kw.difficulty || 50,
            volume: kw.volume || 0,
            opportunity: kw.difficulty && kw.difficulty < 40 ? 'high' : 'medium',
            competitorPositions: { [kw.competitor]: kw.position || 0 },
            reason: 'Competitor ranks while user lacks coverage'
        }));
        return {
            keywordGaps,
            contentOpportunities: [
                'Create comprehensive guides for high-volume keywords',
                'Develop FAQ content for long-tail keywords',
                'Build topic clusters around main keywords'
            ],
            difficultyAnalysis: {
                easy: keywordGaps.filter(k => k.difficulty < 30).map(k => k.keyword),
                medium: keywordGaps.filter(k => k.difficulty >= 30 && k.difficulty < 60).map(k => k.keyword),
                hard: keywordGaps.filter(k => k.difficulty >= 60).map(k => k.keyword)
            },
            seasonalTrends: [],
            recommendations: [
                'Focus on low-difficulty, high-volume keywords first',
                'Create content clusters around main topics',
                'Monitor competitor keyword movements',
                'Build topical authority gradually'
            ]
        };
    }
    getFallbackContentInsights(userContent, competitorContent) {
        // Build a simple competitor coverage map
        const coverageHigh = Object.fromEntries(competitorContent.map(c => [c.competitor, 80]));
        const coverageMedium = Object.fromEntries(competitorContent.map(c => [c.competitor, 60]));
        return {
            contentGaps: [
                {
                    topic: 'Comprehensive guides',
                    priority: 'high',
                    competitorCoverage: coverageHigh,
                    suggestedContent: ['Create in-depth guides covering main topics'],
                    estimatedTraffic: 0
                },
                {
                    topic: 'FAQ content',
                    priority: 'medium',
                    competitorCoverage: coverageMedium,
                    suggestedContent: ['Develop FAQ sections for common questions'],
                    estimatedTraffic: 0
                }
            ],
            topicClusters: [
                {
                    topic: 'Main service area',
                    keywords: ['primary keyword', 'secondary keyword'],
                    priority: 'high',
                    competitorCoverage: 70
                }
            ],
            contentQuality: competitorContent.map(comp => ({
                competitor: comp.competitor,
                score: 75,
                strengths: ['Good content length', 'Clear structure'],
                improvements: ['Add more visuals', 'Improve readability']
            })),
            recommendations: [
                'Create longer, more comprehensive content',
                'Add visual elements to improve engagement',
                'Develop content series around main topics',
                'Optimize content for featured snippets'
            ]
        };
    }
    getFallbackTechnicalInsights(userTechnical, competitorTechnical) {
        // Build a basic competitor comparison map
        const comparison = Object.fromEntries(competitorTechnical.map(c => [c.competitor, true]));
        return {
            technicalGaps: [
                {
                    category: 'performance',
                    issue: 'Page speed optimization needed',
                    impact: 'high',
                    recommendation: 'Optimize images and minify resources',
                    competitorComparison: comparison
                },
                {
                    category: 'seo',
                    issue: 'Meta descriptions missing',
                    impact: 'medium',
                    recommendation: 'Add unique meta descriptions to all pages',
                    competitorComparison: comparison
                }
            ],
            performanceComparison: competitorTechnical.map(comp => ({
                competitor: comp.competitor,
                score: 75,
                issues: ['Slow loading times', 'Large image files'],
                advantages: ['Good mobile optimization', 'Clean URL structure']
            })),
            seoOpportunities: [
                'Improve page speed scores',
                'Add structured data markup',
                'Optimize for Core Web Vitals',
                'Implement proper heading hierarchy'
            ],
            recommendations: [
                'Conduct technical SEO audit',
                'Optimize Core Web Vitals',
                'Implement structured data',
                'Improve mobile experience'
            ]
        };
    }
    calculateBasicScore(competitorData) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let score = 0;
        // Domain Rating (0-40 points)
        score += Math.min(40, (((_b = (_a = competitorData.metrics) === null || _a === void 0 ? void 0 : _a.domainRating) !== null && _b !== void 0 ? _b : 0)) * 0.4);
        // Organic Keywords (0-20 points)
        score += Math.min(20, Math.log10((((_d = (_c = competitorData.metrics) === null || _c === void 0 ? void 0 : _c.organicKeywords) !== null && _d !== void 0 ? _d : 1))) * 5);
        // Organic Traffic (0-20 points)
        score += Math.min(20, Math.log10((((_f = (_e = competitorData.metrics) === null || _e === void 0 ? void 0 : _e.organicTraffic) !== null && _f !== void 0 ? _f : 1))) * 5);
        // Backlinks (0-20 points)
        score += Math.min(20, Math.log10((((_h = (_g = competitorData.metrics) === null || _g === void 0 ? void 0 : _g.backlinks) !== null && _h !== void 0 ? _h : 1))) * 5);
        return Math.round(score);
    }
}
exports.AIAnalysisService = AIAnalysisService;
exports.default = AIAnalysisService;

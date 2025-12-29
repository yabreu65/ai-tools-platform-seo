import { v4 as uuidv4 } from 'uuid';
import { ScrapingService } from './scraping-service';
import { AIAnalysisService } from './ai-analysis-service';
import {
  KeywordAnalysisModel,
  ExtractedKeywordModel,
  CompetitorDataModel,
  OpportunityModel
} from './models';
import {
  AnalysisRequest,
  KeywordAnalysis,
  ExtractedKeyword,
  CompetitorData,
  Opportunity,
  AnalysisMetrics,
  UserPlanLimits,
  ScrapingResult
} from './types';

export class AnalysisService {
  private scrapingService: ScrapingService;
  private aiService: AIAnalysisService;

  constructor() {
    this.scrapingService = new ScrapingService();
    this.aiService = new AIAnalysisService();
  }

  async startAnalysis(
    userId: string,
    request: AnalysisRequest,
    userLimits: UserPlanLimits
  ): Promise<string> {
    // Validate request against user limits
    this.validateRequest(request, userLimits);

    // Create analysis record
    const analysisId = uuidv4();
    const analysis = new KeywordAnalysisModel({
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

    await analysis.save();

    // Start processing asynchronously
    this.processAnalysis(analysisId).catch(error => {
      console.error(`Error processing analysis ${analysisId}:`, error);
      this.markAnalysisAsFailed(analysisId, error.message);
    });

    return analysisId;
  }

  private async processAnalysis(analysisId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to processing
      await KeywordAnalysisModel.findOneAndUpdate(
        { id: analysisId },
        { 
          status: 'processing',
          updatedAt: new Date()
        }
      );

      const analysis = await KeywordAnalysisModel.findOne({ id: analysisId });
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Step 1: Scrape all URLs
      const scrapingResults = await this.scrapeUrls(analysis);

      // Step 2: Process each successful scraping result
      const allKeywords: ExtractedKeyword[] = [];
      const competitors: CompetitorData[] = [];

      for (const result of scrapingResults) {
        if (result.success) {
          // Save competitor data
          const competitor = await this.saveCompetitorData(analysisId, result);
          competitors.push(competitor);

          // Extract and analyze keywords
          const keywords = await this.extractKeywordsFromResult(analysisId, result, analysis.config.language);
          allKeywords.push(...keywords);
        }
      }

      // Step 3: AI-powered competitive analysis
      const aiAnalysis = await this.aiService.analyzeCompetitiveOpportunities(
        scrapingResults,
        analysis.config.language
      );

      // Step 4: Save opportunities
      const opportunities = await this.saveOpportunities(analysisId, aiAnalysis.opportunities);

      // Step 5: Calculate final metrics
      const metrics = this.calculateMetrics(allKeywords, scrapingResults, Date.now() - startTime);

      // Step 6: Update analysis as completed
      await KeywordAnalysisModel.findOneAndUpdate(
        { id: analysisId },
        {
          status: 'completed',
          metrics,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      );

    } catch (error) {
      await this.markAnalysisAsFailed(analysisId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async scrapeUrls(analysis: KeywordAnalysis): Promise<ScrapingResult[]> {
    const allResults: ScrapingResult[] = [];

    for (const url of analysis.urls) {
      if (analysis.config.depth > 1) {
        // Deep scraping with multiple pages
        const results = await this.scrapingService.scrapeWithDepth(url, analysis.config);
        allResults.push(...results);
      } else {
        // Single page scraping
        const result = await this.scrapingService.scrapeUrl(url, analysis.config);
        allResults.push(result);
      }
    }

    return allResults;
  }

  private async saveCompetitorData(analysisId: string, result: ScrapingResult): Promise<CompetitorData> {
    const competitor = new CompetitorDataModel({
      id: uuidv4(),
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

    await competitor.save();
    return competitor.toObject();
  }

  private async extractKeywordsFromResult(
    analysisId: string,
    result: ScrapingResult,
    language: string
  ): Promise<ExtractedKeyword[]> {
    if (!result.content) return [];

    // Combine all text content
    const allText = [
      result.title || '',
      result.metaDescription || '',
      ...Object.values(result.content.headings).flat(),
      ...result.content.paragraphs,
      ...result.content.links.map(link => link.text)
    ].join(' ');

    // Extract keywords using AI
    const keywordResult = await this.aiService.extractKeywords(allText, language);

    // Save keywords to database
    const savedKeywords: ExtractedKeyword[] = [];

    for (const kw of keywordResult.keywords) {
      const keyword = new ExtractedKeywordModel({
        id: uuidv4(),
        analysisId,
        keyword: kw.keyword,
        frequency: kw.frequency,
        density: kw.density,
        category: kw.category,
        positions: kw.positions || ['content'],
        relevanceScore: kw.relevanceScore,
        sourceUrl: result.url
      });

      await keyword.save();
      savedKeywords.push(keyword.toObject());
    }

    // Update competitor total keywords
    await CompetitorDataModel.findOneAndUpdate(
      { analysisId, url: result.url },
      { totalKeywords: savedKeywords.length }
    );

    return savedKeywords;
  }

  private async saveOpportunities(analysisId: string, opportunities: any[]): Promise<Opportunity[]> {
    const savedOpportunities: Opportunity[] = [];

    for (const opp of opportunities) {
      const opportunity = new OpportunityModel({
        id: uuidv4(),
        analysisId,
        type: opp.type,
        description: opp.description,
        suggestedKeywords: opp.suggestedKeywords || [],
        priority: opp.priority || 3,
        confidenceScore: opp.confidenceScore || 0.5
      });

      await opportunity.save();
      savedOpportunities.push(opportunity.toObject());
    }

    return savedOpportunities;
  }

  private calculateMetrics(
    keywords: ExtractedKeyword[],
    scrapingResults: ScrapingResult[],
    processingTime: number
  ): AnalysisMetrics {
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

  private async markAnalysisAsFailed(analysisId: string, error: string): Promise<void> {
    await KeywordAnalysisModel.findOneAndUpdate(
      { id: analysisId },
      {
        status: 'failed',
        error,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    );
  }

  private validateRequest(request: AnalysisRequest, limits: UserPlanLimits): void {
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
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    }
  }

  async getAnalysisResults(analysisId: string, userId: string) {
    const analysis = await KeywordAnalysisModel.findOne({ id: analysisId, userId });
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    const keywords = await ExtractedKeywordModel.find({ analysisId }).sort({ relevanceScore: -1 });
    const competitors = await CompetitorDataModel.find({ analysisId });
    const opportunities = await OpportunityModel.find({ analysisId }).sort({ priority: -1 });

    return {
      analysis: analysis.toObject(),
      keywords: keywords.map(k => k.toObject()),
      competitors: competitors.map(c => c.toObject()),
      opportunities: opportunities.map(o => o.toObject()),
      metrics: analysis.metrics
    };
  }

  async getUserAnalysisHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const analyses = await KeywordAnalysisModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KeywordAnalysisModel.countDocuments({ userId });

    return {
      analyses: analyses.map(a => a.toObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async deleteAnalysis(analysisId: string, userId: string): Promise<void> {
    const analysis = await KeywordAnalysisModel.findOne({ id: analysisId, userId });
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Delete all related data
    await Promise.all([
      KeywordAnalysisModel.deleteOne({ id: analysisId }),
      ExtractedKeywordModel.deleteMany({ analysisId }),
      CompetitorDataModel.deleteMany({ analysisId }),
      OpportunityModel.deleteMany({ analysisId })
    ]);
  }

  async cleanup(): Promise<void> {
    await this.scrapingService.close();
  }
}
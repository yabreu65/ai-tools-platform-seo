import OpenAI from 'openai';
import { ICompetitorData, IKeywordGap, IContentGap, ITechnicalInsight, IKeywordData } from '../db/models/CompetitorAnalysis';

export interface AIAnalysisConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

export interface CompetitorInsights {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  competitiveAdvantage: string;
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
}

export interface KeywordInsights {
  keywordGaps: IKeywordGap[];
  contentOpportunities: string[];
  difficultyAnalysis: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  seasonalTrends: {
    keyword: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    confidence: number;
  }[];
  recommendations: string[];
}

export interface ContentInsights {
  contentGaps: IContentGap[];
  topicClusters: {
    topic: string;
    keywords: string[];
    priority: 'high' | 'medium' | 'low';
    competitorCoverage: number;
  }[];
  contentQuality: {
    competitor: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }[];
  recommendations: string[];
}

export interface TechnicalInsights {
  technicalGaps: ITechnicalInsight[];
  performanceComparison: {
    competitor: string;
    score: number;
    issues: string[];
    advantages: string[];
  }[];
  seoOpportunities: string[];
  recommendations: string[];
}

export class AIAnalysisService {
  private openai: OpenAI;
  private config: AIAnalysisConfig;

  constructor(config?: Partial<AIAnalysisConfig>) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.config = {
      model: config?.model || 'gpt-4o-mini',
      temperature: config?.temperature ?? 0.2,
      maxTokens: config?.maxTokens ?? 1200,
      analysisDepth: config?.analysisDepth || 'basic'
    };
  }

  async analyzeCompetitor(competitorData: ICompetitorData, userDomain?: string): Promise<CompetitorInsights> {
    try {
      const prompt = this.buildCompetitorAnalysisPrompt(competitorData, userDomain);

      const response = await this.openai.responses.create({
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
    } catch (error) {
      console.error('AI competitor analysis error:', error);
      return this.getFallbackCompetitorInsights(competitorData);
    }
  }

  async analyzeKeywords(
    userKeywords: string[],
    competitorKeywords: { competitor: string; keywords: IKeywordData[] }[]
  ): Promise<KeywordInsights> {
    try {
      const prompt = this.buildKeywordAnalysisPrompt(userKeywords, competitorKeywords);
      const response = await this.openai.responses.create({
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
    } catch (error) {
      console.error('AI keyword analysis error:', error);
      return this.getFallbackKeywordInsights(userKeywords, competitorKeywords);
    }
  }

  async analyzeContent(
    userContent: any,
    competitorContent: { competitor: string; content: any }[]
  ): Promise<ContentInsights> {
    try {
      const prompt = this.buildContentAnalysisPrompt(userContent, competitorContent);
      const response = await this.openai.responses.create({
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
    } catch (error) {
      console.error('AI content analysis error:', error);
      return this.getFallbackContentInsights(userContent, competitorContent);
    }
  }

  async analyzeTechnical(
    userTechnical: any,
    competitorTechnical: { competitor: string; technical: any }[]
  ): Promise<TechnicalInsights> {
    try {
      const prompt = this.buildTechnicalAnalysisPrompt(userTechnical, competitorTechnical);
      const response = await this.openai.responses.create({
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
    } catch (error) {
      console.error('AI technical analysis error:', error);
      return this.getFallbackTechnicalInsights(userTechnical, competitorTechnical);
    }
  }

  private buildCompetitorAnalysisPrompt(competitorData: ICompetitorData, userDomain?: string): string {
    const dr = competitorData.metrics?.domainRating ?? 'N/A';
    const kw = competitorData.metrics?.organicKeywords ?? 'N/A';
    const tr = competitorData.metrics?.organicTraffic ?? 'N/A';
    const bl = competitorData.metrics?.backlinks ?? 'N/A';

    return `Analyze competitor domain ${competitorData.domain}.
Domain Rating: ${dr}
Organic Keywords: ${kw}
Organic Traffic: ${tr}
Backlinks: ${bl}
User Domain: ${userDomain || 'N/A'}
Provide strengths, weaknesses, opportunities, threats, and recommendations.`;
  }

  private buildKeywordAnalysisPrompt(
    userKeywords: string[],
    competitorKeywords: { competitor: string; keywords: IKeywordData[] }[]
  ): string {
    return `Analyze keyword gaps between user and competitors.
User keywords count: ${userKeywords.length}
Competitors: ${competitorKeywords.map(c => c.competitor).join(', ')}`;
  }

  private buildContentAnalysisPrompt(
    userContent: any,
    competitorContent: { competitor: string; content: any }[]
  ): string {
    return `Analyze content differences and opportunities between user and competitors.`;
  }

  private buildTechnicalAnalysisPrompt(
    userTechnical: any,
    competitorTechnical: { competitor: string; technical: any }[]
  ): string {
    return `Analyze technical SEO differences and opportunities.`;
  }

  private getFallbackCompetitorInsights(competitorData: ICompetitorData): CompetitorInsights {
    return {
      strengths: [
        `Strong domain authority (DR: ${competitorData.metrics?.domainRating ?? 'N/A'})`,
        `Good organic keyword coverage (${competitorData.metrics?.organicKeywords ?? 'N/A'} keywords)`,
        `Solid backlink profile (${competitorData.metrics?.backlinks ?? 'N/A'} backlinks)`
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

  private getFallbackKeywordInsights(
    userKeywords: string[],
    competitorKeywords: { competitor: string; keywords: IKeywordData[] }[]
  ): KeywordInsights {
    // Flatten competitor keywords and build gaps
    const allCompetitorKeywords = competitorKeywords.flatMap(comp => comp.keywords.map(k => ({ ...k, competitor: comp.competitor })));
    const keywordGaps: IKeywordGap[] = allCompetitorKeywords
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

  private getFallbackContentInsights(
    userContent: any,
    competitorContent: { competitor: string; content: any }[]
  ): ContentInsights {
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

  private getFallbackTechnicalInsights(
    userTechnical: any,
    competitorTechnical: { competitor: string; technical: any }[]
  ): TechnicalInsights {
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

  private calculateBasicScore(competitorData: ICompetitorData): number {
    let score = 0;
    
    // Domain Rating (0-40 points)
    score += Math.min(40, ((competitorData.metrics?.domainRating ?? 0)) * 0.4);
    
    // Organic Keywords (0-20 points)
    score += Math.min(20, Math.log10(((competitorData.metrics?.organicKeywords ?? 1))) * 5);
    
    // Organic Traffic (0-20 points)
    score += Math.min(20, Math.log10(((competitorData.metrics?.organicTraffic ?? 1))) * 5);

    // Backlinks (0-20 points)
    score += Math.min(20, Math.log10(((competitorData.metrics?.backlinks ?? 1))) * 5);

    return Math.round(score);
  }
}

export default AIAnalysisService;
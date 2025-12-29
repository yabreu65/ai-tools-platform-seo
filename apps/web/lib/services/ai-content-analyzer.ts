import OpenAI from 'openai';

interface ContentAnalysisResult {
  // Content Quality
  quality: {
    score: number; // 0-100
    readabilityScore: number;
    grammarScore: number;
    uniquenessScore: number;
    depthScore: number;
    expertiseScore: number;
  };
  
  // SEO Analysis
  seo: {
    keywordDensity: { [keyword: string]: number };
    topKeywords: string[];
    semanticKeywords: string[];
    titleOptimization: number;
    metaOptimization: number;
    headingStructure: number;
    internalLinking: number;
  };
  
  // Content Structure
  structure: {
    wordCount: number;
    paragraphCount: number;
    sentenceCount: number;
    averageSentenceLength: number;
    readingTime: number; // minutes
    contentType: 'blog' | 'product' | 'service' | 'landing' | 'other';
  };
  
  // Competitive Analysis
  competitive: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    differentiators: string[];
    contentGaps: string[];
  };
  
  // Recommendations
  recommendations: {
    category: 'content' | 'seo' | 'structure' | 'engagement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    implementation: string;
  }[];
  
  // Sentiment & Tone
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    tone: 'professional' | 'casual' | 'technical' | 'marketing' | 'educational';
    emotions: string[];
  };
  
  // Target Audience
  audience: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
    demographics: string[];
    interests: string[];
  };
}

interface CompetitorContentComparison {
  url: string;
  analysis: ContentAnalysisResult;
  comparison: {
    contentLength: 'shorter' | 'similar' | 'longer';
    qualityDifference: number; // -100 to 100
    keywordOverlap: number; // 0-100%
    uniqueAdvantages: string[];
    contentGaps: string[];
    improvementAreas: string[];
  };
}

export class AIContentAnalyzer {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async analyzeContent(
    content: string,
    url: string,
    title?: string,
    metaDescription?: string
  ): Promise<ContentAnalysisResult> {
    try {
      // Prepare content for analysis
      const cleanContent = this.cleanContent(content);
      const wordCount = this.getWordCount(cleanContent);
      
      if (wordCount < 50) {
        throw new Error('Content too short for meaningful analysis');
      }
      
      // Analyze with OpenAI
      const aiAnalysis = await this.performAIAnalysis(cleanContent, url, title, metaDescription);
      
      // Combine AI analysis with programmatic analysis
      const structure = this.analyzeStructure(cleanContent);
      const basicSEO = this.analyzeBasicSEO(cleanContent, title, metaDescription);
      
      return {
        quality: aiAnalysis.quality,
        seo: {
          ...basicSEO,
          ...aiAnalysis.seo
        },
        structure,
        competitive: aiAnalysis.competitive,
        recommendations: aiAnalysis.recommendations,
        sentiment: aiAnalysis.sentiment,
        audience: aiAnalysis.audience
      };
      
    } catch (error) {
      console.error('Content analysis error:', error);
      throw new Error('Failed to analyze content');
    }
  }
  
  async compareCompetitors(
    mainContent: string,
    mainUrl: string,
    competitors: { url: string; content: string; title?: string; metaDescription?: string }[]
  ): Promise<{
    main: ContentAnalysisResult;
    competitors: CompetitorContentComparison[];
    overallInsights: {
      marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
      contentStrategy: string[];
      priorityActions: string[];
      competitiveAdvantages: string[];
      marketGaps: string[];
    };
  }> {
    try {
      // Analyze main content
      const mainAnalysis = await this.analyzeContent(mainContent, mainUrl);
      
      // Analyze competitors
      const competitorAnalyses: CompetitorContentComparison[] = [];
      
      for (const competitor of competitors) {
        const competitorAnalysis = await this.analyzeContent(
          competitor.content,
          competitor.url,
          competitor.title,
          competitor.metaDescription
        );
        
        const comparison = this.compareContent(mainAnalysis, competitorAnalysis);
        
        competitorAnalyses.push({
          url: competitor.url,
          analysis: competitorAnalysis,
          comparison
        });
      }
      
      // Generate overall insights
      const overallInsights = await this.generateOverallInsights(mainAnalysis, competitorAnalyses);
      
      return {
        main: mainAnalysis,
        competitors: competitorAnalyses,
        overallInsights
      };
      
    } catch (error) {
      console.error('Competitor comparison error:', error);
      throw new Error('Failed to compare competitors');
    }
  }
  
  private async performAIAnalysis(
    content: string,
    url: string,
    title?: string,
    metaDescription?: string
  ): Promise<Partial<ContentAnalysisResult>> {
    const prompt = `
Analyze the following web content and provide a comprehensive analysis in JSON format:

URL: ${url}
Title: ${title || 'Not provided'}
Meta Description: ${metaDescription || 'Not provided'}

Content:
${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}

Please analyze and return a JSON object with the following structure:
{
  "quality": {
    "score": number (0-100),
    "readabilityScore": number (0-100),
    "grammarScore": number (0-100),
    "uniquenessScore": number (0-100),
    "depthScore": number (0-100),
    "expertiseScore": number (0-100)
  },
  "seo": {
    "topKeywords": ["keyword1", "keyword2", ...],
    "semanticKeywords": ["semantic1", "semantic2", ...],
    "titleOptimization": number (0-100),
    "metaOptimization": number (0-100),
    "headingStructure": number (0-100),
    "internalLinking": number (0-100)
  },
  "competitive": {
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "opportunities": ["opportunity1", "opportunity2", ...],
    "threats": ["threat1", "threat2", ...],
    "differentiators": ["diff1", "diff2", ...],
    "contentGaps": ["gap1", "gap2", ...]
  },
  "recommendations": [
    {
      "category": "content|seo|structure|engagement",
      "priority": "high|medium|low",
      "title": "Recommendation title",
      "description": "Detailed description",
      "impact": "Expected impact",
      "implementation": "How to implement"
    }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "confidence": number (0-100),
    "tone": "professional|casual|technical|marketing|educational",
    "emotions": ["emotion1", "emotion2", ...]
  },
  "audience": {
    "level": "beginner|intermediate|advanced|mixed",
    "intent": "informational|commercial|transactional|navigational",
    "demographics": ["demo1", "demo2", ...],
    "interests": ["interest1", "interest2", ...]
  }
}

Focus on:
1. Content quality and expertise level
2. SEO optimization opportunities
3. Competitive positioning
4. Actionable recommendations
5. Target audience analysis
6. Sentiment and tone analysis

Provide specific, actionable insights based on the content analysis.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO and content analyst. Provide detailed, accurate analysis in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from AI');
      }
      
      // Parse JSON response
      const analysis = JSON.parse(analysisText);
      return analysis;
      
    } catch (error) {
      console.error('AI analysis error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }
  
  private analyzeStructure(content: string) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
      averageSentenceLength: words.length / sentences.length,
      readingTime: Math.ceil(words.length / 200), // 200 WPM average
      contentType: this.detectContentType(content)
    };
  }
  
  private analyzeBasicSEO(content: string, title?: string, metaDescription?: string) {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: { [key: string]: number } = {};
    
    // Calculate word frequency
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    // Get top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const keywordDensity: { [key: string]: number } = {};
    sortedWords.forEach(([word, count]) => {
      keywordDensity[word] = (count / words.length) * 100;
    });
    
    return {
      keywordDensity,
      topKeywords: sortedWords.map(([word]) => word).slice(0, 5)
    };
  }
  
  private compareContent(
    main: ContentAnalysisResult,
    competitor: ContentAnalysisResult
  ) {
    const lengthDiff = main.structure.wordCount - competitor.structure.wordCount;
    const qualityDiff = main.quality.score - competitor.quality.score;
    
    // Calculate keyword overlap
    const mainKeywords = new Set(main.seo.topKeywords);
    const competitorKeywords = new Set(competitor.seo.topKeywords);
    const overlap = [...mainKeywords].filter(k => competitorKeywords.has(k)).length;
    const keywordOverlap = (overlap / Math.max(mainKeywords.size, competitorKeywords.size)) * 100;
    
    return {
      contentLength: lengthDiff > 500 ? 'longer' as const : 
                   lengthDiff < -500 ? 'shorter' as const : 'similar' as const,
      qualityDifference: qualityDiff,
      keywordOverlap,
      uniqueAdvantages: main.competitive.strengths.filter(s => 
        !competitor.competitive.strengths.includes(s)
      ),
      contentGaps: competitor.competitive.strengths.filter(s => 
        !main.competitive.strengths.includes(s)
      ),
      improvementAreas: competitor.recommendations
        .filter(r => r.priority === 'high')
        .map(r => r.title)
    };
  }
  
  private async generateOverallInsights(
    main: ContentAnalysisResult,
    competitors: CompetitorContentComparison[]
  ) {
    const avgCompetitorQuality = competitors.reduce((sum, c) => 
      sum + c.analysis.quality.score, 0) / competitors.length;
    
    const marketPosition = main.quality.score > avgCompetitorQuality + 10 ? 'leader' :
                          main.quality.score > avgCompetitorQuality - 10 ? 'challenger' :
                          main.quality.score > avgCompetitorQuality - 25 ? 'follower' : 'niche';
    
    return {
      marketPosition,
      contentStrategy: [
        'Focus on content quality improvements',
        'Optimize for target keywords',
        'Improve content structure and readability'
      ],
      priorityActions: main.recommendations
        .filter(r => r.priority === 'high')
        .map(r => r.title)
        .slice(0, 3),
      competitiveAdvantages: main.competitive.strengths.slice(0, 3),
      marketGaps: main.competitive.opportunities.slice(0, 3)
    };
  }
  
  private detectContentType(content: string): 'blog' | 'product' | 'service' | 'landing' | 'other' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('buy now') || lowerContent.includes('add to cart') || 
        lowerContent.includes('price') || lowerContent.includes('$')) {
      return 'product';
    }
    
    if (lowerContent.includes('service') || lowerContent.includes('we offer') || 
        lowerContent.includes('contact us')) {
      return 'service';
    }
    
    if (lowerContent.includes('sign up') || lowerContent.includes('get started') || 
        lowerContent.includes('free trial')) {
      return 'landing';
    }
    
    if (lowerContent.includes('published') || lowerContent.includes('author') || 
        lowerContent.includes('read more')) {
      return 'blog';
    }
    
    return 'other';
  }
  
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  private getWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  private getFallbackAnalysis(): Partial<ContentAnalysisResult> {
    return {
      quality: {
        score: 70,
        readabilityScore: 70,
        grammarScore: 80,
        uniquenessScore: 60,
        depthScore: 65,
        expertiseScore: 70
      },
      seo: {
        topKeywords: [],
        semanticKeywords: [],
        titleOptimization: 60,
        metaOptimization: 60,
        headingStructure: 70,
        internalLinking: 50
      },
      competitive: {
        strengths: ['Content available'],
        weaknesses: ['Analysis limited'],
        opportunities: ['Improve content quality'],
        threats: ['Competition analysis needed'],
        differentiators: [],
        contentGaps: ['Detailed analysis needed']
      },
      recommendations: [
        {
          category: 'content',
          priority: 'medium',
          title: 'Improve content analysis',
          description: 'Enable AI analysis for better insights',
          impact: 'Better competitive positioning',
          implementation: 'Configure AI services'
        }
      ],
      sentiment: {
        overall: 'neutral',
        confidence: 50,
        tone: 'professional',
        emotions: []
      },
      audience: {
        level: 'mixed',
        intent: 'informational',
        demographics: [],
        interests: []
      }
    };
  }
}

// Singleton instance
let aiContentAnalyzer: AIContentAnalyzer | null = null;

export function getAIContentAnalyzer(): AIContentAnalyzer {
  if (!aiContentAnalyzer) {
    aiContentAnalyzer = new AIContentAnalyzer();
  }
  return aiContentAnalyzer;
}
import { NextRequest, NextResponse } from 'next/server';
import { getSEOScraper } from '../../../../lib/services/seo-scraper';
import { getAIContentAnalyzer } from '../../../../lib/services/ai-content-analyzer';
import { getCacheService } from '../../../../lib/services/cache-service';

interface ContentAnalysisRequest {
  urls: string[];
  mainUrl?: string; // The main URL to compare against
  includeAIAnalysis?: boolean;
  includeCompetitorComparison?: boolean;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
}

interface ContentAnalysisResponse {
  mainUrl?: string;
  timestamp: number;
  
  // Individual analyses
  analyses: {
    url: string;
    content: {
      title: string;
      metaDescription: string;
      textContent: string;
      wordCount: number;
      readingTime: number;
    };
    analysis: any; // ContentAnalysisResult from ai-content-analyzer
    error?: string;
  }[];
  
  // Comparative insights (only if multiple URLs)
  comparison?: {
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
    contentStrategy: string[];
    priorityActions: string[];
    competitiveAdvantages: string[];
    marketGaps: string[];
    
    // Content metrics comparison
    metrics: {
      url: string;
      qualityScore: number;
      wordCount: number;
      readabilityScore: number;
      seoScore: number;
      uniquenessScore: number;
    }[];
    
    // Content gaps and opportunities
    gaps: {
      category: 'keywords' | 'topics' | 'structure' | 'quality';
      description: string;
      opportunity: string;
      priority: 'high' | 'medium' | 'low';
    }[];
    
    // Best practices identified
    bestPractices: {
      source: string;
      practice: string;
      impact: string;
      implementation: string;
    }[];
  };
  
  // Overall recommendations
  recommendations: {
    category: 'content' | 'seo' | 'structure' | 'competitive';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'high' | 'medium' | 'low';
    timeline: string;
  }[];
  
  // Summary statistics
  summary: {
    totalUrls: number;
    successfulAnalyses: number;
    averageQualityScore: number;
    averageWordCount: number;
    topKeywords: string[];
    commonThemes: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentAnalysisRequest = await request.json();
    
    if (!body.urls || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one URL is required' },
        { status: 400 }
      );
    }

    if (body.urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed per analysis' },
        { status: 400 }
      );
    }

    const includeAIAnalysis = body.includeAIAnalysis !== false;
    const includeComparison = body.includeCompetitorComparison !== false && body.urls.length > 1;
    const analysisDepth = body.analysisDepth || 'detailed';

    // Validate URLs
    const validUrls: string[] = [];
    for (const url of body.urls) {
      try {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(fullUrl);
        validUrls.push(fullUrl);
      } catch {
        console.warn(`Invalid URL skipped: ${url}`);
      }
    }

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheService = getCacheService();
    const cacheKey = `content:${validUrls.sort().join(',')}:${includeAIAnalysis}:${analysisDepth}`;
    const cachedResult = cacheService.get<ContentAnalysisResponse>(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Initialize services
    const seoScraper = getSEOScraper();
    const aiAnalyzer = includeAIAnalysis ? getAIContentAnalyzer() : null;

    try {
      const analyses = [];
      const errors = [];

      // Analyze each URL
      for (const url of validUrls) {
        try {
          console.log(`Analyzing content for: ${url}`);
          
          // Scrape content
          const seoMetrics = await seoScraper.scrapeURL(url);
          
          // Extract text content
          const textContent = extractTextContent(seoMetrics);
          
          if (textContent.length < 100) {
            analyses.push({
              url,
              content: {
                title: seoMetrics.title || '',
                metaDescription: seoMetrics.metaDescription || '',
                textContent: textContent,
                wordCount: textContent.split(/\s+/).length,
                readingTime: Math.ceil(textContent.split(/\s+/).length / 200)
              },
              analysis: null,
              error: 'Insufficient content for analysis'
            });
            continue;
          }

          let aiAnalysis = null;
          
          // Perform AI analysis if enabled
          if (aiAnalyzer && analysisDepth !== 'basic') {
            try {
              aiAnalysis = await aiAnalyzer.analyzeContent(
                textContent,
                url,
                seoMetrics.title,
                seoMetrics.metaDescription
              );
            } catch (aiError) {
              console.warn(`AI analysis failed for ${url}:`, aiError);
              aiAnalysis = generateBasicAnalysis(textContent, seoMetrics);
            }
          } else {
            aiAnalysis = generateBasicAnalysis(textContent, seoMetrics);
          }

          analyses.push({
            url,
            content: {
              title: seoMetrics.title || '',
              metaDescription: seoMetrics.metaDescription || '',
              textContent: textContent,
              wordCount: textContent.split(/\s+/).length,
              readingTime: Math.ceil(textContent.split(/\s+/).length / 200)
            },
            analysis: aiAnalysis
          });

        } catch (error) {
          console.error(`Error analyzing ${url}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ url, error: errorMessage });
          analyses.push({
            url,
            content: {
              title: '',
              metaDescription: '',
              textContent: '',
              wordCount: 0,
              readingTime: 0
            },
            analysis: null,
            error: errorMessage
          });
        }
      }

      // Generate comparison if multiple URLs
      let comparison = null;
      if (includeComparison && analyses.filter(a => a.analysis).length > 1) {
        comparison = generateComparison(analyses, body.mainUrl);
      }

      // Generate overall recommendations
      const recommendations = generateOverallRecommendations(analyses, comparison);

      // Generate summary
      const summary = generateSummary(analyses);

      const result: ContentAnalysisResponse = {
        mainUrl: body.mainUrl,
        timestamp: Date.now(),
        analyses,
        comparison: comparison as any,
        recommendations,
        summary
      };

      // Cache the result
      const ttl = cacheService.getAdaptiveTTL('seo', analysisDepth);
      cacheService.set(cacheKey, result, ttl);

      return NextResponse.json({
        success: true,
        data: result,
        cached: false,
        errors: errors.length > 0 ? errors : undefined
      });

    } finally {
      await seoScraper.close();
    }

  } catch (error) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractTextContent(seoMetrics: any): string {
  const content = [];
  
  // Add title and meta description
  if (seoMetrics.title) content.push(seoMetrics.title);
  if (seoMetrics.metaDescription) content.push(seoMetrics.metaDescription);
  
  // Add headings
  Object.values(seoMetrics.headings).flat().forEach((heading: any) => {
    if (typeof heading === 'string') content.push(heading);
  });
  
  // Add body content if available
  if (seoMetrics.content && seoMetrics.content.text) {
    content.push(seoMetrics.content.text);
  }
  
  return content.join(' ').trim();
}

function generateBasicAnalysis(textContent: string, seoMetrics: any) {
  const words = textContent.split(/\s+/).filter(w => w.length > 0);
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Basic keyword analysis
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length > 3) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });
  
  const topKeywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  return {
    quality: {
      score: Math.min(100, Math.max(30, words.length / 10)), // Basic score based on length
      readabilityScore: Math.max(50, 100 - (words.length / sentences.length - 15) * 2),
      grammarScore: 75, // Default
      uniquenessScore: 70, // Default
      depthScore: Math.min(100, words.length / 20),
      expertiseScore: 65 // Default
    },
    seo: {
      keywordDensity: Object.fromEntries(
        Object.entries(wordFreq).map(([word, count]) => [word, (count / words.length) * 100])
      ),
      topKeywords,
      semanticKeywords: topKeywords.slice(0, 5),
      titleOptimization: seoMetrics.title ? 80 : 20,
      metaOptimization: seoMetrics.metaDescription ? 80 : 20,
      headingStructure: seoMetrics.headings.h1.length === 1 ? 90 : 60,
      internalLinking: 50 // Default
    },
    structure: {
      wordCount: words.length,
      paragraphCount: textContent.split(/\n\s*\n/).length,
      sentenceCount: sentences.length,
      averageSentenceLength: words.length / sentences.length,
      readingTime: Math.ceil(words.length / 200),
      contentType: detectContentType(textContent)
    },
    competitive: {
      strengths: words.length > 500 ? ['Comprehensive content'] : [],
      weaknesses: words.length < 300 ? ['Short content'] : [],
      opportunities: ['Improve keyword optimization', 'Enhance content depth'],
      threats: ['Competitor content may be more comprehensive'],
      differentiators: [],
      contentGaps: ['Detailed analysis needed']
    },
    recommendations: [
      {
        category: 'content',
        priority: words.length < 500 ? 'high' : 'medium',
        title: 'Optimize content length',
        description: words.length < 500 ? 'Content is too short for good SEO' : 'Content length is adequate',
        impact: 'Improved search rankings',
        implementation: 'Add more detailed information and examples'
      }
    ],
    sentiment: {
      overall: 'neutral',
      confidence: 60,
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

function detectContentType(content: string): 'blog' | 'product' | 'service' | 'landing' | 'other' {
  const lower = content.toLowerCase();
  
  if (lower.includes('buy') || lower.includes('price') || lower.includes('$')) return 'product';
  if (lower.includes('service') || lower.includes('contact')) return 'service';
  if (lower.includes('sign up') || lower.includes('get started')) return 'landing';
  if (lower.includes('published') || lower.includes('author')) return 'blog';
  
  return 'other';
}

function generateComparison(analyses: any[], mainUrl?: string) {
  const validAnalyses = analyses.filter(a => a.analysis);
  
  if (validAnalyses.length < 2) return null;

  // Find main analysis
  const mainAnalysis = mainUrl ? 
    validAnalyses.find(a => a.url === mainUrl) : 
    validAnalyses[0];

  if (!mainAnalysis) return null;

  // Calculate metrics
  const metrics = validAnalyses.map(a => ({
    url: a.url,
    qualityScore: a.analysis.quality.score,
    wordCount: a.analysis.structure.wordCount,
    readabilityScore: a.analysis.quality.readabilityScore,
    seoScore: (a.analysis.seo.titleOptimization + a.analysis.seo.metaOptimization + a.analysis.seo.headingStructure) / 3,
    uniquenessScore: a.analysis.quality.uniquenessScore
  }));

  // Determine market position
  const avgQuality = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length;
  const mainQuality = mainAnalysis.analysis.quality.score;
  
  const marketPosition = mainQuality > avgQuality + 15 ? 'leader' :
                        mainQuality > avgQuality - 5 ? 'challenger' :
                        mainQuality > avgQuality - 20 ? 'follower' : 'niche';

  // Generate gaps and opportunities
  const gaps = [
    {
      category: 'content' as const,
      description: 'Content length optimization needed',
      opportunity: 'Expand content to match top performers',
      priority: 'medium' as const
    },
    {
      category: 'keywords' as const,
      description: 'Keyword optimization opportunities',
      opportunity: 'Target high-value keywords used by competitors',
      priority: 'high' as const
    }
  ];

  // Best practices from top performers
  const bestPractices = validAnalyses
    .filter(a => a.analysis.quality.score > avgQuality)
    .slice(0, 3)
    .map(a => ({
      source: a.url,
      practice: `High-quality content with ${a.analysis.structure.wordCount} words`,
      impact: 'Improved search rankings and user engagement',
      implementation: 'Expand content depth and add more detailed information'
    }));

  return {
    marketPosition,
    contentStrategy: [
      'Focus on content quality and depth',
      'Optimize for target keywords',
      'Improve content structure and readability'
    ],
    priorityActions: [
      'Expand content length',
      'Improve keyword targeting',
      'Enhance content structure'
    ],
    competitiveAdvantages: mainAnalysis.analysis.competitive.strengths,
    marketGaps: mainAnalysis.analysis.competitive.opportunities,
    metrics,
    gaps,
    bestPractices
  };
}

function generateOverallRecommendations(analyses: any[], comparison: any) {
  const recommendations: any[] = [];
  const validAnalyses = analyses.filter(a => a.analysis);
  
  if (validAnalyses.length === 0) return recommendations;

  // Content length recommendations
  const avgWordCount = validAnalyses.reduce((sum, a) => sum + a.analysis.structure.wordCount, 0) / validAnalyses.length;
  
  if (avgWordCount < 500) {
    recommendations.push({
      category: 'content',
      priority: 'high',
      title: 'Increase Content Length',
      description: 'Content is shorter than recommended for good SEO performance',
      impact: 'Improved search rankings and user engagement',
      effort: 'medium',
      timeline: '1-2 weeks'
    });
  }

  // SEO optimization recommendations
  const avgSEOScore = validAnalyses.reduce((sum, a) => 
    sum + (a.analysis.seo.titleOptimization + a.analysis.seo.metaOptimization) / 2, 0) / validAnalyses.length;
  
  if (avgSEOScore < 70) {
    recommendations.push({
      category: 'seo',
      priority: 'high',
      title: 'Optimize SEO Elements',
      description: 'Improve titles, meta descriptions, and heading structure',
      impact: 'Better search visibility and click-through rates',
      effort: 'low',
      timeline: '1 week'
    });
  }

  // Competitive recommendations
  if (comparison && comparison.marketPosition !== 'leader') {
    recommendations.push({
      category: 'competitive',
      priority: 'medium',
      title: 'Analyze Top Competitors',
      description: 'Study and implement best practices from market leaders',
      impact: 'Improved competitive positioning',
      effort: 'high',
      timeline: '2-4 weeks'
    });
  }

  return recommendations;
}

function generateSummary(analyses: any[]) {
  const validAnalyses = analyses.filter(a => a.analysis);
  
  if (validAnalyses.length === 0) {
    return {
      totalUrls: analyses.length,
      successfulAnalyses: 0,
      averageQualityScore: 0,
      averageWordCount: 0,
      topKeywords: [],
      commonThemes: []
    };
  }

  const avgQuality = validAnalyses.reduce((sum, a) => sum + a.analysis.quality.score, 0) / validAnalyses.length;
  const avgWordCount = validAnalyses.reduce((sum, a) => sum + a.analysis.structure.wordCount, 0) / validAnalyses.length;
  
  // Collect all keywords
  const allKeywords: { [key: string]: number } = {};
  validAnalyses.forEach(a => {
    a.analysis.seo.topKeywords.forEach((keyword: string) => {
      allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
    });
  });
  
  const topKeywords = Object.entries(allKeywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);

  return {
    totalUrls: analyses.length,
    successfulAnalyses: validAnalyses.length,
    averageQualityScore: Math.round(avgQuality),
    averageWordCount: Math.round(avgWordCount),
    topKeywords,
    commonThemes: topKeywords.slice(0, 5) // Use top keywords as themes
  };
}
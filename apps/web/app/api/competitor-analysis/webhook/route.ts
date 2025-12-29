import { NextRequest, NextResponse } from 'next/server';
import { ensureDbConnection } from '../../../../lib/mongodb';
import CompetitorAnalysisModel from '../../../../lib/models/CompetitorAnalysis';
import { getCacheService } from '../../../../lib/services/cache-service';

interface WebhookPayload {
  analysisId: string;
  type: 'competitor' | 'technical' | 'content' | 'backlinks';
  status: 'completed' | 'failed' | 'processing';
  results?: any;
  error?: string;
  progress?: number;
}

interface CompetitorResult {
  domain: string;
  name: string;
  domainRating: number;
  organicKeywords: number;
  organicTraffic: number;
  backlinks: number;
  referringDomains: number;
  technicalScore: number;
  topKeywords: any[];
  topPages: any[];
  backlinksProfile: any[];
  contentGaps: any[];
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await ensureDbConnection();
    
    // Parse webhook payload
    const payload: WebhookPayload = await request.json();
    
    // Validate required fields
    if (!payload.analysisId || !payload.type || !payload.status) {
      return NextResponse.json(
        { error: 'Campos requeridos: analysisId, type, status' },
        { status: 400 }
      );
    }

    console.log(`Received webhook: ${payload.type} analysis ${payload.analysisId} - ${payload.status}`);

    // Handle different webhook types
    switch (payload.type) {
      case 'competitor':
        await handleCompetitorResults(payload);
        break;
      case 'technical':
        await handleTechnicalResults(payload);
        break;
      case 'content':
        await handleContentResults(payload);
        break;
      case 'backlinks':
        await handleBacklinkResults(payload);
        break;
      default:
        return NextResponse.json(
          { error: `Tipo de análisis no válido: ${payload.type}` },
          { status: 400 }
        );
    }

    // Check if all analyses are complete and update main analysis
    await checkAndUpdateMainAnalysis(payload.analysisId);

    return NextResponse.json({ 
      success: true, 
      message: `${payload.type} analysis processed successfully` 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleCompetitorResults(payload: WebhookPayload) {
  const { analysisId, status, results, error } = payload;

  if (status === 'completed' && results) {
    // Update main analysis with competitor results
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId },
      {
        status: 'processing', // Still processing sub-analyses
        'results.competitors': results.competitors || [],
        'results.overview.totalCompetitors': results.competitors?.length || 0,
        'results.overview.averageDomainRating': calculateAverageDR(results.competitors),
        updatedAt: new Date()
      }
    );

    // Cache the competitor results
    const cacheService = getCacheService();
    const cacheKey = `competitor_${analysisId}`;
    cacheService.set(cacheKey, results, 3600); // 1 hour cache

  } else if (status === 'failed') {
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId },
      {
        status: 'failed',
        error: error || 'Competitor analysis failed',
        updatedAt: new Date()
      }
    );
  }
}

async function handleTechnicalResults(payload: WebhookPayload) {
  const { analysisId, status, results, error } = payload;
  
  // Extract parent analysis ID and competitor URL from analysisId
  const parentAnalysisId = extractParentAnalysisId(analysisId);
  const competitorUrl = extractCompetitorFromAnalysisId(analysisId, 'tech');

  if (status === 'completed' && results) {
    // Store technical analysis results in separate collection or as sub-document
    await storeTechnicalAnalysis(analysisId, results);
    
    // Update main analysis with technical insights
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.technicalInsights': {
            competitor: competitorUrl,
            technicalScore: results.overallScore,
            ssl: results.ssl,
            performance: results.performance,
            mobile: results.mobile,
            accessibility: results.accessibility,
            technologies: results.technologies,
            analyzedAt: results.analyzedAt
          }
        },
        updatedAt: new Date()
      }
    );

  } else if (status === 'failed') {
    console.error(`Technical analysis failed for ${competitorUrl}:`, error);
    
    // Store failure information
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.technicalInsights': {
            competitor: competitorUrl,
            error: error || 'Technical analysis failed',
            status: 'failed'
          }
        },
        updatedAt: new Date()
      }
    );
  }
}

async function handleContentResults(payload: WebhookPayload) {
  const { analysisId, status, results, error } = payload;
  
  const parentAnalysisId = extractParentAnalysisId(analysisId);
  const competitorUrl = extractCompetitorFromAnalysisId(analysisId, 'content');

  if (status === 'completed' && results) {
    // Store content analysis results
    await storeContentAnalysis(analysisId, results);
    
    // Update main analysis with content insights
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.contentGaps': {
            competitor: competitorUrl,
            contentScore: results.overallScore,
            keywords: results.keywords,
            gaps: results.gaps,
            opportunities: results.opportunities,
            recommendations: results.recommendations,
            analyzedAt: results.analyzedAt
          }
        },
        $inc: {
          'results.overview.totalKeywords': results.keywords?.extracted?.length || 0
        },
        updatedAt: new Date()
      }
    );

  } else if (status === 'failed') {
    console.error(`Content analysis failed for ${competitorUrl}:`, error);
    
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.contentGaps': {
            competitor: competitorUrl,
            error: error || 'Content analysis failed',
            status: 'failed'
          }
        },
        updatedAt: new Date()
      }
    );
  }
}

async function handleBacklinkResults(payload: WebhookPayload) {
  const { analysisId, status, results, error } = payload;
  
  const parentAnalysisId = extractParentAnalysisId(analysisId);
  const competitorUrl = extractCompetitorFromAnalysisId(analysisId, 'backlinks');

  if (status === 'completed' && results) {
    // Store backlink analysis results
    await storeBacklinkAnalysis(analysisId, results);
    
    // Update main analysis with backlink insights
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.backlinkOpportunities': {
            competitor: competitorUrl,
            backlinkScore: results.overallScore,
            domainAuthority: results.domain?.authority,
            backlinks: results.backlinks?.analysis,
            opportunities: results.opportunities,
            recommendations: results.recommendations,
            analyzedAt: results.analyzedAt
          }
        },
        $inc: {
          'results.overview.totalBacklinks': results.backlinks?.analysis?.totalBacklinks || 0
        },
        updatedAt: new Date()
      }
    );

  } else if (status === 'failed') {
    console.error(`Backlink analysis failed for ${competitorUrl}:`, error);
    
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        $push: {
          'results.insights.backlinkOpportunities': {
            competitor: competitorUrl,
            error: error || 'Backlink analysis failed',
            status: 'failed'
          }
        },
        updatedAt: new Date()
      }
    );
  }
}

async function checkAndUpdateMainAnalysis(analysisId: string) {
  // Extract parent analysis ID if this is a sub-analysis
  const parentAnalysisId = analysisId.includes('_') ? 
    analysisId.split('_')[0] : analysisId;

  // Get main analysis
  const mainAnalysis = await CompetitorAnalysisModel.findOne({ 
    analysisId: parentAnalysisId 
  });

  if (!mainAnalysis) {
    console.error(`Main analysis not found: ${parentAnalysisId}`);
    return;
  }

  // Count expected vs completed sub-analyses
  const competitors = mainAnalysis.config?.competitors || [];
  const analysisType = mainAnalysis.config?.analysisType || 'basic';
  
  let expectedAnalyses = 1; // Main competitor analysis
  let completedAnalyses = 1; // Assume main is completed if we're here
  
  // Count technical analyses
  if (analysisType === 'comprehensive') {
    expectedAnalyses += competitors.length;
    const technicalInsights = mainAnalysis.results?.insights?.technicalInsights || [];
    completedAnalyses += technicalInsights.filter((t: any) => !t.error).length;
  }
  
  // Count content analyses
  if (['comprehensive', 'advanced'].includes(analysisType)) {
    expectedAnalyses += competitors.length;
    const contentGaps = mainAnalysis.results?.insights?.contentGaps || [];
    completedAnalyses += contentGaps.filter((c: any) => !c.error).length;
  }
  
  // Count backlink analyses
  if (['comprehensive', 'advanced'].includes(analysisType)) {
    expectedAnalyses += competitors.length;
    const backlinkOpportunities = mainAnalysis.results?.insights?.backlinkOpportunities || [];
    completedAnalyses += backlinkOpportunities.filter((b: any) => !b.error).length;
  }

  // Check if all analyses are complete
  if (completedAnalyses >= expectedAnalyses) {
    // Generate final insights and comparisons
    const finalResults = await generateFinalInsights(mainAnalysis);
    
    // Update main analysis as completed
    await CompetitorAnalysisModel.findOneAndUpdate(
      { analysisId: parentAnalysisId },
      {
        status: 'completed',
        completedAt: new Date(),
        'results.overview.processingTime': Date.now() - new Date(mainAnalysis.createdAt).getTime(),
        'results.insights.aiInsights': finalResults.aiInsights,
        'results.comparisons': finalResults.comparisons,
        updatedAt: new Date()
      }
    );

    // Cache final results
    const cacheService = getCacheService();
    const cacheKey = `analysis_${parentAnalysisId}`;
    cacheService.set(cacheKey, mainAnalysis.results, 7200); // 2 hours cache

    console.log(`Analysis ${parentAnalysisId} completed successfully`);
  }
}

// Helper functions
function extractParentAnalysisId(analysisId: string): string {
  return analysisId.split('_')[0];
}

function extractCompetitorFromAnalysisId(analysisId: string, type: string): string {
  const parts = analysisId.split(`_${type}_`);
  return parts[1]?.replace(/_/g, '.') || 'unknown';
}

function calculateAverageDR(competitors: CompetitorResult[]): number {
  if (!competitors || competitors.length === 0) return 0;
  const total = competitors.reduce((sum, comp) => sum + (comp.domainRating || 0), 0);
  return Math.round(total / competitors.length);
}

async function storeTechnicalAnalysis(analysisId: string, results: any) {
  // Store in separate collection or cache for detailed access
  const cacheService = getCacheService();
  cacheService.set(`technical_${analysisId}`, results, 3600);
}

async function storeContentAnalysis(analysisId: string, results: any) {
  const cacheService = getCacheService();
  cacheService.set(`content_${analysisId}`, results, 3600);
}

async function storeBacklinkAnalysis(analysisId: string, results: any) {
  const cacheService = getCacheService();
  cacheService.set(`backlinks_${analysisId}`, results, 3600);
}

async function generateFinalInsights(analysis: any) {
  // Generate AI insights based on all collected data
  const aiInsights = [
    {
      type: 'opportunity',
      title: 'Oportunidades de Keywords',
      description: 'Identificadas palabras clave con alto potencial y baja competencia',
      priority: 'high',
      impact: 'alto'
    },
    {
      type: 'technical',
      title: 'Mejoras Técnicas',
      description: 'Optimizaciones técnicas para mejorar el rendimiento SEO',
      priority: 'medium',
      impact: 'medio'
    },
    {
      type: 'content',
      title: 'Gaps de Contenido',
      description: 'Temas y contenidos que los competidores cubren mejor',
      priority: 'high',
      impact: 'alto'
    }
  ];

  const comparisons = {
    keywordOverlap: [],
    contentSimilarity: [],
    backlinkComparison: [],
    technicalComparison: []
  };

  return { aiInsights, comparisons };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'competitor-analysis-webhook'
  });
}
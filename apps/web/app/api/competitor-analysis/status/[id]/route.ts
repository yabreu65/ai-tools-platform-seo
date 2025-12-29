import { NextRequest, NextResponse } from 'next/server';
import { ensureDbConnection } from '../../../../../lib/mongodb';
import CompetitorAnalysisModel from '../../../../../lib/models/CompetitorAnalysis';

interface AnalysisStatus {
  analysisId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    overall: number;
    competitors: number;
    technical: number;
    content: number;
    backlinks: number;
  };
  results?: any;
  error?: string;
  estimatedTimeRemaining?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowProgress {
  competitor: boolean;
  technical: { [key: string]: boolean };
  content: { [key: string]: boolean };
  backlinks: { [key: string]: boolean };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await ensureDbConnection();
    
    const { id: analysisId } = await params;
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    // Get analysis from database
    const analysis = await CompetitorAnalysisModel.findOne({ analysisId });
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Calculate progress based on sub-analyses completion
    const progress = await calculateAnalysisProgress(analysisId, analysis);
    
    // Estimate remaining time based on progress and competitors
    const estimatedTimeRemaining = calculateEstimatedTime(analysis, progress.overall);

    const statusResponse: AnalysisStatus = {
      analysisId: analysis.analysisId,
      status: analysis.status,
      progress,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
      estimatedTimeRemaining,
      ...(analysis.status === 'completed' && { 
        results: analysis.results,
        completedAt: analysis.completedAt?.toISOString()
      }),
      ...(analysis.status === 'failed' && { 
        error: analysis.error 
      })
    };

    return NextResponse.json(statusResponse);

  } catch (error) {
    console.error('Error getting analysis status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function calculateAnalysisProgress(
  analysisId: string, 
  mainAnalysis: any
): Promise<AnalysisStatus['progress']> {
  try {
    // Get all related sub-analyses from different collections
    const [technicalAnalyses, contentAnalyses, backlinkAnalyses] = await Promise.all([
      // Check technical analyses collection
      CompetitorAnalysisModel.find({ 
        analysisId: new RegExp(`^${analysisId}_tech_`) 
      }).select('status analysisId'),
      
      // Check content analyses collection  
      CompetitorAnalysisModel.find({ 
        analysisId: new RegExp(`^${analysisId}_content_`) 
      }).select('status analysisId'),
      
      // Check backlink analyses collection
      CompetitorAnalysisModel.find({ 
        analysisId: new RegExp(`^${analysisId}_backlinks_`) 
      }).select('status analysisId')
    ]);

    const totalCompetitors = mainAnalysis.config?.competitors?.length || 1;
    
    // Calculate progress for each analysis type
    const competitorProgress = mainAnalysis.status === 'completed' ? 100 : 
                              mainAnalysis.status === 'processing' ? 50 : 0;
    
    const technicalProgress = calculateSubAnalysisProgress(technicalAnalyses, totalCompetitors);
    const contentProgress = calculateSubAnalysisProgress(contentAnalyses, totalCompetitors);
    const backlinkProgress = calculateSubAnalysisProgress(backlinkAnalyses, totalCompetitors);
    
    // Calculate overall progress based on analysis type
    const analysisType = mainAnalysis.config?.analysisType || 'basic';
    let overallProgress = 0;
    let totalWeight = 0;
    
    // Competitor analysis (always included)
    overallProgress += competitorProgress * 0.3;
    totalWeight += 0.3;
    
    // Technical analysis (for full analysis)
    if (analysisType === 'comprehensive') {
      overallProgress += technicalProgress * 0.25;
      totalWeight += 0.25;
    }
    
    // Content analysis (for full, keywords, content)
    if (['comprehensive', 'advanced'].includes(analysisType)) {
      overallProgress += contentProgress * 0.25;
      totalWeight += 0.25;
    }
    
    // Backlink analysis (for full, backlinks)
    if (['comprehensive', 'advanced'].includes(analysisType)) {
      overallProgress += backlinkProgress * 0.2;
      totalWeight += 0.2;
    }
    
    // Normalize to 100%
    const finalOverallProgress = totalWeight > 0 ? Math.round(overallProgress / totalWeight) : competitorProgress;

    return {
      overall: Math.min(100, finalOverallProgress),
      competitors: Math.round(competitorProgress),
      technical: Math.round(technicalProgress),
      content: Math.round(contentProgress),
      backlinks: Math.round(backlinkProgress)
    };

  } catch (error) {
    console.error('Error calculating progress:', error);
    
    // Fallback to main analysis status
    const statusProgress = {
      'pending': 0,
      'processing': 50,
      'completed': 100,
      'failed': 0
    };
    
    const progress = statusProgress[mainAnalysis.status as keyof typeof statusProgress] || 0;
    
    return {
      overall: progress,
      competitors: progress,
      technical: progress,
      content: progress,
      backlinks: progress
    };
  }
}

function calculateSubAnalysisProgress(analyses: any[], expectedCount: number): number {
  if (expectedCount === 0) return 100;
  
  const completedCount = analyses.filter(a => a.status === 'completed').length;
  const processingCount = analyses.filter(a => a.status === 'processing').length;
  
  // Each completed analysis = 100%, each processing = 50%
  const totalProgress = (completedCount * 100) + (processingCount * 50);
  const maxProgress = expectedCount * 100;
  
  return Math.min(100, Math.round(totalProgress / maxProgress));
}

function calculateEstimatedTime(analysis: any, overallProgress: number): number {
  if (analysis.status === 'completed' || analysis.status === 'failed') {
    return 0;
  }
  
  const totalCompetitors = analysis.config?.competitors?.length || 1;
  const analysisType = analysis.config?.analysisType || 'basic';
  
  // Base time per competitor based on analysis type
  let baseTimePerCompetitor = 30; // seconds
  
  switch (analysisType) {
    case 'comprehensive':
      baseTimePerCompetitor = 60;
      break;
    case 'advanced':
      baseTimePerCompetitor = 45;
      break;
    default:
      baseTimePerCompetitor = 30;
  }
  
  const totalEstimatedTime = totalCompetitors * baseTimePerCompetitor;
  const elapsedTime = Date.now() - new Date(analysis.createdAt).getTime();
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  
  // Calculate remaining time based on progress
  const progressRatio = Math.max(0.1, overallProgress / 100); // Minimum 10% to avoid division by zero
  const estimatedTotalTime = elapsedSeconds / progressRatio;
  const remainingTime = Math.max(0, estimatedTotalTime - elapsedSeconds);
  
  return Math.round(remainingTime);
}

// Optional: WebSocket endpoint for real-time updates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;
    const body = await request.json();
    
    // This could be used to update progress from n8n workflows
    if (body.type === 'progress_update') {
      await ensureDbConnection();
      
      await CompetitorAnalysisModel.findOneAndUpdate(
        { analysisId },
        { 
          status: body.status || 'processing',
          updatedAt: new Date(),
          ...(body.progress && { 'metadata.progress': body.progress })
        }
      );
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Tipo de actualización no válido' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating analysis progress:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
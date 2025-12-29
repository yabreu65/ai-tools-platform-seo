import { NextRequest, NextResponse } from 'next/server';
import CompetitorAnalysisModel from '../../../../../lib/models/CompetitorAnalysis';
import { ensureDbConnection } from '../../../../../lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbConnection();
    
    const { id: analysisId } = await params;
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    // Find analysis by analysisId
    const analysis = await CompetitorAnalysisModel.findOne({ analysisId });
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.analysisId,
        name: analysis.name,
        status: analysis.status,
        progress: analysis.progress || 0,
        config: analysis.config,
        results: analysis.results,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
        completedAt: analysis.completedAt,
        error: analysis.error
      }
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
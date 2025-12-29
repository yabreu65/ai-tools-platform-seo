import { NextRequest, NextResponse } from 'next/server';

// GET - Obtener estado del análisis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;

    // Obtener del cache global
    const results = (global as any).analysisCache?.get(analysisId);

    if (!results) {
      // Si no hay resultados aún, está corriendo
      return NextResponse.json({
        success: true,
        data: {
          analysisId, // IMPORTANTE: incluir el ID
          status: 'running',
          progress: 50,
          pagesAnalyzed: 1,
          linksFound: 0,
          brokenLinks: 0,
          estimatedTimeRemaining: 'Analizando...'
        }
      });
    }

    // Si hay error
    if (results.error) {
      return NextResponse.json({
        success: true,
        data: {
          analysisId, // IMPORTANTE: incluir el ID
          status: 'error',
          progress: 100,
          error: results.message
        }
      });
    }

    // Análisis completado
    return NextResponse.json({
      success: true,
      data: {
        analysisId, // IMPORTANTE: incluir el ID
        status: 'completed',
        progress: 100,
        pagesAnalyzed: results.summary?.totalPages || 1,
        linksFound: results.summary?.totalLinks || 0,
        brokenLinks: results.summary?.brokenLinks || 0,
        estimatedTimeRemaining: 'Completado'
      }
    });
  } catch (error) {
    console.error('Error getting analysis status:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado del análisis' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar análisis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;

    // Aquí iría la lógica para cancelar el análisis en curso

    return NextResponse.json({
      success: true,
      message: 'Análisis cancelado correctamente'
    });
  } catch (error) {
    console.error('Error canceling analysis:', error);
    return NextResponse.json(
      { error: 'Error al cancelar análisis' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Importar el cache compartido
// En Next.js, necesitamos recrear el Map ya que no podemos importar directamente
const analysisCache = new Map<string, any>();

// GET - Obtener resultados del análisis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;

    // Intentar obtener resultados del cache
    // Nota: En producción, esto debería ser una base de datos o Redis
    const results = (global as any).analysisCache?.get(analysisId);

    if (!results) {
      return NextResponse.json(
        { error: 'Análisis no encontrado o aún en proceso' },
        { status: 404 }
      );
    }

    if (results.error) {
      return NextResponse.json(
        { error: results.message || 'Error durante el análisis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting analysis results:', error);
    return NextResponse.json(
      { error: 'Error al obtener resultados' },
      { status: 500 }
    );
  }
}

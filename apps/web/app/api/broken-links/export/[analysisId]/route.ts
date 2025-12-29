import { NextRequest, NextResponse } from 'next/server';

// GET - Exportar resultados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Aquí iría la lógica real de exportación
    // Por ahora, retornamos datos simulados según el formato

    if (format === 'csv') {
      const csv = `URL,Estado,Código,Encontrado En
https://example.com/page1,Broken,404,https://example.com/
https://example.com/image.jpg,Broken,404,https://example.com/gallery`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="broken-links-${analysisId}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      return NextResponse.json(
        { error: 'Exportación PDF en desarrollo' },
        { status: 501 }
      );
    }

    // JSON por defecto
    const data = {
      analysisId,
      exportedAt: new Date().toISOString(),
      brokenLinks: [
        {
          url: 'https://example.com/page1',
          statusCode: 404,
          foundOn: ['https://example.com/']
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error exporting results:', error);
    return NextResponse.json(
      { error: 'Error al exportar resultados' },
      { status: 500 }
    );
  }
}

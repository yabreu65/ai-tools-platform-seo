import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/seoAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    // Simulate authentication for demo
    const user = {
      id: 'demo-user',
      plan: 'free'
    };
    const { analysisId } = await params;
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'csv';
    const includeMetrics = searchParams.get('includeMetrics') === 'true';
    const includeOpportunities = searchParams.get('includeOpportunities') === 'true';

    // Forward request to backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const queryParams = new URLSearchParams({
      format,
      includeMetrics: includeMetrics.toString(),
      includeOpportunities: includeOpportunities.toString()
    });

    const response = await fetch(
      `${backendUrl}/api/keyword-scraper/export/${analysisId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'x-user-id': user.id,
          'x-user-plan': user.plan || 'free'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to export results' },
        { status: response.status }
      );
    }

    // Get the file buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || 
      `attachment; filename="keyword-analysis-${analysisId}.${format}"`;

    // Return the file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition
      }
    });

  } catch (error) {
    console.error('Error exporting keyword scraper results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
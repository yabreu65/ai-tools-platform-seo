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

    // Forward request to backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/keyword-scraper/status/${analysisId}`, {
      method: 'GET',
      headers: {
        'x-user-id': user.id,
        'x-user-plan': user.plan || 'free'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to get status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting keyword scraper status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
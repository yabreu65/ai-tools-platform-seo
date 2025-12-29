import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/seoAuth';

export async function POST(request: NextRequest) {
  try {
    // Simulate authentication for demo
    const user = {
      id: 'demo-user',
      plan: 'free'
    };
    const body = await request.json();

    // Validate request body
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/keyword-scraper/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-plan': user.plan || 'free'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to start analysis' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in keyword scraper analyze:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
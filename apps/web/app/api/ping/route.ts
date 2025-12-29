import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring connectivity
 * Used by OfflineIndicator component to test network status
 */

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server is running'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Server error'
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    // HEAD request should return the same headers as GET but without body
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
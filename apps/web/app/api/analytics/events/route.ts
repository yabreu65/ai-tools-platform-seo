import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Por ahora solo loggeamos los datos
    console.log('Analytics Event:', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Event Error:', error);
    return NextResponse.json(
      { error: 'Error saving event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    // Retornamos datos mock
    const mockEvents: any[] = [];
    
    return NextResponse.json(mockEvents);
  } catch (error) {
    console.error('Analytics Events GET Error:', error);
    return NextResponse.json(
      { error: 'Error fetching events' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Por ahora solo loggeamos los datos
    console.log('Analytics Conversion:', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Conversion Error:', error);
    return NextResponse.json(
      { error: 'Error saving conversion' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    // Retornamos datos mock
    const mockConversions: any[] = [];
    
    return NextResponse.json(mockConversions);
  } catch (error) {
    console.error('Analytics Conversions GET Error:', error);
    return NextResponse.json(
      { error: 'Error fetching conversions' },
      { status: 500 }
    );
  }
}
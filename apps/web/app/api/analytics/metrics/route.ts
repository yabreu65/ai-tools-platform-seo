import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'week';
    
    // Retornamos métricas mock
    const mockMetrics = {
      pageViews: 1250,
      uniqueVisitors: 890,
      toolUsage: 456,
      conversions: 23,
      avgSessionDuration: 180000, // 3 minutos en ms
      bounceRate: 0.35,
      topTools: [
        { name: 'Generador de Títulos SEO', usage: 156 },
        { name: 'SEO Audit Tool', usage: 134 },
        { name: 'Keyword Research', usage: 98 }
      ],
      topPages: [
        { url: '/', views: 450 },
        { url: '/generar-titulo-seo', views: 234 },
        { url: '/seo-audit-tool', views: 189 }
      ],
      conversionRate: 0.05
    };
    
    return NextResponse.json(mockMetrics);
  } catch (error) {
    console.error('Analytics Metrics Error:', error);
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    );
  }
}
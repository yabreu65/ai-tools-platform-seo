import { NextRequest, NextResponse } from 'next/server';

interface TrackingSetupRequest {
  keywords: string[];
  domain: string;
  competitors?: string[];
  country?: string;
  language?: string;
  device?: 'desktop' | 'mobile' | 'both';
  frequency?: 'daily' | 'weekly' | 'monthly';
  alerts?: {
    enabled: boolean;
    positionChange?: number;
    visibilityChange?: number;
    newCompetitors?: boolean;
  };
}

interface KeywordTrackingData {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  bestPosition: number;
  worstPosition: number;
  avgPosition: number;
  url: string;
  searchVolume: number;
  difficulty: number;
  visibility: number;
  estimatedTraffic: number;
  competitorPositions: {
    domain: string;
    position: number;
    url: string;
  }[];
  serpFeatures: string[];
  lastUpdated: string;
  history: {
    date: string;
    position: number;
    visibility: number;
    traffic: number;
  }[];
}

interface TrackingProject {
  id: string;
  name: string;
  domain: string;
  keywords: KeywordTrackingData[];
  competitors: string[];
  settings: {
    country: string;
    language: string;
    device: string;
    frequency: string;
  };
  alerts: {
    enabled: boolean;
    positionChange?: number;
    visibilityChange?: number;
    newCompetitors?: boolean;
  };
  stats: {
    totalKeywords: number;
    avgPosition: number;
    totalVisibility: number;
    estimatedTraffic: number;
    improvingKeywords: number;
    decliningKeywords: number;
    topKeywords: number;
  };
  createdAt: string;
  lastUpdate: string;
}

// Simulación de base de datos de tracking
const trackingProjects: { [key: string]: TrackingProject } = {};

// Generar datos históricos de posición
function generatePositionHistory(keyword: string, days: number = 30): { date: string; position: number; visibility: number; traffic: number; }[] {
  const history = [];
  const basePosition = Math.floor(Math.random() * 50) + 1;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simular variación de posición con tendencia
    const trend = (Math.random() - 0.5) * 0.1; // Tendencia sutil
    const noise = (Math.random() - 0.5) * 5; // Ruido diario
    const position = Math.max(1, Math.min(100, Math.round(basePosition + trend * i + noise)));
    
    // Calcular visibilidad basada en posición
    const visibility = calculateVisibility(position);
    
    // Estimar tráfico basado en posición y volumen
    const searchVolume = Math.floor(Math.random() * 10000) + 1000;
    const ctr = getCTRByPosition(position);
    const traffic = Math.round(searchVolume * (ctr / 100));
    
    history.push({
      date: date.toISOString().split('T')[0],
      position,
      visibility,
      traffic
    });
  }
  
  return history;
}

// Calcular visibilidad basada en posición
function calculateVisibility(position: number): number {
  if (position <= 3) return 100;
  if (position <= 10) return Math.round(100 - (position - 1) * 8);
  if (position <= 20) return Math.round(30 - (position - 10) * 2);
  return Math.max(1, Math.round(10 - (position - 20) * 0.5));
}

// CTR estimado por posición
function getCTRByPosition(position: number): number {
  const ctrRates = [
    28.5, 15.7, 11.0, 8.0, 7.2, 5.1, 4.0, 3.2, 2.8, 2.5, // Posiciones 1-10
    2.2, 2.0, 1.8, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7    // Posiciones 11-20
  ];
  
  if (position <= 20) {
    return ctrRates[position - 1];
  }
  
  return Math.max(0.1, 0.7 - (position - 20) * 0.02);
}

// Generar posiciones de competidores
function generateCompetitorPositions(keyword: string, competitors: string[]): { domain: string; position: number; url: string; }[] {
  return competitors.map(domain => ({
    domain,
    position: Math.floor(Math.random() * 100) + 1,
    url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`
  }));
}

// Generar features SERP presentes
function generateSerpFeatures(keyword: string): string[] {
  const allFeatures = [
    'Featured Snippet', 'People Also Ask', 'Local Pack', 'Knowledge Panel',
    'Image Pack', 'Video Results', 'Shopping Results', 'News Results'
  ];
  
  const numFeatures = Math.floor(Math.random() * 4) + 1;
  return allFeatures.sort(() => Math.random() - 0.5).slice(0, numFeatures);
}

// Crear datos de tracking para una keyword
function createKeywordTrackingData(keyword: string, domain: string, competitors: string[]): KeywordTrackingData {
  const history = generatePositionHistory(keyword);
  const currentPosition = history[history.length - 1].position;
  const previousPosition = history.length > 1 ? history[history.length - 2].position : currentPosition;
  
  const positions = history.map(h => h.position);
  const bestPosition = Math.min(...positions);
  const worstPosition = Math.max(...positions);
  const avgPosition = Math.round(positions.reduce((sum, pos) => sum + pos, 0) / positions.length);
  
  const searchVolume = Math.floor(Math.random() * 20000) + 1000;
  const difficulty = Math.floor(Math.random() * 80) + 20;
  const visibility = calculateVisibility(currentPosition);
  const ctr = getCTRByPosition(currentPosition);
  const estimatedTraffic = Math.round(searchVolume * (ctr / 100));
  
  return {
    keyword,
    currentPosition,
    previousPosition,
    bestPosition,
    worstPosition,
    avgPosition,
    url: `https://${domain}/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
    searchVolume,
    difficulty,
    visibility,
    estimatedTraffic,
    competitorPositions: generateCompetitorPositions(keyword, competitors),
    serpFeatures: generateSerpFeatures(keyword),
    lastUpdated: new Date().toISOString(),
    history
  };
}

// Calcular estadísticas del proyecto
function calculateProjectStats(keywords: KeywordTrackingData[]) {
  const totalKeywords = keywords.length;
  const avgPosition = Math.round(
    keywords.reduce((sum, kw) => sum + kw.currentPosition, 0) / totalKeywords
  );
  
  const totalVisibility = Math.round(
    keywords.reduce((sum, kw) => sum + kw.visibility, 0) / totalKeywords
  );
  
  const estimatedTraffic = keywords.reduce((sum, kw) => sum + kw.estimatedTraffic, 0);
  
  const improvingKeywords = keywords.filter(kw => 
    kw.currentPosition < kw.previousPosition
  ).length;
  
  const decliningKeywords = keywords.filter(kw => 
    kw.currentPosition > kw.previousPosition
  ).length;
  
  const topKeywords = keywords.filter(kw => kw.currentPosition <= 10).length;
  
  return {
    totalKeywords,
    avgPosition,
    totalVisibility,
    estimatedTraffic,
    improvingKeywords,
    decliningKeywords,
    topKeywords
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingSetupRequest = await request.json();
    
    // Validaciones
    if (!body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword para hacer tracking' },
        { status: 400 }
      );
    }
    
    if (!body.domain || !body.domain.trim()) {
      return NextResponse.json(
        { error: 'Se requiere especificar el dominio a trackear' },
        { status: 400 }
      );
    }
    
    // Filtrar keywords vacías
    const validKeywords = body.keywords.filter(kw => kw.trim().length > 0);
    
    if (validKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword válida' },
        { status: 400 }
      );
    }
    
    // Limitar a 100 keywords por proyecto
    const keywordsToTrack = validKeywords.slice(0, 100);
    
    // Configuración por defecto
    const settings = {
      country: body.country || 'US',
      language: body.language || 'en',
      device: body.device || 'desktop',
      frequency: body.frequency || 'daily'
    };
    
    const alerts = {
      enabled: body.alerts?.enabled || false,
      positionChange: body.alerts?.positionChange || 5,
      visibilityChange: body.alerts?.visibilityChange || 20,
      newCompetitors: body.alerts?.newCompetitors || false
    };
    
    const competitors = body.competitors || [];
    
    // Crear datos de tracking para cada keyword
    const keywordTrackingData = keywordsToTrack.map(keyword => 
      createKeywordTrackingData(keyword, body.domain, competitors)
    );
    
    // Calcular estadísticas
    const stats = calculateProjectStats(keywordTrackingData);
    
    // Crear proyecto de tracking
    const projectId = `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project: TrackingProject = {
      id: projectId,
      name: `Tracking ${body.domain}`,
      domain: body.domain,
      keywords: keywordTrackingData,
      competitors,
      settings,
      alerts,
      stats,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
    
    // Guardar proyecto (simulación)
    trackingProjects[projectId] = project;
    
    // Generar insights y recomendaciones
    const insights = {
      topPerformingKeywords: keywordTrackingData
        .filter(kw => kw.currentPosition <= 10)
        .sort((a, b) => a.currentPosition - b.currentPosition)
        .slice(0, 5)
        .map(kw => ({
          keyword: kw.keyword,
          position: kw.currentPosition,
          traffic: kw.estimatedTraffic
        })),
      
      improvementOpportunities: keywordTrackingData
        .filter(kw => kw.currentPosition > 10 && kw.currentPosition <= 30)
        .sort((a, b) => b.searchVolume - a.searchVolume)
        .slice(0, 5)
        .map(kw => ({
          keyword: kw.keyword,
          position: kw.currentPosition,
          volume: kw.searchVolume,
          potentialTraffic: Math.round(kw.searchVolume * 0.15) // Estimación si llega a top 3
        })),
      
      competitorThreats: competitors.map(competitor => {
        const competitorKeywords = keywordTrackingData.filter(kw =>
          kw.competitorPositions.some(cp => cp.domain === competitor && cp.position <= 10)
        );
        
        return {
          domain: competitor,
          keywordsInTop10: competitorKeywords.length,
          avgPosition: competitorKeywords.length > 0 
            ? Math.round(
                competitorKeywords.reduce((sum, kw) => {
                  const pos = kw.competitorPositions.find(cp => cp.domain === competitor)?.position || 100;
                  return sum + pos;
                }, 0) / competitorKeywords.length
              )
            : 100
        };
      }).sort((a, b) => b.keywordsInTop10 - a.keywordsInTop10),
      
      recommendations: [
        stats.topKeywords < stats.totalKeywords * 0.2 
          ? 'Enfocar en mejorar keywords en posiciones 11-20'
          : 'Mantener posiciones top y expandir a nuevas keywords',
        
        stats.decliningKeywords > stats.improvingKeywords
          ? 'Revisar contenido de keywords en declive'
          : 'Continuar con la estrategia actual',
        
        competitors.length > 0
          ? 'Monitorear movimientos de competidores principales'
          : 'Considerar agregar competidores para análisis comparativo'
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: {
        project,
        insights,
        message: `Tracking configurado para ${keywordsToTrack.length} keywords en ${body.domain}`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error setting up tracking:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET endpoint para obtener datos de tracking existentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const domain = searchParams.get('domain');
    
    if (projectId) {
      const project = trackingProjects[projectId];
      if (!project) {
        return NextResponse.json(
          { error: 'Proyecto de tracking no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: project
      });
    }
    
    if (domain) {
      const domainProjects = Object.values(trackingProjects)
        .filter(project => project.domain === domain);
      
      return NextResponse.json({
        success: true,
        data: domainProjects
      });
    }
    
    // Retornar todos los proyectos
    return NextResponse.json({
      success: true,
      data: Object.values(trackingProjects)
    });
    
  } catch (error) {
    console.error('Error getting tracking data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

interface KeywordCompareRequest {
  domains: string[];
  keywords?: string[];
  includeShared: boolean;
  includeUnique: boolean;
  minSearchVolume: number;
  maxDifficulty: number;
  limit: number;
}

interface KeywordComparison {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competitorData: CompetitorKeywordData[];
  sharedBy: number;
  opportunity: 'high' | 'medium' | 'low';
  gap: boolean;
}

interface CompetitorKeywordData {
  domain: string;
  position: number;
  url: string;
  traffic: number;
  hasKeyword: boolean;
}

interface KeywordGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  missingFrom: string[];
  presentIn: string[];
  opportunity: 'high' | 'medium' | 'low';
}

// Simulación de datos de keywords
const simulateKeywordData = async (domains: string[], config: any): Promise<{
  sharedKeywords: KeywordComparison[];
  uniqueKeywords: KeywordComparison[];
  keywordGaps: KeywordGap[];
  summary: any;
}> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Keywords base simuladas
  const keywordPool = [
    'seo tools', 'keyword research', 'backlink analysis', 'competitor analysis', 'seo audit',
    'rank tracking', 'site audit', 'seo software', 'digital marketing', 'content optimization',
    'technical seo', 'local seo', 'mobile seo', 'voice search', 'seo reporting',
    'link building', 'on page seo', 'off page seo', 'seo strategy', 'seo consultant',
    'google analytics', 'search console', 'meta tags', 'schema markup', 'page speed',
    'core web vitals', 'seo checklist', 'keyword density', 'anchor text', 'internal linking',
    'seo best practices', 'seo tips', 'seo guide', 'seo tutorial', 'seo course',
    'organic traffic', 'serp features', 'featured snippets', 'local search', 'voice search optimization'
  ];

  const generateKeywordData = (keyword: string, domains: string[]): KeywordComparison => {
    const hash = keyword.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const searchVolume = Math.abs(hash % 50000) + 1000;
    const difficulty = Math.abs(hash % 80) + 10;
    const cpc = (Math.abs(hash % 500) + 50) / 100;

    const competitorData: CompetitorKeywordData[] = domains.map((domain, index) => {
      const domainHash = (hash + index * 1000) % 1000;
      const hasKeyword = Math.abs(domainHash) % 100 > 20; // 80% probabilidad
      
      return {
        domain: domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
        position: hasKeyword ? (Math.abs(domainHash % 20) + 1) : 0,
        url: hasKeyword ? `/${keyword.replace(/\s+/g, '-')}` : '',
        traffic: hasKeyword ? Math.abs(domainHash % 5000) + 100 : 0,
        hasKeyword
      };
    });

    const sharedBy = competitorData.filter(c => c.hasKeyword).length;
    
    let opportunity: 'high' | 'medium' | 'low' = 'medium';
    if (difficulty < 30 && searchVolume > 5000 && sharedBy < domains.length) {
      opportunity = 'high';
    } else if (difficulty > 60 || searchVolume < 1000) {
      opportunity = 'low';
    }

    const gap = sharedBy < domains.length && sharedBy > 0;

    return {
      keyword,
      searchVolume,
      difficulty,
      cpc,
      competitorData,
      sharedBy,
      opportunity,
      gap
    };
  };

  // Generar datos para todas las keywords
  const allKeywords = keywordPool.slice(0, Math.min(config.limit, keywordPool.length))
    .map(keyword => generateKeywordData(keyword, domains));

  // Filtrar por criterios
  const filteredKeywords = allKeywords.filter(kw => 
    kw.searchVolume >= config.minSearchVolume && 
    kw.difficulty <= config.maxDifficulty
  );

  // Separar keywords compartidas y únicas
  const sharedKeywords = filteredKeywords.filter(kw => 
    config.includeShared && kw.sharedBy >= 2
  );

  const uniqueKeywords = filteredKeywords.filter(kw => 
    config.includeUnique && kw.sharedBy === 1
  );

  // Generar gaps de keywords
  const keywordGaps: KeywordGap[] = filteredKeywords
    .filter(kw => kw.gap)
    .slice(0, 15)
    .map(kw => {
      const presentIn = kw.competitorData
        .filter(c => c.hasKeyword)
        .map(c => c.domain);
      
      const missingFrom = kw.competitorData
        .filter(c => !c.hasKeyword)
        .map(c => c.domain);

      return {
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        missingFrom,
        presentIn,
        opportunity: kw.opportunity
      };
    });

  // Calcular resumen
  const summary = {
    totalKeywords: filteredKeywords.length,
    sharedKeywords: sharedKeywords.length,
    uniqueKeywords: uniqueKeywords.length,
    keywordGaps: keywordGaps.length,
    avgSearchVolume: Math.round(
      filteredKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0) / filteredKeywords.length
    ),
    avgDifficulty: Math.round(
      filteredKeywords.reduce((sum, kw) => sum + kw.difficulty, 0) / filteredKeywords.length
    ),
    highOpportunities: filteredKeywords.filter(kw => kw.opportunity === 'high').length
  };

  return {
    sharedKeywords,
    uniqueKeywords,
    keywordGaps,
    summary
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: KeywordCompareRequest = await request.json();

    // Validaciones
    if (!body.domains || !Array.isArray(body.domains) || body.domains.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 dominios para comparar' },
        { status: 400 }
      );
    }

    if (body.domains.length > 5) {
      return NextResponse.json(
        { error: 'Máximo 5 dominios permitidos' },
        { status: 400 }
      );
    }

    // Configuración por defecto
    const config = {
      includeShared: body.includeShared !== false,
      includeUnique: body.includeUnique !== false,
      minSearchVolume: Math.max(body.minSearchVolume || 0, 0),
      maxDifficulty: Math.min(body.maxDifficulty || 100, 100),
      limit: Math.min(body.limit || 1000, 10000)
    };

    // Verificar límites del plan
    const userPlan = 'basic' as 'basic' | 'premium' | 'enterprise'; // Simplified for demo
    let maxKeywords = 1000;

    switch (userPlan) {
      case 'premium':
        maxKeywords = 5000;
        break;
      case 'enterprise':
        maxKeywords = 10000;
        break;
      default:
        maxKeywords = 1000;
    }

    config.limit = Math.min(config.limit, maxKeywords);

    // Validar dominios
    const validDomains = body.domains.filter(domain => {
      try {
        new URL(domain.startsWith('http') ? domain : `https://${domain}`);
        return true;
      } catch {
        return false;
      }
    });

    if (validDomains.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 dominios válidos' },
        { status: 400 }
      );
    }

    // Generar comparación de keywords
    const result = await simulateKeywordData(validDomains, config);

    // Generar ID para el reporte
    const reportId = `keyword_compare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      reportId,
      domains: validDomains,
      config,
      ...result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en comparación de keywords:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'ID de reporte requerido' },
        { status: 400 }
      );
    }

    // En una implementación real, obtener desde MongoDB
    const mockReport = {
      reportId,
      domains: ['example1.com', 'example2.com'],
      config: {
        includeShared: true,
        includeUnique: true,
        minSearchVolume: 100,
        maxDifficulty: 80,
        limit: 1000
      },
      summary: {
        totalKeywords: 856,
        sharedKeywords: 234,
        uniqueKeywords: 622,
        keywordGaps: 45,
        avgSearchVolume: 2340,
        avgDifficulty: 42,
        highOpportunities: 67
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockReport);

  } catch (error) {
    console.error('Error obteniendo reporte de keywords:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
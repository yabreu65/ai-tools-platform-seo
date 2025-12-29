import { NextRequest, NextResponse } from 'next/server';

interface BacklinkAnalyzeRequest {
  domains: string[];
  includeNewBacklinks: boolean;
  includeLostBacklinks: boolean;
  minDomainRating: number;
  linkTypes: ('dofollow' | 'nofollow')[];
  limit: number;
}

interface BacklinkData {
  id: string;
  sourceDomain: string;
  sourceUrl: string;
  targetDomain: string;
  targetUrl: string;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  domainRating: number;
  traffic: number;
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'lost' | 'new';
  linkStrength: 'high' | 'medium' | 'low';
}

interface BacklinkOpportunity {
  domain: string;
  domainRating: number;
  traffic: number;
  relevanceScore: number;
  linkingToCompetitors: string[];
  potentialAnchorTexts: string[];
  contactInfo?: {
    email?: string;
    social?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

interface BacklinkGap {
  sourceDomain: string;
  domainRating: number;
  linkingTo: string[];
  notLinkingTo: string[];
  opportunity: 'high' | 'medium' | 'low';
  anchorTexts: string[];
}

// Simulación de análisis de backlinks
const simulateBacklinkAnalysis = async (domains: string[], config: any) => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Dominios de referencia simulados
  const referenceDomains = [
    'techcrunch.com', 'mashable.com', 'searchengineland.com', 'moz.com', 'semrush.com',
    'ahrefs.com', 'hubspot.com', 'contentmarketinginstitute.com', 'searchenginejournal.com',
    'marketingland.com', 'socialmediaexaminer.com', 'copyblogger.com', 'neilpatel.com',
    'backlinko.com', 'quicksprout.com', 'kissmetrics.com', 'unbounce.com', 'wordstream.com',
    'distilled.net', 'brightedge.com', 'conductor.com', 'searchmetrics.com', 'raven.com',
    'majestic.com', 'linkresearchtools.com', 'cognitiveseo.com', 'monitor-backlinks.com'
  ];

  const anchorTextTemplates = [
    'seo tools', 'best seo software', 'keyword research tool', 'backlink checker',
    'competitor analysis', 'seo audit tool', 'rank tracker', 'site audit',
    'digital marketing tools', 'seo platform', 'marketing software', 'analytics tool'
  ];

  // Generar backlinks para cada dominio
  const domainBacklinks: { [domain: string]: BacklinkData[] } = {};
  
  domains.forEach(domain => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const domainHash = cleanDomain.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const backlinks: BacklinkData[] = [];
    const backlinkCount = Math.min(Math.abs(domainHash % 50) + 20, config.limit);

    for (let i = 0; i < backlinkCount; i++) {
      const sourceIndex = (Math.abs(domainHash + i * 100) % referenceDomains.length);
      const sourceDomain = referenceDomains[sourceIndex];
      const anchorIndex = (Math.abs(domainHash + i * 50) % anchorTextTemplates.length);
      
      const domainRating = Math.abs((domainHash + i * 200) % 40) + 40; // 40-80
      
      if (domainRating < config.minDomainRating) continue;

      const linkType = Math.random() > 0.2 ? 'dofollow' : 'nofollow';
      if (!config.linkTypes.includes(linkType)) continue;

      const daysAgo = Math.abs((domainHash + i * 30) % 365);
      const firstSeen = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const lastSeen = new Date(firstSeen.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

      let status: 'active' | 'lost' | 'new' = 'active';
      if (daysAgo < 7) status = 'new';
      else if (Math.random() < 0.1) status = 'lost';

      let linkStrength: 'high' | 'medium' | 'low' = 'medium';
      if (domainRating > 70 && linkType === 'dofollow') linkStrength = 'high';
      else if (domainRating < 50 || linkType === 'nofollow') linkStrength = 'low';

      backlinks.push({
        id: `backlink_${i}_${cleanDomain}`,
        sourceDomain,
        sourceUrl: `https://${sourceDomain}/article-${i}`,
        targetDomain: cleanDomain,
        targetUrl: `https://${cleanDomain}/page-${i}`,
        anchorText: anchorTextTemplates[anchorIndex],
        linkType,
        domainRating,
        traffic: Math.abs((domainHash + i * 150) % 10000) + 500,
        firstSeen: firstSeen.toISOString(),
        lastSeen: lastSeen.toISOString(),
        status,
        linkStrength
      });
    }

    domainBacklinks[cleanDomain] = backlinks;
  });

  // Identificar oportunidades de backlinks
  const opportunities: BacklinkOpportunity[] = [];
  const usedDomains = new Set();

  // Encontrar dominios que enlazan a competidores pero no a todos
  referenceDomains.slice(0, 15).forEach((refDomain, index) => {
    if (usedDomains.has(refDomain)) return;
    
    const linkingTo = domains.filter(() => Math.random() > 0.4)
      .map(d => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]);
    
    if (linkingTo.length > 0 && linkingTo.length < domains.length) {
      const domainRating = Math.abs(index * 123 % 40) + 50;
      const relevanceScore = Math.abs(index * 456 % 40) + 60;
      
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      if (domainRating < 60 && relevanceScore > 80) difficulty = 'easy';
      else if (domainRating > 75 || relevanceScore < 70) difficulty = 'hard';

      opportunities.push({
        domain: refDomain,
        domainRating,
        traffic: Math.abs(index * 789 % 50000) + 10000,
        relevanceScore,
        linkingToCompetitors: linkingTo,
        potentialAnchorTexts: anchorTextTemplates.slice(0, 3),
        contactInfo: {
          email: `contact@${refDomain}`,
          social: [`https://twitter.com/${refDomain.split('.')[0]}`]
        },
        difficulty
      });

      usedDomains.add(refDomain);
    }
  });

  // Identificar gaps de backlinks
  const backlinkGaps: BacklinkGap[] = [];
  
  referenceDomains.slice(0, 10).forEach((refDomain, index) => {
    const linkingTo = domains.filter(() => Math.random() > 0.3)
      .map(d => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]);
    
    const notLinkingTo = domains
      .map(d => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0])
      .filter(d => !linkingTo.includes(d));

    if (linkingTo.length > 0 && notLinkingTo.length > 0) {
      const domainRating = Math.abs(index * 234 % 40) + 45;
      
      let opportunity: 'high' | 'medium' | 'low' = 'medium';
      if (domainRating > 65 && notLinkingTo.length === 1) opportunity = 'high';
      else if (domainRating < 55 || notLinkingTo.length > 2) opportunity = 'low';

      backlinkGaps.push({
        sourceDomain: refDomain,
        domainRating,
        linkingTo,
        notLinkingTo,
        opportunity,
        anchorTexts: anchorTextTemplates.slice(0, 2)
      });
    }
  });

  // Calcular métricas de resumen
  const allBacklinks = Object.values(domainBacklinks).flat();
  const summary = {
    totalBacklinks: allBacklinks.length,
    uniqueDomains: new Set(allBacklinks.map(b => b.sourceDomain)).size,
    dofollowLinks: allBacklinks.filter(b => b.linkType === 'dofollow').length,
    nofollowLinks: allBacklinks.filter(b => b.linkType === 'nofollow').length,
    newBacklinks: allBacklinks.filter(b => b.status === 'new').length,
    lostBacklinks: allBacklinks.filter(b => b.status === 'lost').length,
    avgDomainRating: Math.round(
      allBacklinks.reduce((sum, b) => sum + b.domainRating, 0) / allBacklinks.length
    ),
    highStrengthLinks: allBacklinks.filter(b => b.linkStrength === 'high').length,
    opportunities: opportunities.length,
    backlinkGaps: backlinkGaps.length
  };

  return {
    domainBacklinks,
    opportunities,
    backlinkGaps,
    summary
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: BacklinkAnalyzeRequest = await request.json();

    // Validaciones
    if (!body.domains || !Array.isArray(body.domains) || body.domains.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un dominio' },
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
      includeNewBacklinks: body.includeNewBacklinks !== false,
      includeLostBacklinks: body.includeLostBacklinks !== false,
      minDomainRating: Math.max(body.minDomainRating || 0, 0),
      linkTypes: body.linkTypes || ['dofollow', 'nofollow'],
      limit: Math.min(body.limit || 1000, 5000)
    };

    // Verificar límites del plan (simplified for demo)
    const maxBacklinks = 1000;

    config.limit = Math.min(config.limit, maxBacklinks);

    // Validar dominios
    const validDomains = body.domains.filter(domain => {
      try {
        new URL(domain.startsWith('http') ? domain : `https://${domain}`);
        return true;
      } catch {
        return false;
      }
    });

    if (validDomains.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron dominios válidos' },
        { status: 400 }
      );
    }

    // Realizar análisis de backlinks
    const result = await simulateBacklinkAnalysis(validDomains, config);

    // Generar ID para el análisis
    const analysisId = `backlink_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      analysisId,
      domains: validDomains,
      config,
      ...result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en análisis de backlinks:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    // En una implementación real, obtener desde MongoDB
    const mockAnalysis = {
      analysisId,
      domains: ['example.com'],
      summary: {
        totalBacklinks: 1247,
        uniqueDomains: 456,
        dofollowLinks: 987,
        nofollowLinks: 260,
        newBacklinks: 23,
        lostBacklinks: 8,
        avgDomainRating: 58,
        highStrengthLinks: 234,
        opportunities: 45,
        backlinkGaps: 12
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockAnalysis);

  } catch (error) {
    console.error('Error obteniendo análisis de backlinks:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
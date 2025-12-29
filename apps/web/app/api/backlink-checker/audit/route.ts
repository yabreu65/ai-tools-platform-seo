import { NextRequest, NextResponse } from 'next/server';

interface ToxicAuditRequest {
  domain: string;
  toxicThreshold?: number;
  includeSubdomains?: boolean;
  checkDepth?: 'surface' | 'deep' | 'comprehensive';
}

interface ToxicBacklink {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  toxicScore: number;
  riskFactors: {
    spamScore: number;
    lowQualityContent: boolean;
    suspiciousPattern: boolean;
    penalizedDomain: boolean;
    artificialLinks: boolean;
    irrelevantContent: boolean;
    lowDomainAuthority: boolean;
    excessiveOutboundLinks: boolean;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  firstDetected: string;
  lastChecked: string;
  domainAuthority: number;
  pageAuthority: number;
  linkType: 'dofollow' | 'nofollow';
  linkPosition: string;
  sourceLanguage: string;
  sourceCountry: string;
}

interface ToxicDomain {
  domain: string;
  toxicScore: number;
  backlinksCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  firstDetected: string;
  domainAuthority: number;
  recommendation: 'monitor' | 'disavow' | 'contact_webmaster' | 'immediate_action';
}

interface AuditMetrics {
  totalBacklinksAnalyzed: number;
  toxicBacklinksFound: number;
  toxicDomainsFound: number;
  overallToxicScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  severityBreakdown: {
    dofollow_toxic: number;
    nofollow_toxic: number;
    high_authority_toxic: number;
    low_authority_toxic: number;
  };
}

interface ToxicAuditResponse {
  success: boolean;
  data: {
    domain: string;
    auditId: string;
    auditDate: string;
    metrics: AuditMetrics;
    toxicBacklinks: ToxicBacklink[];
    toxicDomains: ToxicDomain[];
    recommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    disavowSuggestions: {
      domains: string[];
      urls: string[];
    };
    trendData: {
      date: string;
      toxicScore: number;
      newToxicLinks: number;
      resolvedIssues: number;
    }[];
  };
  message?: string;
}

// Generador de factores de riesgo
const generateRiskFactors = (toxicScore: number) => {
  const baseRisk = toxicScore / 100;
  
  return {
    spamScore: Math.min(100, toxicScore + Math.random() * 20),
    lowQualityContent: baseRisk > 0.6 && Math.random() > 0.3,
    suspiciousPattern: baseRisk > 0.7 && Math.random() > 0.4,
    penalizedDomain: baseRisk > 0.8 && Math.random() > 0.7,
    artificialLinks: baseRisk > 0.5 && Math.random() > 0.5,
    irrelevantContent: baseRisk > 0.4 && Math.random() > 0.4,
    lowDomainAuthority: baseRisk > 0.3,
    excessiveOutboundLinks: baseRisk > 0.6 && Math.random() > 0.6
  };
};

// Generador de recomendaciones
const generateRecommendation = (toxicScore: number, riskFactors: any): string => {
  if (toxicScore >= 80) {
    return 'Disavow immediately - High risk of penalty';
  } else if (toxicScore >= 60) {
    return 'Consider disavowing - Monitor closely';
  } else if (toxicScore >= 40) {
    return 'Monitor and evaluate - May need action';
  } else {
    return 'Low risk - Continue monitoring';
  }
};

// Generador de datos de backlinks tóxicos
const generateToxicBacklinks = (domain: string, count: number): ToxicBacklink[] => {
  const spamDomains = [
    'spam-links.net', 'low-quality-directory.com', 'link-farm-site.org',
    'suspicious-domain.info', 'penalty-risk.biz', 'artificial-links.co',
    'poor-content.net', 'sketchy-site.org', 'link-scheme.com',
    'questionable-source.info', 'spam-network.biz', 'fake-authority.net'
  ];

  const toxicAnchorTexts = [
    'cheap viagra', 'casino online', 'payday loans', 'click here',
    'buy now', 'free download', 'make money fast', 'weight loss',
    'adult content', 'gambling site', 'pharmacy online', 'loan approval'
  ];

  return Array.from({ length: count }, (_, i) => {
    const sourceDomain = spamDomains[Math.floor(Math.random() * spamDomains.length)];
    const toxicScore = Math.random() * 60 + 40; // 40-100 para enlaces tóxicos
    const riskFactors = generateRiskFactors(toxicScore);
    
    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (toxicScore >= 80) severity = 'critical';
    else if (toxicScore >= 65) severity = 'high';
    else if (toxicScore >= 50) severity = 'medium';
    else severity = 'low';

    return {
      id: `toxic_${i + 1}`,
      sourceUrl: `https://${sourceDomain}/page-${i + 1}`,
      sourceDomain,
      targetUrl: `https://${domain}${Math.random() > 0.5 ? '/page-' + (i + 1) : ''}`,
      anchorText: Math.random() > 0.3 ? 
        toxicAnchorTexts[Math.floor(Math.random() * toxicAnchorTexts.length)] :
        domain.replace('.com', ''),
      toxicScore: Math.round(toxicScore),
      riskFactors,
      severity,
      recommendation: generateRecommendation(toxicScore, riskFactors),
      firstDetected: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastChecked: new Date().toISOString(),
      domainAuthority: Math.max(1, Math.floor(Math.random() * 30)), // Baja autoridad para sitios tóxicos
      pageAuthority: Math.max(1, Math.floor(Math.random() * 25)),
      linkType: Math.random() > 0.7 ? 'nofollow' : 'dofollow',
      linkPosition: ['content', 'footer', 'sidebar'][Math.floor(Math.random() * 3)],
      sourceLanguage: 'en',
      sourceCountry: ['US', 'RU', 'CN', 'IN', 'BR'][Math.floor(Math.random() * 5)]
    };
  });
};

// Generador de dominios tóxicos
const generateToxicDomains = (toxicBacklinks: ToxicBacklink[]): ToxicDomain[] => {
  const domainMap = new Map<string, ToxicBacklink[]>();
  
  toxicBacklinks.forEach(backlink => {
    const current = domainMap.get(backlink.sourceDomain) || [];
    domainMap.set(backlink.sourceDomain, [...current, backlink]);
  });

  return Array.from(domainMap.entries()).map(([domain, backlinks]) => {
    const avgToxicScore = backlinks.reduce((sum, bl) => sum + bl.toxicScore, 0) / backlinks.length;
    const maxSeverity = backlinks.reduce((max, bl) => {
      const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityOrder[bl.severity] > severityOrder[max] ? bl.severity : max;
    }, 'low' as 'low' | 'medium' | 'high' | 'critical');

    const reasons = [];
    if (backlinks.some(bl => bl.riskFactors.spamScore > 70)) reasons.push('High spam score');
    if (backlinks.some(bl => bl.riskFactors.penalizedDomain)) reasons.push('Previously penalized');
    if (backlinks.some(bl => bl.riskFactors.artificialLinks)) reasons.push('Artificial link patterns');
    if (backlinks.some(bl => bl.riskFactors.lowQualityContent)) reasons.push('Low quality content');
    if (backlinks.length > 5) reasons.push('Excessive linking');

    let recommendation: 'monitor' | 'disavow' | 'contact_webmaster' | 'immediate_action';
    if (avgToxicScore >= 80) recommendation = 'immediate_action';
    else if (avgToxicScore >= 65) recommendation = 'disavow';
    else if (avgToxicScore >= 50) recommendation = 'contact_webmaster';
    else recommendation = 'monitor';

    return {
      domain,
      toxicScore: Math.round(avgToxicScore),
      backlinksCount: backlinks.length,
      riskLevel: maxSeverity as 'low' | 'medium' | 'high' | 'critical',
      reasons,
      firstDetected: Math.min(...backlinks.map(bl => new Date(bl.firstDetected).getTime())).toString(),
      domainAuthority: Math.round(backlinks.reduce((sum, bl) => sum + bl.domainAuthority, 0) / backlinks.length),
      recommendation
    };
  }).sort((a, b) => b.toxicScore - a.toxicScore);
};

// Generador de datos de tendencia
const generateTrendData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      toxicScore: Math.floor(Math.random() * 30) + 20, // 20-50 score tóxico
      newToxicLinks: Math.floor(Math.random() * 5),
      resolvedIssues: Math.floor(Math.random() * 3)
    });
  }
  
  return data;
};

export async function POST(request: NextRequest) {
  try {
    const body: ToxicAuditRequest = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required' },
        { status: 400 }
      );
    }

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));

    const toxicThreshold = body.toxicThreshold || 50;
    const toxicBacklinks = generateToxicBacklinks(body.domain, Math.floor(Math.random() * 50) + 20);
    const toxicDomains = generateToxicDomains(toxicBacklinks);
    
    // Calcular métricas
    const totalBacklinksAnalyzed = Math.floor(Math.random() * 1000) + 500;
    const toxicBacklinksFound = toxicBacklinks.length;
    const toxicDomainsFound = toxicDomains.length;
    const overallToxicScore = Math.round(
      toxicBacklinks.reduce((sum, bl) => sum + bl.toxicScore, 0) / toxicBacklinks.length
    );
    
    const riskDistribution = {
      low: toxicBacklinks.filter(bl => bl.severity === 'low').length,
      medium: toxicBacklinks.filter(bl => bl.severity === 'medium').length,
      high: toxicBacklinks.filter(bl => bl.severity === 'high').length,
      critical: toxicBacklinks.filter(bl => bl.severity === 'critical').length
    };
    
    const severityBreakdown = {
      dofollow_toxic: toxicBacklinks.filter(bl => bl.linkType === 'dofollow').length,
      nofollow_toxic: toxicBacklinks.filter(bl => bl.linkType === 'nofollow').length,
      high_authority_toxic: toxicBacklinks.filter(bl => bl.domainAuthority >= 50).length,
      low_authority_toxic: toxicBacklinks.filter(bl => bl.domainAuthority < 50).length
    };

    // Generar recomendaciones
    const recommendations = {
      immediate: [
        `Disavow ${toxicDomains.filter(d => d.recommendation === 'immediate_action').length} critical domains immediately`,
        `Review and remove ${riskDistribution.critical} critical toxic backlinks`,
        'Submit updated disavow file to Google Search Console'
      ],
      shortTerm: [
        `Contact webmasters of ${toxicDomains.filter(d => d.recommendation === 'contact_webmaster').length} domains for link removal`,
        'Monitor toxic score trends weekly',
        'Implement link building quality guidelines'
      ],
      longTerm: [
        'Develop a proactive link monitoring strategy',
        'Create content that attracts high-quality backlinks',
        'Regular monthly toxic link audits'
      ]
    };

    // Sugerencias para disavow
    const disavowSuggestions = {
      domains: toxicDomains
        .filter(d => d.recommendation === 'disavow' || d.recommendation === 'immediate_action')
        .map(d => d.domain),
      urls: toxicBacklinks
        .filter(bl => bl.severity === 'critical')
        .map(bl => bl.sourceUrl)
    };

    const response: ToxicAuditResponse = {
      success: true,
      data: {
        domain: body.domain,
        auditId: `audit_${Date.now()}`,
        auditDate: new Date().toISOString(),
        metrics: {
          totalBacklinksAnalyzed,
          toxicBacklinksFound,
          toxicDomainsFound,
          overallToxicScore,
          riskDistribution,
          severityBreakdown
        },
        toxicBacklinks,
        toxicDomains,
        recommendations,
        disavowSuggestions,
        trendData: generateTrendData()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in toxic audit:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
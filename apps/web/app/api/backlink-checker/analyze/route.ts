import { NextRequest, NextResponse } from 'next/server';

interface BacklinkAnalysisRequest {
  domain: string;
  includeSubdomains?: boolean;
  maxBacklinks?: number;
  includeNofollow?: boolean;
  dataFreshness?: 'live' | 'fresh' | 'cached';
}

interface BacklinkData {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  linkPosition: 'header' | 'content' | 'footer' | 'sidebar';
  domainAuthority: number;
  pageAuthority: number;
  trustFlow: number;
  citationFlow: number;
  toxicScore: number;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean;
  linkContext: string;
  sourceLanguage: string;
  sourceCountry: string;
}

interface DomainMetrics {
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  pageAuthority: number;
  trustFlow: number;
  citationFlow: number;
  toxicScore: number;
  organicKeywords: number;
  organicTraffic: number;
  paidKeywords: number;
  paidTraffic: number;
}

interface AnchorTextData {
  text: string;
  count: number;
  percentage: number;
  type: 'exact' | 'partial' | 'branded' | 'generic' | 'naked_url' | 'image';
}

interface ReferringDomainData {
  domain: string;
  backlinks: number;
  domainAuthority: number;
  trustFlow: number;
  toxicScore: number;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean;
  country: string;
  language: string;
}

interface BacklinkAnalysisResponse {
  success: boolean;
  data: {
    domain: string;
    analysisId: string;
    metrics: DomainMetrics;
    backlinks: BacklinkData[];
    anchorTextDistribution: AnchorTextData[];
    topReferringDomains: ReferringDomainData[];
    linkTypes: {
      dofollow: number;
      nofollow: number;
    };
    linkPositions: {
      header: number;
      content: number;
      footer: number;
      sidebar: number;
    };
    qualityDistribution: {
      high: number;
      medium: number;
      low: number;
      toxic: number;
    };
    trendData: {
      date: string;
      newBacklinks: number;
      lostBacklinks: number;
      totalBacklinks: number;
    }[];
    competitorComparison?: {
      competitor: string;
      metrics: DomainMetrics;
    }[];
  };
  message?: string;
}

// Simulador de datos de backlinks
const generateBacklinkData = (domain: string, count: number): BacklinkData[] => {
  const sampleDomains = [
    'techcrunch.com', 'mashable.com', 'wired.com', 'theverge.com', 'engadget.com',
    'ars-technica.com', 'zdnet.com', 'cnet.com', 'digitaltrends.com', 'gizmodo.com',
    'blog.example.com', 'news.startup.com', 'industry-magazine.com', 'tech-review.net',
    'innovation-hub.org', 'startup-news.io', 'business-insider.com', 'forbes.com'
  ];

  const anchorTexts = [
    domain.replace('.com', ''),
    `Visit ${domain}`,
    'Click here',
    'Learn more',
    'Best solution',
    'Top platform',
    'Read article',
    domain,
    'Homepage',
    'Official website'
  ];

  const linkContexts = [
    'This innovative platform offers comprehensive solutions for modern businesses.',
    'According to recent studies, this tool has proven to be highly effective.',
    'Many industry experts recommend this service for its reliability.',
    'The platform has received positive reviews from users worldwide.',
    'This solution stands out among competitors for its unique features.'
  ];

  return Array.from({ length: count }, (_, i) => {
    const sourceDomain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];
    const domainAuthority = Math.floor(Math.random() * 100) + 1;
    const toxicScore = Math.random() * 100;
    
    return {
      id: `bl_${i + 1}`,
      sourceUrl: `https://${sourceDomain}/article-${i + 1}`,
      sourceDomain,
      targetUrl: `https://${domain}${i % 3 === 0 ? '/blog/post-' + (i + 1) : ''}`,
      anchorText: anchorTexts[Math.floor(Math.random() * anchorTexts.length)],
      linkType: Math.random() > 0.2 ? 'dofollow' : 'nofollow',
      linkPosition: ['content', 'header', 'footer', 'sidebar'][Math.floor(Math.random() * 4)] as any,
      domainAuthority,
      pageAuthority: Math.max(1, domainAuthority - Math.floor(Math.random() * 20)),
      trustFlow: Math.floor(Math.random() * 100),
      citationFlow: Math.floor(Math.random() * 100),
      toxicScore,
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: Math.random() > 0.1,
      linkContext: linkContexts[Math.floor(Math.random() * linkContexts.length)],
      sourceLanguage: 'en',
      sourceCountry: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'][Math.floor(Math.random() * 6)]
    };
  });
};

const generateAnchorTextDistribution = (backlinks: BacklinkData[]): AnchorTextData[] => {
  const anchorTextMap = new Map<string, number>();
  
  backlinks.forEach(backlink => {
    const current = anchorTextMap.get(backlink.anchorText) || 0;
    anchorTextMap.set(backlink.anchorText, current + 1);
  });

  const total = backlinks.length;
  return Array.from(anchorTextMap.entries())
    .map(([text, count]) => ({
      text,
      count,
      percentage: (count / total) * 100,
      type: (text.includes('http') ? 'naked_url' : 
            text.toLowerCase().includes('click') ? 'generic' :
            text.includes('.com') ? 'branded' : 'partial') as 'exact' | 'partial' | 'branded' | 'generic' | 'naked_url' | 'image'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};

const generateReferringDomains = (backlinks: BacklinkData[]): ReferringDomainData[] => {
  const domainMap = new Map<string, BacklinkData[]>();
  
  backlinks.forEach(backlink => {
    const current = domainMap.get(backlink.sourceDomain) || [];
    domainMap.set(backlink.sourceDomain, [...current, backlink]);
  });

  return Array.from(domainMap.entries())
    .map(([domain, domainBacklinks]) => {
      const avgDA = domainBacklinks.reduce((sum, bl) => sum + bl.domainAuthority, 0) / domainBacklinks.length;
      const avgToxic = domainBacklinks.reduce((sum, bl) => sum + bl.toxicScore, 0) / domainBacklinks.length;
      
      return {
        domain,
        backlinks: domainBacklinks.length,
        domainAuthority: Math.round(avgDA),
        trustFlow: Math.floor(Math.random() * 100),
        toxicScore: Math.round(avgToxic),
        firstSeen: Math.min(...domainBacklinks.map(bl => new Date(bl.firstSeen).getTime())).toString(),
        lastSeen: Math.max(...domainBacklinks.map(bl => new Date(bl.lastSeen).getTime())).toString(),
        isActive: domainBacklinks.some(bl => bl.isActive),
        country: domainBacklinks[0].sourceCountry,
        language: domainBacklinks[0].sourceLanguage
      };
    })
    .sort((a, b) => b.backlinks - a.backlinks)
    .slice(0, 50);
};

const generateTrendData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      newBacklinks: Math.floor(Math.random() * 20) + 1,
      lostBacklinks: Math.floor(Math.random() * 10),
      totalBacklinks: 1500 + Math.floor(Math.random() * 200) - 100
    });
  }
  
  return data;
};

export async function POST(request: NextRequest) {
  try {
    const body: BacklinkAnalysisRequest = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required' },
        { status: 400 }
      );
    }

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const maxBacklinks = body.maxBacklinks || 1000;
    const backlinks = generateBacklinkData(body.domain, Math.min(maxBacklinks, 500));
    const anchorTextDistribution = generateAnchorTextDistribution(backlinks);
    const topReferringDomains = generateReferringDomains(backlinks);
    
    // Calcular métricas
    const totalBacklinks = backlinks.length;
    const referringDomains = new Set(backlinks.map(bl => bl.sourceDomain)).size;
    const avgDA = backlinks.reduce((sum, bl) => sum + bl.domainAuthority, 0) / backlinks.length;
    const avgToxic = backlinks.reduce((sum, bl) => sum + bl.toxicScore, 0) / backlinks.length;
    
    const linkTypes = {
      dofollow: backlinks.filter(bl => bl.linkType === 'dofollow').length,
      nofollow: backlinks.filter(bl => bl.linkType === 'nofollow').length
    };
    
    const linkPositions = {
      header: backlinks.filter(bl => bl.linkPosition === 'header').length,
      content: backlinks.filter(bl => bl.linkPosition === 'content').length,
      footer: backlinks.filter(bl => bl.linkPosition === 'footer').length,
      sidebar: backlinks.filter(bl => bl.linkPosition === 'sidebar').length
    };
    
    const qualityDistribution = {
      high: backlinks.filter(bl => bl.domainAuthority >= 70 && bl.toxicScore < 30).length,
      medium: backlinks.filter(bl => bl.domainAuthority >= 40 && bl.domainAuthority < 70 && bl.toxicScore < 50).length,
      low: backlinks.filter(bl => bl.domainAuthority < 40 && bl.toxicScore < 70).length,
      toxic: backlinks.filter(bl => bl.toxicScore >= 70).length
    };

    const response: BacklinkAnalysisResponse = {
      success: true,
      data: {
        domain: body.domain,
        analysisId: `analysis_${Date.now()}`,
        metrics: {
          totalBacklinks,
          referringDomains,
          domainAuthority: Math.round(avgDA),
          pageAuthority: Math.round(avgDA - 5),
          trustFlow: Math.floor(Math.random() * 100),
          citationFlow: Math.floor(Math.random() * 100),
          toxicScore: Math.round(avgToxic),
          organicKeywords: Math.floor(Math.random() * 10000) + 1000,
          organicTraffic: Math.floor(Math.random() * 100000) + 10000,
          paidKeywords: Math.floor(Math.random() * 1000),
          paidTraffic: Math.floor(Math.random() * 10000)
        },
        backlinks,
        anchorTextDistribution,
        topReferringDomains,
        linkTypes,
        linkPositions,
        qualityDistribution,
        trendData: generateTrendData(),
        competitorComparison: [
          {
            competitor: 'competitor1.com',
            metrics: {
              totalBacklinks: Math.floor(Math.random() * 2000) + 500,
              referringDomains: Math.floor(Math.random() * 500) + 100,
              domainAuthority: Math.floor(Math.random() * 100) + 1,
              pageAuthority: Math.floor(Math.random() * 100) + 1,
              trustFlow: Math.floor(Math.random() * 100),
              citationFlow: Math.floor(Math.random() * 100),
              toxicScore: Math.floor(Math.random() * 100),
              organicKeywords: Math.floor(Math.random() * 15000) + 2000,
              organicTraffic: Math.floor(Math.random() * 150000) + 20000,
              paidKeywords: Math.floor(Math.random() * 1500),
              paidTraffic: Math.floor(Math.random() * 15000)
            }
          }
        ]
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in backlink analysis:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
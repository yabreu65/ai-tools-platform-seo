import { NextRequest, NextResponse } from 'next/server';

interface OpportunitiesRequest {
  domain: string;
  competitors?: string[];
  industry?: string;
  targetCountries?: string[];
  minDomainAuthority?: number;
  maxDifficulty?: number;
  opportunityTypes?: ('guest_posting' | 'resource_pages' | 'broken_links' | 'competitor_gaps' | 'directory_listings' | 'partnerships')[];
}

interface LinkOpportunity {
  id: string;
  type: 'guest_posting' | 'resource_pages' | 'broken_links' | 'competitor_gaps' | 'directory_listings' | 'partnerships';
  targetDomain: string;
  targetUrl: string;
  pageTitle: string;
  domainAuthority: number;
  pageAuthority: number;
  trustFlow: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyScore: number;
  estimatedValue: number;
  contactInfo: {
    email?: string;
    contactForm?: string;
    socialMedia?: {
      twitter?: string;
      linkedin?: string;
    };
  };
  requirements: string[];
  suggestedApproach: string;
  competitorPresence: {
    hasCompetitorLinks: boolean;
    competitorCount: number;
    competitors: string[];
  };
  contentSuggestions: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedTimeframe: string;
  successProbability: number;
  lastUpdated: string;
  notes?: string;
}

interface OpportunityMetrics {
  totalOpportunities: number;
  highPriorityCount: number;
  easyAccessCount: number;
  averageDomainAuthority: number;
  averageDifficulty: number;
  typeDistribution: {
    guest_posting: number;
    resource_pages: number;
    broken_links: number;
    competitor_gaps: number;
    directory_listings: number;
    partnerships: number;
  };
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface OpportunitiesResponse {
  success: boolean;
  data: {
    domain: string;
    searchId: string;
    searchDate: string;
    metrics: OpportunityMetrics;
    opportunities: LinkOpportunity[];
    competitorAnalysis: {
      competitor: string;
      uniqueOpportunities: number;
      sharedOpportunities: number;
      averageDA: number;
    }[];
    recommendations: {
      quickWins: LinkOpportunity[];
      longTermTargets: LinkOpportunity[];
      competitorGaps: LinkOpportunity[];
    };
  };
  message?: string;
}

// Generador de oportunidades de link building
const generateOpportunities = (domain: string, competitors: string[], count: number): LinkOpportunity[] => {
  const opportunityTypes: LinkOpportunity['type'][] = [
    'guest_posting', 'resource_pages', 'broken_links', 'competitor_gaps', 'directory_listings', 'partnerships'
  ];

  const targetDomains = [
    'industry-blog.com', 'tech-magazine.net', 'business-directory.org', 'startup-resources.io',
    'innovation-hub.com', 'entrepreneur-guide.net', 'industry-news.org', 'professional-network.com',
    'resource-center.net', 'expert-insights.com', 'business-tools.org', 'industry-leaders.net',
    'knowledge-base.com', 'best-practices.org', 'solution-finder.net', 'market-research.com'
  ];

  const pageTitles = {
    guest_posting: [
      'Guest Author Guidelines', 'Write for Us', 'Contributor Program', 'Expert Insights Wanted',
      'Industry Expert Submissions', 'Thought Leadership Articles'
    ],
    resource_pages: [
      'Best Tools for Business', 'Industry Resources', 'Recommended Solutions', 'Top Platforms',
      'Essential Business Tools', 'Curated Resource List'
    ],
    broken_links: [
      'Industry Links Directory', 'Useful Resources', 'Partner Links', 'Recommended Sites',
      'External Resources', 'Reference Links'
    ],
    competitor_gaps: [
      'Industry Analysis', 'Market Leaders', 'Top Companies', 'Solution Providers',
      'Industry Directory', 'Featured Partners'
    ],
    directory_listings: [
      'Business Directory', 'Industry Listings', 'Company Profiles', 'Service Providers',
      'Professional Directory', 'Vendor Listings'
    ],
    partnerships: [
      'Partnership Opportunities', 'Strategic Alliances', 'Collaboration Program', 'Partner Network',
      'Business Partnerships', 'Integration Partners'
    ]
  };

  const requirements = {
    guest_posting: [
      'Original content (1500+ words)', 'Industry expertise required', 'Author bio included',
      'No promotional content', 'High-quality images', 'Editorial review process'
    ],
    resource_pages: [
      'Relevant to target audience', 'High-quality tool/service', 'Active and maintained',
      'Good user reviews', 'Professional website', 'Clear value proposition'
    ],
    broken_links: [
      'Replacement content available', 'Similar topic/theme', 'High-quality resource',
      'Working and accessible', 'Relevant to context', 'Better than original'
    ],
    competitor_gaps: [
      'Industry relevance', 'Competitive advantage', 'Unique value proposition',
      'Professional presentation', 'Strong brand presence', 'Market credibility'
    ],
    directory_listings: [
      'Business verification', 'Complete profile information', 'Professional description',
      'Contact information', 'Category relevance', 'Quality standards met'
    ],
    partnerships: [
      'Complementary services', 'Mutual benefit potential', 'Professional reputation',
      'Similar target audience', 'Strategic alignment', 'Long-term commitment'
    ]
  };

  const approaches = {
    guest_posting: [
      'Pitch unique industry insights', 'Offer case study content', 'Propose trending topic analysis',
      'Share expert predictions', 'Provide actionable tips', 'Offer exclusive research data'
    ],
    resource_pages: [
      'Demonstrate tool value', 'Provide free trial/demo', 'Share user testimonials',
      'Offer exclusive features', 'Highlight unique benefits', 'Show competitive advantages'
    ],
    broken_links: [
      'Report broken link politely', 'Suggest quality replacement', 'Offer additional resources',
      'Provide context for suggestion', 'Emphasize user experience', 'Follow up professionally'
    ],
    competitor_gaps: [
      'Highlight unique differentiators', 'Demonstrate superior features', 'Share success stories',
      'Offer competitive analysis', 'Provide market insights', 'Suggest collaboration'
    ],
    directory_listings: [
      'Submit complete application', 'Provide verification documents', 'Write compelling description',
      'Include relevant keywords', 'Add professional images', 'Maintain active profile'
    ],
    partnerships: [
      'Propose mutual benefits', 'Suggest collaboration ideas', 'Share partnership vision',
      'Offer pilot program', 'Demonstrate value alignment', 'Present partnership proposal'
    ]
  };

  return Array.from({ length: count }, (_, i) => {
    const type = opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)];
    const targetDomain = targetDomains[Math.floor(Math.random() * targetDomains.length)];
    const domainAuthority = Math.floor(Math.random() * 70) + 30; // 30-100
    const difficultyScore = Math.floor(Math.random() * 100);
    
    let difficulty: 'easy' | 'medium' | 'hard';
    if (difficultyScore <= 30) difficulty = 'easy';
    else if (difficultyScore <= 70) difficulty = 'medium';
    else difficulty = 'hard';

    let priority: 'low' | 'medium' | 'high';
    if (domainAuthority >= 70 && difficulty === 'easy') priority = 'high';
    else if (domainAuthority >= 50 && difficulty !== 'hard') priority = 'medium';
    else priority = 'low';

    const hasCompetitorLinks = Math.random() > 0.4;
    const competitorCount = hasCompetitorLinks ? Math.floor(Math.random() * 3) + 1 : 0;
    const selectedCompetitors = competitors.slice(0, competitorCount);

    return {
      id: `opp_${i + 1}`,
      type,
      targetDomain,
      targetUrl: `https://${targetDomain}/${type.replace('_', '-')}`,
      pageTitle: pageTitles[type][Math.floor(Math.random() * pageTitles[type].length)],
      domainAuthority,
      pageAuthority: Math.max(1, domainAuthority - Math.floor(Math.random() * 15)),
      trustFlow: Math.floor(Math.random() * 100),
      difficulty,
      difficultyScore,
      estimatedValue: Math.floor((domainAuthority / 10) * (100 - difficultyScore) / 10),
      contactInfo: {
        email: Math.random() > 0.3 ? `contact@${targetDomain}` : undefined,
        contactForm: Math.random() > 0.5 ? `https://${targetDomain}/contact` : undefined,
        socialMedia: {
          twitter: Math.random() > 0.6 ? `@${targetDomain.split('.')[0]}` : undefined,
          linkedin: Math.random() > 0.7 ? `linkedin.com/company/${targetDomain.split('.')[0]}` : undefined
        }
      },
      requirements: requirements[type].slice(0, Math.floor(Math.random() * 3) + 2),
      suggestedApproach: approaches[type][Math.floor(Math.random() * approaches[type].length)],
      competitorPresence: {
        hasCompetitorLinks,
        competitorCount,
        competitors: selectedCompetitors
      },
      contentSuggestions: [
        `${type.replace('_', ' ')} content for ${domain}`,
        `Industry insights relevant to ${targetDomain}`,
        `Case study featuring ${domain} solutions`
      ],
      priority,
      estimatedTimeframe: difficulty === 'easy' ? '1-2 weeks' : difficulty === 'medium' ? '2-4 weeks' : '1-3 months',
      successProbability: Math.max(10, 100 - difficultyScore + (domainAuthority > 60 ? 10 : 0)),
      lastUpdated: new Date().toISOString(),
      notes: Math.random() > 0.7 ? 'High-value target with good response rate' : undefined
    };
  }).sort((a, b) => {
    // Ordenar por prioridad y luego por valor estimado
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.estimatedValue - a.estimatedValue;
  });
};

// Generar análisis de competidores
const generateCompetitorAnalysis = (opportunities: LinkOpportunity[], competitors: string[]) => {
  return competitors.map(competitor => {
    const competitorOpportunities = opportunities.filter(opp => 
      opp.competitorPresence.competitors.includes(competitor)
    );
    
    const uniqueOpportunities = Math.floor(Math.random() * 20) + 10;
    const sharedOpportunities = competitorOpportunities.length;
    const averageDA = competitorOpportunities.length > 0 
      ? Math.round(competitorOpportunities.reduce((sum, opp) => sum + opp.domainAuthority, 0) / competitorOpportunities.length)
      : Math.floor(Math.random() * 40) + 40;

    return {
      competitor,
      uniqueOpportunities,
      sharedOpportunities,
      averageDA
    };
  });
};

export async function POST(request: NextRequest) {
  try {
    const body: OpportunitiesRequest = await request.json();
    
    if (!body.domain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required' },
        { status: 400 }
      );
    }

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2500));

    const competitors = body.competitors || ['competitor1.com', 'competitor2.com'];
    const opportunityCount = Math.floor(Math.random() * 50) + 30; // 30-80 oportunidades
    const opportunities = generateOpportunities(body.domain, competitors, opportunityCount);
    
    // Calcular métricas
    const totalOpportunities = opportunities.length;
    const highPriorityCount = opportunities.filter(opp => opp.priority === 'high').length;
    const easyAccessCount = opportunities.filter(opp => opp.difficulty === 'easy').length;
    const averageDomainAuthority = Math.round(
      opportunities.reduce((sum, opp) => sum + opp.domainAuthority, 0) / opportunities.length
    );
    const averageDifficulty = Math.round(
      opportunities.reduce((sum, opp) => sum + opp.difficultyScore, 0) / opportunities.length
    );
    
    const typeDistribution = {
      guest_posting: opportunities.filter(opp => opp.type === 'guest_posting').length,
      resource_pages: opportunities.filter(opp => opp.type === 'resource_pages').length,
      broken_links: opportunities.filter(opp => opp.type === 'broken_links').length,
      competitor_gaps: opportunities.filter(opp => opp.type === 'competitor_gaps').length,
      directory_listings: opportunities.filter(opp => opp.type === 'directory_listings').length,
      partnerships: opportunities.filter(opp => opp.type === 'partnerships').length
    };
    
    const difficultyDistribution = {
      easy: opportunities.filter(opp => opp.difficulty === 'easy').length,
      medium: opportunities.filter(opp => opp.difficulty === 'medium').length,
      hard: opportunities.filter(opp => opp.difficulty === 'hard').length
    };

    // Generar recomendaciones
    const quickWins = opportunities
      .filter(opp => opp.difficulty === 'easy' && opp.priority !== 'low')
      .slice(0, 5);
    
    const longTermTargets = opportunities
      .filter(opp => opp.domainAuthority >= 70)
      .slice(0, 5);
    
    const competitorGaps = opportunities
      .filter(opp => !opp.competitorPresence.hasCompetitorLinks && opp.priority === 'high')
      .slice(0, 5);

    const competitorAnalysis = generateCompetitorAnalysis(opportunities, competitors);

    const response: OpportunitiesResponse = {
      success: true,
      data: {
        domain: body.domain,
        searchId: `search_${Date.now()}`,
        searchDate: new Date().toISOString(),
        metrics: {
          totalOpportunities,
          highPriorityCount,
          easyAccessCount,
          averageDomainAuthority,
          averageDifficulty,
          typeDistribution,
          difficultyDistribution
        },
        opportunities,
        competitorAnalysis,
        recommendations: {
          quickWins,
          longTermTargets,
          competitorGaps
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in opportunities search:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
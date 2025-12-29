import { NextRequest, NextResponse } from 'next/server';

interface KeywordSuggestion {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  trend: number[];
  relatedKeywords: string[];
  questions: string[];
}

interface DiscoverRequest {
  seedKeywords: string[];
  country?: string;
  language?: string;
  includeRelated?: boolean;
  includeLongTail?: boolean;
  includeQuestions?: boolean;
  minVolume?: number;
  maxDifficulty?: number;
  intent?: string[];
}

// Simulación de base de datos de keywords
const keywordDatabase = [
  {
    keyword: 'seo tools',
    volume: 49500,
    difficulty: 67,
    cpc: 12.45,
    competition: 'high' as const,
    intent: 'commercial' as const,
    trend: [45000, 47000, 49500, 51000, 48000, 49500],
    relatedKeywords: ['best seo tools', 'free seo tools', 'seo software', 'seo toolkit', 'professional seo tools'],
    questions: ['what are the best seo tools?', 'how to use seo tools?', 'which seo tools are free?']
  },
  {
    keyword: 'keyword research tool',
    volume: 33100,
    difficulty: 72,
    cpc: 8.92,
    competition: 'high' as const,
    intent: 'commercial' as const,
    trend: [30000, 31500, 33100, 34000, 32500, 33100],
    relatedKeywords: ['free keyword research', 'keyword planner', 'keyword finder', 'keyword analysis tool'],
    questions: ['how to do keyword research?', 'what is keyword research?', 'best keyword research tools?']
  },
  {
    keyword: 'backlink checker',
    volume: 27100,
    difficulty: 58,
    cpc: 15.67,
    competition: 'medium' as const,
    intent: 'commercial' as const,
    trend: [25000, 26000, 27100, 28000, 26500, 27100],
    relatedKeywords: ['free backlink checker', 'backlink analysis', 'link checker', 'backlink monitor'],
    questions: ['how to check backlinks?', 'what is a backlink checker?', 'free backlink analysis tools?']
  },
  {
    keyword: 'competitor analysis seo',
    volume: 18100,
    difficulty: 64,
    cpc: 11.23,
    competition: 'medium' as const,
    intent: 'informational' as const,
    trend: [16000, 17000, 18100, 19000, 17500, 18100],
    relatedKeywords: ['seo competitor research', 'competitor seo analysis', 'seo competitive analysis'],
    questions: ['how to analyze competitors seo?', 'what is seo competitor analysis?']
  },
  {
    keyword: 'long tail keywords',
    volume: 14800,
    difficulty: 45,
    cpc: 6.78,
    competition: 'low' as const,
    intent: 'informational' as const,
    trend: [13000, 14000, 14800, 15500, 14200, 14800],
    relatedKeywords: ['long tail keyword research', 'long tail seo', 'long tail keyword examples'],
    questions: ['what are long tail keywords?', 'how to find long tail keywords?']
  },
  {
    keyword: 'content optimization',
    volume: 22400,
    difficulty: 52,
    cpc: 9.34,
    competition: 'medium' as const,
    intent: 'informational' as const,
    trend: [20000, 21000, 22400, 23000, 21800, 22400],
    relatedKeywords: ['seo content optimization', 'content seo', 'optimize content for seo'],
    questions: ['how to optimize content for seo?', 'what is content optimization?']
  },
  {
    keyword: 'page speed optimization',
    volume: 16700,
    difficulty: 48,
    cpc: 7.89,
    competition: 'medium' as const,
    intent: 'informational' as const,
    trend: [15000, 16000, 16700, 17200, 16300, 16700],
    relatedKeywords: ['website speed optimization', 'page load speed', 'site speed optimization'],
    questions: ['how to improve page speed?', 'what affects page speed?']
  },
  {
    keyword: 'local seo',
    volume: 35600,
    difficulty: 55,
    cpc: 13.45,
    competition: 'high' as const,
    intent: 'commercial' as const,
    trend: [32000, 34000, 35600, 37000, 34800, 35600],
    relatedKeywords: ['local seo services', 'local search optimization', 'google my business seo'],
    questions: ['what is local seo?', 'how to do local seo?', 'local seo best practices?']
  }
];

function generateRelatedKeywords(seedKeywords: string[]): KeywordSuggestion[] {
  const results: KeywordSuggestion[] = [];
  
  // Buscar keywords relacionadas basadas en las seed keywords
  seedKeywords.forEach(seed => {
    const normalizedSeed = seed.toLowerCase().trim();
    
    // Buscar coincidencias exactas y parciales
    keywordDatabase.forEach(kw => {
      if (kw.keyword.includes(normalizedSeed) || normalizedSeed.includes(kw.keyword)) {
        results.push(kw);
      }
    });
    
    // Generar variaciones adicionales
    const variations = generateKeywordVariations(normalizedSeed);
    variations.forEach(variation => {
      results.push({
        keyword: variation.keyword,
        volume: variation.volume,
        difficulty: variation.difficulty,
        cpc: variation.cpc,
        competition: variation.competition,
        intent: variation.intent,
        trend: generateTrendData(),
        relatedKeywords: variation.relatedKeywords,
        questions: variation.questions
      });
    });
  });
  
  // Eliminar duplicados y ordenar por volumen
  const uniqueResults = results.filter((kw, index, self) => 
    index === self.findIndex(k => k.keyword === kw.keyword)
  );
  
  return uniqueResults.sort((a, b) => b.volume - a.volume);
}

function generateKeywordVariations(seed: string): KeywordSuggestion[] {
  const prefixes = ['best', 'free', 'top', 'how to', 'what is', 'guide to'];
  const suffixes = ['tool', 'software', 'service', 'guide', 'tutorial', 'tips'];
  const modifiers = ['2024', 'online', 'professional', 'advanced', 'beginner'];
  
  const variations: KeywordSuggestion[] = [];
  
  // Generar variaciones con prefijos
  prefixes.forEach(prefix => {
    variations.push({
      keyword: `${prefix} ${seed}`,
      volume: Math.floor(Math.random() * 20000) + 1000,
      difficulty: Math.floor(Math.random() * 80) + 20,
      cpc: Math.round((Math.random() * 15 + 1) * 100) / 100,
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      intent: ['informational', 'commercial', 'transactional', 'navigational'][Math.floor(Math.random() * 4)] as any,
      trend: generateTrendData(),
      relatedKeywords: [`${seed} guide`, `${seed} tips`, `${seed} tutorial`],
      questions: [`what is ${seed}?`, `how to use ${seed}?`]
    });
  });
  
  // Generar variaciones con sufijos
  suffixes.forEach(suffix => {
    variations.push({
      keyword: `${seed} ${suffix}`,
      volume: Math.floor(Math.random() * 15000) + 500,
      difficulty: Math.floor(Math.random() * 70) + 30,
      cpc: Math.round((Math.random() * 12 + 2) * 100) / 100,
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      intent: ['informational', 'commercial', 'transactional', 'navigational'][Math.floor(Math.random() * 4)] as any,
      trend: generateTrendData(),
      relatedKeywords: [`${seed} review`, `${seed} comparison`, `${seed} analysis`],
      questions: [`which ${seed} ${suffix} is best?`, `how to choose ${seed} ${suffix}?`]
    });
  });
  
  return variations.slice(0, 10); // Limitar a 10 variaciones por seed
}

function generateTrendData(): number[] {
  const baseValue = Math.floor(Math.random() * 50000) + 5000;
  const trend = [];
  
  for (let i = 0; i < 6; i++) {
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    trend.push(Math.floor(baseValue * (1 + variation)));
  }
  
  return trend;
}

function applyFilters(keywords: KeywordSuggestion[], filters: DiscoverRequest): KeywordSuggestion[] {
  let filtered = [...keywords];
  
  // Filtrar por volumen mínimo
  if (filters.minVolume) {
    filtered = filtered.filter(kw => kw.volume >= filters.minVolume!);
  }
  
  // Filtrar por dificultad máxima
  if (filters.maxDifficulty) {
    filtered = filtered.filter(kw => kw.difficulty <= filters.maxDifficulty!);
  }
  
  // Filtrar por intención
  if (filters.intent && filters.intent.length > 0) {
    filtered = filtered.filter(kw => filters.intent!.includes(kw.intent));
  }
  
  // Filtrar long tail keywords
  if (!filters.includeLongTail) {
    filtered = filtered.filter(kw => kw.keyword.split(' ').length <= 3);
  }
  
  return filtered;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverRequest = await request.json();
    
    // Validaciones
    if (!body.seedKeywords || body.seedKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword semilla' },
        { status: 400 }
      );
    }
    
    // Filtrar keywords vacías
    const validSeedKeywords = body.seedKeywords.filter(kw => kw.trim().length > 0);
    
    if (validSeedKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una keyword semilla válida' },
        { status: 400 }
      );
    }
    
    // Generar keywords relacionadas
    const relatedKeywords = generateRelatedKeywords(validSeedKeywords);
    
    // Aplicar filtros
    const filteredKeywords = applyFilters(relatedKeywords, body);
    
    // Limitar resultados
    const limitedResults = filteredKeywords.slice(0, 100);
    
    // Calcular estadísticas
    const stats = {
      totalKeywords: limitedResults.length,
      avgVolume: Math.round(limitedResults.reduce((sum, kw) => sum + kw.volume, 0) / limitedResults.length),
      avgDifficulty: Math.round(limitedResults.reduce((sum, kw) => sum + kw.difficulty, 0) / limitedResults.length),
      avgCpc: Math.round((limitedResults.reduce((sum, kw) => sum + kw.cpc, 0) / limitedResults.length) * 100) / 100,
      intentDistribution: {
        informational: limitedResults.filter(kw => kw.intent === 'informational').length,
        commercial: limitedResults.filter(kw => kw.intent === 'commercial').length,
        transactional: limitedResults.filter(kw => kw.intent === 'transactional').length,
        navigational: limitedResults.filter(kw => kw.intent === 'navigational').length
      },
      competitionDistribution: {
        low: limitedResults.filter(kw => kw.competition === 'low').length,
        medium: limitedResults.filter(kw => kw.competition === 'medium').length,
        high: limitedResults.filter(kw => kw.competition === 'high').length
      }
    };
    
    return NextResponse.json({
      success: true,
      data: {
        keywords: limitedResults,
        stats,
        filters: body,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in keyword discovery:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
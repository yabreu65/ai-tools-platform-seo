import OpenAI from 'openai';
import { AIAnalysisResult, KeywordExtractionResult, ScrapingResult } from './types';

export class AIAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async extractKeywords(content: string, language: string = 'es'): Promise<KeywordExtractionResult> {
    try {
      const prompt = `
Analiza el siguiente contenido web y extrae las palabras clave más relevantes para SEO.

Contenido:
${content.substring(0, 4000)}

Instrucciones:
1. Identifica las palabras clave más importantes (1-3 palabras)
2. Calcula la frecuencia de cada palabra clave
3. Estima la densidad como porcentaje
4. Categoriza cada palabra clave como: primary, secondary, long-tail, o brand
5. Asigna un score de relevancia del 0 al 1

Responde SOLO con un JSON válido en este formato:
{
  "keywords": [
    {
      "keyword": "palabra clave",
      "frequency": 5,
      "density": 2.5,
      "category": "primary",
      "relevanceScore": 0.9,
      "positions": ["title", "h1", "content"]
    }
  ],
  "totalWords": 200,
  "uniqueWords": 150
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en SEO y análisis de contenido. Analiza texto web y extrae palabras clave relevantes. Responde siempre en formato JSON válido. Idioma de análisis: ${language}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsedResult = JSON.parse(result);
      
      return {
        keywords: parsedResult.keywords || [],
        totalWords: parsedResult.totalWords || 0,
        uniqueWords: parsedResult.uniqueWords || 0
      };

    } catch (error) {
      console.error('Error in AI keyword extraction:', error);
      
      // Fallback to basic keyword extraction
      return this.fallbackKeywordExtraction(content);
    }
  }

  async analyzeCompetitiveOpportunities(
    scrapingResults: ScrapingResult[],
    language: string = 'es'
  ): Promise<AIAnalysisResult> {
    try {
      // Prepare content summary for analysis
      const contentSummary = scrapingResults
        .filter(result => result.success)
        .map(result => ({
          url: result.url,
          title: result.title,
          metaDescription: result.metaDescription,
          headings: result.content?.headings,
          keyContent: result.content?.paragraphs?.slice(0, 3).join(' ').substring(0, 500)
        }));

      const prompt = `
Analiza los siguientes sitios web competidores y identifica oportunidades SEO:

Sitios analizados:
${JSON.stringify(contentSummary, null, 2)}

Instrucciones:
1. Identifica las palabras clave principales de cada competidor
2. Categoriza las palabras clave por tipo e importancia
3. Encuentra gaps y oportunidades de contenido
4. Sugiere estrategias de optimización
5. Detecta tendencias y patrones

Responde SOLO con un JSON válido en este formato:
{
  "keywords": [
    {
      "keyword": "palabra clave",
      "category": "primary",
      "relevanceScore": 0.9,
      "semanticGroup": "grupo temático"
    }
  ],
  "opportunities": [
    {
      "type": "gap",
      "description": "Descripción de la oportunidad",
      "suggestedKeywords": ["keyword1", "keyword2"],
      "priority": 4,
      "confidenceScore": 0.8
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en análisis competitivo SEO. Analiza sitios web competidores e identifica oportunidades estratégicas. Responde siempre en formato JSON válido. Idioma: ${language}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000
      });

      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const parsedResult = JSON.parse(result);
      
      return {
        keywords: parsedResult.keywords || [],
        opportunities: parsedResult.opportunities || []
      };

    } catch (error) {
      console.error('Error in AI competitive analysis:', error);
      
      // Return fallback analysis
      return {
        keywords: [],
        opportunities: [
          {
            type: 'optimization',
            description: 'Análisis automático no disponible. Revisa manualmente el contenido extraído.',
            suggestedKeywords: [],
            priority: 2,
            confidenceScore: 0.5
          }
        ]
      };
    }
  }

  async categorizeKeywords(keywords: string[], language: string = 'es'): Promise<Array<{
    keyword: string;
    category: 'primary' | 'secondary' | 'long-tail' | 'brand';
    relevanceScore: number;
  }>> {
    try {
      const prompt = `
Categoriza las siguientes palabras clave para SEO:

Palabras clave: ${keywords.join(', ')}

Instrucciones:
1. Categoriza cada palabra como: primary (1-2 palabras principales), secondary (palabras de apoyo), long-tail (frases largas específicas), o brand (marcas/nombres propios)
2. Asigna un score de relevancia del 0 al 1
3. Considera la intención de búsqueda y competitividad

Responde SOLO con un JSON válido:
{
  "categorizedKeywords": [
    {
      "keyword": "palabra clave",
      "category": "primary",
      "relevanceScore": 0.9
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en categorización de palabras clave SEO. Clasifica keywords por tipo e importancia. Responde en formato JSON válido. Idioma: ${language}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const parsedResult = JSON.parse(result);
      
      return parsedResult.categorizedKeywords || [];

    } catch (error) {
      console.error('Error in AI keyword categorization:', error);
      
      // Fallback categorization
      return keywords.map(keyword => ({
        keyword,
        category: keyword.split(' ').length > 2 ? 'long-tail' : 'primary' as any,
        relevanceScore: 0.5
      }));
    }
  }

  private fallbackKeywordExtraction(content: string): KeywordExtractionResult {
    // Basic keyword extraction without AI
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const totalWords = words.length;
    const uniqueWords = Object.keys(wordFreq).length;

    // Get top keywords
    const sortedKeywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        density: (frequency / totalWords) * 100,
        category: 'primary' as const,
        relevanceScore: Math.min(frequency / 10, 1),
        positions: ['content']
      }));

    return {
      keywords: sortedKeywords,
      totalWords,
      uniqueWords
    };
  }

  async generateSEOSuggestions(
    keywords: string[],
    competitors: ScrapingResult[],
    language: string = 'es'
  ): Promise<string[]> {
    try {
      const competitorTitles = competitors
        .filter(c => c.success && c.title)
        .map(c => c.title)
        .slice(0, 5);

      const prompt = `
Basándote en estas palabras clave: ${keywords.slice(0, 10).join(', ')}
Y estos títulos de competidores: ${competitorTitles.join(', ')}

Genera 5 sugerencias específicas de optimización SEO:
1. Mejoras de contenido
2. Oportunidades de palabras clave
3. Optimización técnica
4. Estrategia de contenido
5. Ventajas competitivas

Responde con una lista de sugerencias claras y accionables.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un consultor SEO experto. Proporciona sugerencias prácticas y específicas para mejorar el posicionamiento. Idioma: ${language}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });

      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        return ['Revisa la densidad de palabras clave en tu contenido'];
      }

      return result.split('\n').filter(line => line.trim().length > 0);

    } catch (error) {
      console.error('Error generating SEO suggestions:', error);
      
      return [
        'Optimiza la densidad de palabras clave principales (1-3%)',
        'Mejora los títulos H1 y H2 con keywords relevantes',
        'Crea contenido más extenso y detallado',
        'Optimiza las meta descripciones',
        'Añade enlaces internos estratégicos'
      ];
    }
  }
}
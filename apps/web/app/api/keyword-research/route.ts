import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para obtener sugerencias de Google usando la API de Custom Search
async function getGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_CX;
    
    if (!googleApiKey || !searchEngineId) {
      console.warn('Google API credentials not configured');
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`
    );
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    const data = await response.json();
    const suggestions: string[] = [];
    
    // Extraer keywords de títulos y snippets
    if (data.items) {
      data.items.forEach((item: any) => {
        if (item.title) {
          suggestions.push(...extractKeywords(item.title));
        }
        if (item.snippet) {
          suggestions.push(...extractKeywords(item.snippet));
        }
      });
    }
    
    return [...new Set(suggestions)].slice(0, 20); // Eliminar duplicados y limitar
  } catch (error) {
    console.error('Error fetching Google suggestions:', error);
    return [];
  }
}

// Función para extraer keywords básicas de texto
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && word.length < 20);
  
  // Filtrar palabras comunes
  const stopWords = ['para', 'con', 'por', 'una', 'del', 'las', 'los', 'que', 'como', 'más', 'sobre', 'todo', 'esta', 'este', 'desde', 'hasta', 'muy', 'bien', 'también', 'puede', 'hacer', 'ser', 'tener'];
  
  return words.filter(word => !stopWords.includes(word));
}

// Función para analizar una URL
async function analyzeUrl(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Tool/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extraer texto del HTML (básico)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return extractKeywords(textContent);
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw new Error('No se pudo analizar la URL proporcionada');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, url, mode = 'query' } = await req.json();

    // Validaciones básicas
    if (mode === 'url' && (!url || !url.trim())) {
      return new Response(JSON.stringify({ error: 'La URL es requerida para el análisis de páginas web.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'query' && (!query || !query.trim())) {
      return new Response(JSON.stringify({ error: 'La consulta de búsqueda es requerida.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Configuración de OpenAI no disponible.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let baseKeywords: string[] = [];
    let searchTerm = '';

    if (mode === 'url') {
      searchTerm = url;
      baseKeywords = await analyzeUrl(url);
    } else {
      searchTerm = query;
      baseKeywords = extractKeywords(query);
    }

    // Obtener sugerencias de Google
    const googleSuggestions = await getGoogleSuggestions(mode === 'url' ? url : query);

    // Usar OpenAI para generar keywords relacionadas y análisis
    const prompt = `
Actúa como un experto en SEO y keyword research. 

${mode === 'url' 
  ? `Analiza esta URL: "${url}" y las siguientes keywords extraídas: ${baseKeywords.slice(0, 10).join(', ')}`
  : `Analiza esta consulta de búsqueda: "${query}"`
}

Genera un análisis completo de keywords que incluya:

1. **Keywords principales** (5-8 keywords): Las más relevantes y con potencial SEO
2. **Keywords de cola larga** (8-12 keywords): Frases más específicas y menos competitivas
3. **Keywords relacionadas** (10-15 keywords): Términos semánticamente relacionados
4. **Análisis de intención de búsqueda**: Clasifica las keywords por intención (informacional, navegacional, transaccional, comercial)
5. **Métricas estimadas**: Dificultad SEO (1-100) y volumen de búsqueda estimado (Alto/Medio/Bajo)

Responde ÚNICAMENTE en formato JSON:
{
  "keywords_principales": [
    {
      "keyword": "término",
      "dificultad": número,
      "volumen": "Alto|Medio|Bajo",
      "intencion": "informacional|navegacional|transaccional|comercial"
    }
  ],
  "keywords_cola_larga": [
    {
      "keyword": "frase larga específica",
      "dificultad": número,
      "volumen": "Alto|Medio|Bajo",
      "intencion": "informacional|navegacional|transaccional|comercial"
    }
  ],
  "keywords_relacionadas": [
    {
      "keyword": "término relacionado",
      "dificultad": número,
      "volumen": "Alto|Medio|Bajo",
      "intencion": "informacional|navegacional|transaccional|comercial"
    }
  ],
  "resumen": {
    "total_keywords": número,
    "dificultad_promedio": número,
    "oportunidades_principales": ["keyword1", "keyword2", "keyword3"],
    "recomendaciones": "texto con recomendaciones estratégicas"
  }
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en SEO y keyword research con amplia experiencia en análisis de competencia y estrategias de contenido. Proporcionas análisis precisos y accionables.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Extraer JSON de la respuesta
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Formato de respuesta inválido');
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);
    
    // Validar estructura de respuesta
    if (!aiAnalysis.keywords_principales || !aiAnalysis.keywords_cola_larga || !aiAnalysis.keywords_relacionadas) {
      throw new Error('Respuesta incompleta de OpenAI');
    }

    // Combinar resultados
    const result = {
      ...aiAnalysis,
      google_suggestions: googleSuggestions.slice(0, 10),
      metadata: {
        search_term: searchTerm,
        mode,
        timestamp: new Date().toISOString(),
        total_sources: mode === 'url' ? 2 : 1, // URL analysis + Google vs solo Google
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error: any) {
    console.error('Error en API Keyword Research:', error);
    
    let errorMessage = 'Ocurrió un error al analizar las keywords.';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Error de configuración de OpenAI.';
      statusCode = 500;
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'Límite de uso alcanzado. Intenta nuevamente en unos minutos.';
      statusCode = 429;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Error al procesar la respuesta. Intenta nuevamente.';
      statusCode = 500;
    } else if (error.message?.includes('URL')) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
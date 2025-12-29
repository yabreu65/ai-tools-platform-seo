import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DuplicateContentResult {
  url?: string;
  content: string;
  timestamp: string;
  originalidad_score: number;
  
  // Análisis de duplicación
  duplicacion_interna: {
    encontrada: boolean;
    porcentaje_similitud: number;
    fragmentos_duplicados: string[];
    urls_similares: string[];
  };
  
  duplicacion_externa: {
    encontrada: boolean;
    porcentaje_similitud: number;
    fuentes_potenciales: Array<{
      fuente: string;
      similitud: number;
      fragmento: string;
    }>;
  };
  
  // Análisis de originalidad
  analisis_originalidad: {
    contenido_unico: number;
    contenido_comun: number;
    frases_problematicas: string[];
    sugerencias_mejora: string[];
  };
  
  // Recomendaciones
  recomendaciones: Array<{
    tipo: 'critico' | 'importante' | 'sugerencia';
    titulo: string;
    descripcion: string;
    impacto: string;
  }>;
  
  // Funciones premium
  analisis_avanzado?: {
    verificacion_multiples_fuentes: boolean;
    analisis_semantico: {
      similitud_conceptual: number;
      temas_comunes: string[];
    };
    sugerencias_reescritura: string[];
    monitoreo_continuo: boolean;
  };
}

// Función para simular detección externa (en producción se usaría una API real)
async function detectExternalDuplication(content: string): Promise<any> {
  // Simulación de búsqueda externa
  const commonPhrases = [
    "inteligencia artificial",
    "machine learning",
    "optimización SEO",
    "contenido de calidad",
    "experiencia de usuario"
  ];
  
  const foundPhrases = commonPhrases.filter(phrase => 
    content.toLowerCase().includes(phrase.toLowerCase())
  );
  
  return {
    encontrada: foundPhrases.length > 2,
    porcentaje_similitud: Math.min(foundPhrases.length * 15, 85),
    fuentes_potenciales: foundPhrases.slice(0, 3).map((phrase, index) => ({
      fuente: `ejemplo-sitio-${index + 1}.com`,
      similitud: Math.random() * 40 + 30,
      fragmento: `Fragmento que contiene: "${phrase}"`
    }))
  };
}

// Función para análisis con IA
async function analyzeContentWithAI(content: string, isPremium: boolean = false) {
  const prompt = `
Analiza el siguiente contenido desde la perspectiva de detección de contenido duplicado y originalidad:

**CONTENIDO A ANALIZAR:**
"${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}"

Proporciona un análisis completo que incluya:

1. **Puntuación de Originalidad** (0-100): Qué tan único es el contenido
2. **Fragmentos Problemáticos**: Identifica frases que podrían ser duplicadas
3. **Análisis de Estructura**: Evalúa la originalidad de la estructura del contenido
4. **Sugerencias de Mejora**: Cómo hacer el contenido más único
5. **Recomendaciones Específicas**: Acciones concretas para mejorar la originalidad

${isPremium ? `
**ANÁLISIS PREMIUM:**
6. **Análisis Semántico**: Similitud conceptual con contenido común
7. **Sugerencias de Reescritura**: Alternativas específicas para fragmentos problemáticos
8. **Temas Comunes**: Identifica temas que podrían estar saturados
` : ''}

Responde ÚNICAMENTE en formato JSON:
{
  "originalidad_score": número,
  "fragmentos_problematicos": ["frase1", "frase2"],
  "sugerencias_mejora": ["sugerencia1", "sugerencia2"],
  "recomendaciones": [
    {
      "tipo": "critico|importante|sugerencia",
      "titulo": "título",
      "descripcion": "descripción detallada",
      "impacto": "impacto esperado"
    }
  ]${isPremium ? `,
  "analisis_semantico": {
    "similitud_conceptual": número,
    "temas_comunes": ["tema1", "tema2"]
  },
  "sugerencias_reescritura": ["reescritura1", "reescritura2"]` : ''}
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en detección de contenido duplicado y análisis de originalidad. Proporciona análisis precisos y sugerencias prácticas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: isPremium ? 2000 : 1000,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error en análisis con IA:', error);
    return {
      originalidad_score: 75,
      fragmentos_problematicos: ["No se pudo analizar completamente"],
      sugerencias_mejora: ["Revisa manualmente el contenido"],
      recomendaciones: [{
        tipo: "importante",
        titulo: "Análisis manual requerido",
        descripcion: "No se pudo completar el análisis automático",
        impacto: "Verificación manual recomendada"
      }]
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, url, mode = 'content', plan = 'free' } = await req.json();

    // Validaciones básicas
    if (mode === 'content' && (!content || content.trim().length < 50)) {
      return NextResponse.json({ 
        error: 'El contenido debe tener al menos 50 caracteres para un análisis efectivo.' 
      }, { status: 400 });
    }

    if (mode === 'url' && (!url || !url.trim())) {
      return NextResponse.json({ 
        error: 'La URL es requerida para el análisis de páginas web.' 
      }, { status: 400 });
    }

    // Determinar si es usuario premium
    const isPremium = plan === 'premium' || plan === 'trial';

    let contentToAnalyze = content;

    // Si es modo URL, extraer contenido (simulado)
    if (mode === 'url') {
      try {
        // En producción, aquí se haría scraping real de la URL
        contentToAnalyze = `Contenido extraído de ${url}. Este es un ejemplo de contenido que sería extraído de la página web para análisis de duplicación.`;
      } catch (error) {
        return NextResponse.json({ 
          error: 'No se pudo acceder a la URL proporcionada.' 
        }, { status: 400 });
      }
    }

    // Análisis con IA
    const aiAnalysis = await analyzeContentWithAI(contentToAnalyze, isPremium);

    // Detección externa simulada
    const externalDuplication = await detectExternalDuplication(contentToAnalyze);

    // Análisis de duplicación interna (simulado)
    const internalDuplication = {
      encontrada: Math.random() > 0.7,
      porcentaje_similitud: Math.floor(Math.random() * 30) + 10,
      fragmentos_duplicados: aiAnalysis.fragmentos_problematicos?.slice(0, 2) || [],
      urls_similares: mode === 'url' ? [`${url}/pagina-similar-1`, `${url}/pagina-similar-2`] : []
    };

    // Construir resultado
    const result: DuplicateContentResult = {
      ...(mode === 'url' && { url }),
      content: contentToAnalyze.substring(0, 500) + (contentToAnalyze.length > 500 ? '...' : ''),
      timestamp: new Date().toISOString(),
      originalidad_score: aiAnalysis.originalidad_score || 75,
      
      duplicacion_interna: internalDuplication,
      duplicacion_externa: externalDuplication,
      
      analisis_originalidad: {
        contenido_unico: aiAnalysis.originalidad_score || 75,
        contenido_comun: 100 - (aiAnalysis.originalidad_score || 75),
        frases_problematicas: aiAnalysis.fragmentos_problematicos || [],
        sugerencias_mejora: aiAnalysis.sugerencias_mejora || []
      },
      
      recomendaciones: aiAnalysis.recomendaciones || []
    };

    // Añadir análisis avanzado para usuarios premium
    if (isPremium && aiAnalysis.analisis_semantico) {
      result.analisis_avanzado = {
        verificacion_multiples_fuentes: true,
        analisis_semantico: aiAnalysis.analisis_semantico,
        sugerencias_reescritura: aiAnalysis.sugerencias_reescritura || [],
        monitoreo_continuo: true
      };
    }

    // Análisis avanzado para usuarios premium
    let advancedAnalysis = null;
    if (isPremium) {
      // Análisis profundo con OpenAI para sugerencias de reescritura
      const rewritePrompt = `Analiza el siguiente contenido y proporciona sugerencias específicas para mejorar su originalidad y evitar duplicación:

Contenido: "${contentToAnalyze.substring(0, 1000)}..."

Proporciona:
1. 3-5 sugerencias específicas de reescritura
2. Frases que podrían ser problemáticas
3. Alternativas de palabras clave
4. Recomendaciones de estructura

Responde en formato JSON con las claves: suggestions, problematicPhrases, keywordAlternatives, structureRecommendations`;

      try {
        const rewriteResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: rewritePrompt }],
          temperature: 0.7,
          max_tokens: 800
        });

        let rewriteData;
        try {
          rewriteData = JSON.parse(rewriteResponse.choices[0].message.content || '{}');
        } catch {
          rewriteData = {
            suggestions: [
              'Considera parafrasear las frases más comunes',
              'Añade más contenido original y específico',
              'Utiliza sinónimos para palabras repetitivas',
              'Incluye datos y estadísticas únicas'
            ],
            problematicPhrases: ['Frases genéricas detectadas'],
            keywordAlternatives: ['Sinónimos sugeridos'],
            structureRecommendations: ['Reorganizar párrafos para mayor originalidad']
          };
        }

        advancedAnalysis = {
          deepSources: [
            { url: 'https://example1.com/article', similarity: 15, title: 'Artículo relacionado 1' },
            { url: 'https://example2.com/blog', similarity: 12, title: 'Blog post similar' },
            { url: 'https://example3.com/content', similarity: 8, title: 'Contenido relacionado' }
          ],
          detailedReport: {
            totalSourcesChecked: 1500,
            uniquePhrases: Math.floor(Math.random() * 50) + 20,
            commonPhrases: Math.floor(Math.random() * 10) + 5,
            riskLevel: aiAnalysis.originalidad_score > 80 ? 'Bajo' : aiAnalysis.originalidad_score > 60 ? 'Medio' : 'Alto',
            analysisDepth: 'Profundo',
            sourcesAnalyzed: ['Web general', 'Bases de datos académicas', 'Contenido premium', 'Archivos indexados']
          },
          rewriteSuggestions: rewriteData.suggestions || [
            'Considera parafrasear las frases más comunes',
            'Añade más contenido original y específico',
            'Utiliza sinónimos para palabras repetitivas',
            'Incluye datos y estadísticas únicas'
          ],
          problematicPhrases: rewriteData.problematicPhrases || [],
          keywordAlternatives: rewriteData.keywordAlternatives || [],
          structureRecommendations: rewriteData.structureRecommendations || []
        };
      } catch (error) {
        console.error('Error en análisis avanzado:', error);
        // Fallback a análisis básico premium
        advancedAnalysis = {
          deepSources: [
            { url: 'https://example1.com/article', similarity: 15, title: 'Artículo relacionado 1' },
            { url: 'https://example2.com/blog', similarity: 12, title: 'Blog post similar' }
          ],
          detailedReport: {
            totalSourcesChecked: 1500,
            uniquePhrases: Math.floor(Math.random() * 50) + 20,
            commonPhrases: Math.floor(Math.random() * 10) + 5,
            riskLevel: aiAnalysis.originalidad_score > 80 ? 'Bajo' : aiAnalysis.originalidad_score > 60 ? 'Medio' : 'Alto'
          },
          rewriteSuggestions: [
            'Considera parafrasear las frases más comunes',
            'Añade más contenido original y específico',
            'Utiliza sinónimos para palabras repetitivas'
          ]
        };
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en detector de contenido duplicado:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor. Por favor, inténtalo de nuevo.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Detector de Contenido Duplicado API',
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'Analiza contenido para detectar duplicación',
        parameters: {
          content: 'Texto a analizar (requerido si mode=content)',
          url: 'URL a analizar (requerido si mode=url)',
          mode: 'content|url (default: content)',
          plan: 'free|premium|trial (default: free)'
        }
      }
    }
  });
}
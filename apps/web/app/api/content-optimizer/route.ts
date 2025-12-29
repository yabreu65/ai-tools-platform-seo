import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { verifyToken } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Límites por plan para el optimizador de contenido
const PLAN_LIMITS = {
  free: { monthlyContentAnalysis: 3 },
  premium: { monthlyContentAnalysis: -1 }, // Ilimitado
  trial: { monthlyContentAnalysis: -1 }    // Ilimitado
};

interface ContentAnalysisRequest {
  content: string;
  url?: string;
  targetKeywords?: string[];
  contentType?: 'blog' | 'product' | 'landing' | 'general';
  language?: string;
}

interface SEOScore {
  overall: number;
  breakdown: {
    keywordDensity: number;
    readability: number;
    structure: number;
    metaOptimization: number;
    contentLength: number;
  };
}

interface ContentOptimizationResult {
  seoScore: SEOScore;
  keywordAnalysis: {
    density: Record<string, number>;
    suggestions: string[];
    missing: string[];
  };
  structureAnalysis: {
    headings: {
      h1Count: number;
      h2Count: number;
      h3Count: number;
      suggestions: string[];
    };
    paragraphs: {
      count: number;
      averageLength: number;
      suggestions: string[];
    };
  };
  readabilityAnalysis: {
    score: number;
    level: string;
    suggestions: string[];
  };
  recommendations: Array<{
    type: 'critical' | 'important' | 'suggestion';
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  optimizedContent?: string; // Solo para usuarios Premium
  competitorInsights?: {     // Solo para usuarios Premium
    suggestedKeywords: string[];
    contentGaps: string[];
    competitorStrategies: string[];
    differentiationOpportunities: string[];
  };
  advancedRecommendations?: Array<{  // Solo para usuarios Premium
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener usuario y verificar límites (simulado para demo)
    const user = { 
      id: 'demo-user', 
      plan: 'basic',
      monthlyContentAnalysisCount: 0
    };
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar límites del plan
    const limits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
    const currentUsage = user.monthlyContentAnalysisCount || 0;

    if (limits.monthlyContentAnalysis !== -1 && currentUsage >= limits.monthlyContentAnalysis) {
      return NextResponse.json(
        { 
          error: 'Límite de análisis de contenido alcanzado',
          limit: limits.monthlyContentAnalysis,
          current: currentUsage
        },
        { status: 403 }
      );
    }

    // Obtener datos de la solicitud
    const { content, url, targetKeywords = [], contentType = 'general', language = 'es' }: ContentAnalysisRequest = await request.json();

    // Validaciones
    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'El contenido debe tener al menos 50 caracteres' },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'El contenido no puede exceder 10,000 caracteres' },
        { status: 400 }
      );
    }

    // Verificar API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuración de OpenAI no disponible' },
        { status: 500 }
      );
    }

    // Crear prompt para análisis de contenido
    const analysisPrompt = `
Analiza el siguiente contenido para SEO y proporciona recomendaciones detalladas.

CONTENIDO A ANALIZAR:
"""
${content}
"""

PARÁMETROS:
- Tipo de contenido: ${contentType}
- Palabras clave objetivo: ${targetKeywords.join(', ') || 'No especificadas'}
- Idioma: ${language}
${url ? `- URL: ${url}` : ''}

ANÁLISIS REQUERIDO:
1. Puntuación SEO general (0-100)
2. Análisis de densidad de palabras clave
3. Evaluación de estructura (encabezados, párrafos)
4. Análisis de legibilidad
5. Recomendaciones priorizadas por impacto

RESPONDE EN FORMATO JSON:
{
  "seoScore": {
    "overall": número_0_100,
    "breakdown": {
      "keywordDensity": número_0_100,
      "readability": número_0_100,
      "structure": número_0_100,
      "metaOptimization": número_0_100,
      "contentLength": número_0_100
    }
  },
  "keywordAnalysis": {
    "density": {"palabra": porcentaje},
    "suggestions": ["sugerencias de palabras clave"],
    "missing": ["palabras clave faltantes importantes"]
  },
  "structureAnalysis": {
    "headings": {
      "h1Count": número,
      "h2Count": número,
      "h3Count": número,
      "suggestions": ["sugerencias de estructura"]
    },
    "paragraphs": {
      "count": número,
      "averageLength": número,
      "suggestions": ["sugerencias de párrafos"]
    }
  },
  "readabilityAnalysis": {
    "score": número_0_100,
    "level": "básico|intermedio|avanzado",
    "suggestions": ["sugerencias de legibilidad"]
  },
  "recommendations": [
    {
      "type": "critical|important|suggestion",
      "category": "categoría",
      "title": "título",
      "description": "descripción detallada",
      "impact": "high|medium|low"
    }
  ]
}
    `.trim();

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en SEO y optimización de contenido. Analizas contenido web y proporcionas recomendaciones específicas y accionables para mejorar el posicionamiento en buscadores.'
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3,
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

    const analysisResult: ContentOptimizationResult = JSON.parse(jsonMatch[0]);

    // Para usuarios Premium, generar contenido optimizado y análisis de competencia
    if (user.plan === 'premium' || user.plan === 'trial') {
      // Generar contenido optimizado
      const optimizationPrompt = `
Basándote en el análisis anterior, reescribe y optimiza el siguiente contenido:

CONTENIDO ORIGINAL:
"""
${content}
"""

MEJORAS A APLICAR:
- Optimizar densidad de palabras clave: ${targetKeywords.join(', ')}
- Mejorar estructura de encabezados
- Aumentar legibilidad
- Implementar mejores prácticas SEO

Proporciona el contenido optimizado manteniendo el mensaje original pero mejorando su SEO.
      `.trim();

      try {
        const optimizationCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un copywriter experto en SEO. Optimizas contenido manteniendo su esencia pero mejorando significativamente su posicionamiento.'
            },
            {
              role: 'user',
              content: optimizationPrompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 1500,
        });

        analysisResult.optimizedContent = optimizationCompletion.choices[0]?.message?.content || undefined;
      } catch (error) {
        console.warn('Error generando contenido optimizado:', error);
      }

      // Generar análisis de competencia y palabras clave relacionadas
      const competitorPrompt = `
Basándote en el contenido analizado y las palabras clave objetivo, proporciona insights de competencia:

CONTENIDO: ${content.substring(0, 500)}...
PALABRAS CLAVE: ${targetKeywords.join(', ')}
TIPO DE CONTENIDO: ${contentType}

Proporciona análisis en formato JSON:
{
  "competitorInsights": {
    "suggestedKeywords": ["palabras clave relacionadas y de cola larga"],
    "contentGaps": ["oportunidades de contenido no cubiertas"],
    "competitorStrategies": ["estrategias comunes en este nicho"],
    "differentiationOpportunities": ["formas de diferenciarse"]
  },
  "advancedRecommendations": [
    {
      "category": "Palabras Clave",
      "title": "título",
      "description": "descripción",
      "priority": "high|medium|low",
      "implementation": "pasos específicos"
    }
  ]
}
      `.trim();

      try {
        const competitorCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un estratega SEO experto en análisis competitivo. Identificas oportunidades de palabras clave y estrategias de diferenciación.'
            },
            {
              role: 'user',
              content: competitorPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        const competitorResponseText = competitorCompletion.choices[0]?.message?.content;
        if (competitorResponseText) {
          const competitorJsonMatch = competitorResponseText.match(/{[\s\S]*}/);
          if (competitorJsonMatch) {
            const competitorData = JSON.parse(competitorJsonMatch[0]);
            analysisResult.competitorInsights = competitorData.competitorInsights;
            analysisResult.advancedRecommendations = competitorData.advancedRecommendations;
          }
        }
      } catch (error) {
        console.warn('Error generando análisis de competencia:', error);
      }
    }

    // Incrementar contador de uso (simulado para demo)
    // await UserDatabase.updateUser(decoded.userId, {
    //   monthlyContentAnalysisCount: currentUsage + 1
    // });

    // Agregar metadatos
    const result = {
      ...analysisResult,
      metadata: {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        targetKeywords,
        contentType,
        language,
        url,
        userPlan: user.plan,
        analysisId: `content_${Date.now()}_${user.id}`
      }
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error en Content Optimizer API:', error);
    
    let errorMessage = 'Error al analizar el contenido';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Error de configuración de OpenAI';
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'Límite de uso de OpenAI alcanzado. Intenta nuevamente en unos minutos';
      statusCode = 429;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Error al procesar la respuesta. Intenta nuevamente';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

// Endpoint para obtener historial de análisis
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Aquí se implementaría la lógica para obtener el historial
    // Por ahora retornamos un array vacío
    return NextResponse.json({
      success: true,
      data: {
        analyses: [],
        total: 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
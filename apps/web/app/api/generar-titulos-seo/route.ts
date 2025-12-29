// src/app/api/generar-titulos-seo/route.ts
import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema de validación
const SeoRequestSchema = z.object({
  keyword: z.string()
    .min(1, 'La palabra clave es requerida')
    .max(100, 'La palabra clave no puede exceder 100 caracteres')
    .refine(val => val.trim().length > 0, 'La palabra clave no puede estar vacía'),
  contexto: z.enum(['blog', 'producto', 'servicio', 'empresa', 'landing', 'categoria', 'otro'], {
    errorMap: () => ({ message: 'Contexto inválido' })
  }),
  tono: z.enum(['profesional', 'casual', 'persuasivo', 'informativo', 'creativo', 'urgente'], {
    errorMap: () => ({ message: 'Tono inválido' })
  }),
  nombre: z.string().max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  idioma: z.enum(['es', 'en']).default('es').optional(),
  incluirEmojis: z.boolean().default(false).optional(),
  competencia: z.string().max(200, 'La información de competencia es muy larga').optional()
});

type SeoRequest = z.infer<typeof SeoRequestSchema>;

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    
    // Validar datos de entrada con Zod
    const validationResult = SeoRequestSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Datos de entrada inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { keyword, contexto, tono, nombre, idioma = 'es', incluirEmojis = false, competencia } = validationResult.data;

    // Verificar API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Configuración de OpenAI no disponible',
        code: 'OPENAI_CONFIG_ERROR'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Construir prompt mejorado basado en contexto
    const contextPrompts = {
      blog: 'artículo de blog informativo y educativo',
      producto: 'página de producto comercial',
      servicio: 'página de servicio profesional',
      empresa: 'página corporativa o institucional',
      landing: 'página de aterrizaje para conversión',
      categoria: 'página de categoría o listado',
      otro: 'página web general'
    };

    const tonePrompts = {
      profesional: 'formal, confiable y experto',
      casual: 'cercano, amigable y conversacional',
      persuasivo: 'convincente, orientado a la acción',
      informativo: 'educativo, claro y directo',
      creativo: 'original, innovador y llamativo',
      urgente: 'inmediato, con sentido de urgencia'
    };

    const languageInstructions = idioma === 'en' 
      ? 'Generate content in English with proper SEO practices for English-speaking markets.'
      : 'Genera contenido en español con las mejores prácticas SEO para mercados hispanohablantes.';

    const emojiInstruction = incluirEmojis 
      ? 'Incluye 1-2 emojis relevantes en el título para mayor atractivo visual.'
      : 'No incluyas emojis en el contenido.';

    const competitionContext = competencia 
      ? `\n- Información sobre competencia: "${competencia}"\n- Diferénciate de la competencia mencionada.`
      : '';

    const prompt = `
Eres un experto en SEO y copywriting digital. Genera un título SEO y meta descripción altamente optimizados.

CONTEXTO DEL PROYECTO:
- Tipo de página: ${contextPrompts[contexto]}
- Tono requerido: ${tonePrompts[tono]}
- Palabra clave principal: "${keyword}"
${nombre ? `- Marca/Negocio: "${nombre}"` : ''}${competitionContext}

ESPECIFICACIONES TÉCNICAS ESTRICTAS:
- Título: 50-60 caracteres (CRÍTICO para Google)
- Meta descripción: 150-160 caracteres (CRÍTICO para snippets)
- Palabra clave debe aparecer naturalmente en ambos
- Optimizar para CTR (Click-Through Rate)
- ${languageInstructions}
- ${emojiInstruction}

MEJORES PRÁCTICAS SEO:
1. Incluir palabra clave en los primeros 30 caracteres del título
2. Usar números, preguntas o palabras de poder cuando sea apropiado
3. Crear urgencia o curiosidad sin ser clickbait
4. Incluir call-to-action sutil en la descripción
5. Evitar keyword stuffing
6. Usar sinónimos y variaciones semánticas

FORMATO DE RESPUESTA (JSON estricto):
{
  "titulo": "título optimizado aquí",
  "descripcion": "descripción optimizada aquí",
  "alternativas": {
    "titulo_2": "segunda opción de título",
    "titulo_3": "tercera opción de título"
  },
  "analisis": {
    "titulo_longitud": número_de_caracteres,
    "descripcion_longitud": número_de_caracteres,
    "keyword_en_titulo": true/false,
    "keyword_en_descripcion": true/false,
    "palabras_poder": ["palabra1", "palabra2"],
    "cta_presente": true/false,
    "puntuacion_seo": número_del_1_al_10
  },
  "sugerencias": ["sugerencia1", "sugerencia2"]
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo más eficiente y económico
      messages: [
        {
          role: 'system',
          content: `Eres un experto en SEO y copywriting digital con más de 10 años de experiencia. 
          Especializas en crear títulos y meta descripciones que maximizan el CTR y mejoran el ranking en buscadores.
          Siempre respondes en formato JSON válido y sigues estrictamente las especificaciones técnicas.`
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Más determinístico para mejor consistencia
      max_tokens: 800,
      response_format: { type: "json_object" } // Forzar respuesta JSON
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Formato de respuesta JSON inválido');
    }
    
    // Validar estructura de respuesta más robusta
    if (!parsed.titulo || !parsed.descripcion) {
      throw new Error('Respuesta incompleta: faltan título o descripción');
    }

    // Validar longitudes
    if (parsed.titulo.length > 70) {
      console.warn('Título excede longitud recomendada:', parsed.titulo.length);
    }
    
    if (parsed.descripcion.length > 170) {
      console.warn('Descripción excede longitud recomendada:', parsed.descripcion.length);
    }

    // Verificar presencia de palabra clave
    const keywordInTitle = parsed.titulo.toLowerCase().includes(keyword.toLowerCase());
    const keywordInDescription = parsed.descripcion.toLowerCase().includes(keyword.toLowerCase());

    // Agregar metadatos y análisis adicional
    const result = {
      ...parsed,
      metadata: {
        timestamp: new Date().toISOString(),
        keyword_original: keyword,
        contexto_original: contexto,
        tono_original: tono,
        nombre_original: nombre || null,
        idioma_original: idioma,
        incluir_emojis: incluirEmojis,
        competencia_original: competencia || null
      },
      validacion: {
        titulo_longitud_ok: parsed.titulo.length <= 60,
        descripcion_longitud_ok: parsed.descripcion.length <= 160,
        keyword_presente_titulo: keywordInTitle,
        keyword_presente_descripcion: keywordInDescription,
        puntuacion_general: keywordInTitle && keywordInDescription && 
                           parsed.titulo.length <= 60 && 
                           parsed.descripcion.length <= 160 ? 'excelente' : 'bueno'
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
    console.error('Error en API SEO:', error);
    
    let errorMessage = 'Ocurrió un error al generar el contenido SEO.';
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    // Errores específicos de OpenAI
    if (error.code === 'invalid_api_key') {
      errorMessage = 'Clave de API de OpenAI inválida.';
      errorCode = 'INVALID_API_KEY';
      statusCode = 500;
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'Cuota de OpenAI agotada. Contacta al administrador.';
      errorCode = 'QUOTA_EXCEEDED';
      statusCode = 503;
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Límite de velocidad excedido. Intenta nuevamente en unos segundos.';
      errorCode = 'RATE_LIMIT';
      statusCode = 429;
    } else if (error.code === 'model_not_found') {
      errorMessage = 'Modelo de IA no disponible temporalmente.';
      errorCode = 'MODEL_ERROR';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Tiempo de espera agotado. La generación tomó demasiado tiempo.';
      errorCode = 'TIMEOUT_ERROR';
      statusCode = 408;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Error procesando la respuesta de IA. Intenta con parámetros diferentes.';
      errorCode = 'PARSING_ERROR';
      statusCode = 500;
    } else if (error.message?.includes('Respuesta incompleta')) {
      errorMessage = 'La IA no pudo generar contenido completo. Intenta nuevamente.';
      errorCode = 'INCOMPLETE_RESPONSE';
      statusCode = 500;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión con el servicio de IA.';
      errorCode = 'NETWORK_ERROR';
      statusCode = 503;
    }

    // Log detallado para debugging
    console.error('SEO API Error Details:', {
      code: error.code,
      message: error.message,
      type: error.type,
      statusCode,
      errorCode
    });

    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        errorCode: error.code,
        errorType: error.type
      } : undefined,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        ...(statusCode === 429 && { 'Retry-After': '60' })
      },
    });
  }
}

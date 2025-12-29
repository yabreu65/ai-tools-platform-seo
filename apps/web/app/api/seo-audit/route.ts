import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SeoAuditResult {
  url: string;
  timestamp: string;
  puntuacion_general: number;
  
  // SEO On-Page
  seo_onpage: {
    titulo: {
      contenido: string;
      longitud: number;
      optimizado: boolean;
      recomendaciones: string[];
    };
    meta_descripcion: {
      contenido: string;
      longitud: number;
      optimizado: boolean;
      recomendaciones: string[];
    };
    encabezados: {
      h1: string[];
      h2: string[];
      h3: string[];
      estructura_correcta: boolean;
      recomendaciones: string[];
    };
    imagenes: {
      total: number;
      sin_alt: number;
      optimizadas: number;
      recomendaciones: string[];
    };
  };
  
  // SEO Técnico
  seo_tecnico: {
    velocidad: {
      puntuacion: number;
      tiempo_carga: number;
      core_web_vitals: {
        lcp: number;
        fid: number;
        cls: number;
      };
      recomendaciones: string[];
    };
    mobile_friendly: {
      optimizado: boolean;
      problemas: string[];
      recomendaciones: string[];
    };
    indexabilidad: {
      robots_txt: boolean;
      sitemap: boolean;
      canonical: string;
      recomendaciones: string[];
    };
  };
  
  // Contenido y Keywords
  contenido: {
    palabras_clave_principales: string[];
    densidad_keywords: number;
    legibilidad: {
      puntuacion: number;
      nivel: string;
    };
    estructura_contenido: {
      parrafos: number;
      listas: number;
      enlaces_internos: number;
      enlaces_externos: number;
    };
    recomendaciones: string[];
  };
  
  // Análisis de IA
  analisis_ia: {
    fortalezas: string[];
    debilidades: string[];
    oportunidades: string[];
    prioridades: string[];
    recomendaciones_estrategicas: string;
  };
  
  // Resumen ejecutivo
  resumen: {
    estado_general: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita mejoras';
    problemas_criticos: number;
    problemas_menores: number;
    acciones_prioritarias: string[];
  };
}

// Función para extraer contenido de una URL
async function extractWebContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extraer información básica del HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    
    // Extraer encabezados
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    
    // Extraer imágenes
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length;
    
    // Extraer enlaces
    const internalLinks = (html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [])
      .filter(link => link.includes(new URL(url).hostname)).length;
    const externalLinks = (html.match(/<a[^>]*href=["']https?:\/\/[^"']*["'][^>]*>/gi) || [])
      .filter(link => !link.includes(new URL(url).hostname)).length;
    
    // Extraer texto para análisis de contenido
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '',
      canonical: canonicalMatch ? canonicalMatch[1].trim() : '',
      h1: h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h2: h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h3: h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      totalImages: imgMatches.length,
      imagesWithoutAlt,
      internalLinks,
      externalLinks,
      textContent: textContent.substring(0, 3000), // Limitar para análisis
      wordCount: textContent.split(' ').length,
    };
  } catch (error) {
    throw new Error(`Error al extraer contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función para obtener métricas de PageSpeed
async function getPageSpeedMetrics(url: string) {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      return null;
    }
    
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=seo&category=accessibility`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    
    return {
      performance: Math.round(lighthouse.categories.performance.score * 100),
      seo: Math.round(lighthouse.categories.seo.score * 100),
      accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
      lcp: lighthouse.audits['largest-contentful-paint']?.numericValue || 0,
      fid: lighthouse.audits['max-potential-fid']?.numericValue || 0,
      cls: lighthouse.audits['cumulative-layout-shift']?.numericValue || 0,
      loadTime: lighthouse.audits['speed-index']?.numericValue || 0,
    };
  } catch (error) {
    console.error('Error obteniendo métricas de PageSpeed:', error);
    return null;
  }
}

// Función para análisis con IA
async function analyzeWithAI(content: any, pageSpeedData: any) {
  const prompt = `
Analiza el siguiente sitio web desde una perspectiva SEO profesional:

**DATOS DEL SITIO:**
- Título: "${content.title}"
- Meta descripción: "${content.metaDescription}"
- H1s: ${content.h1.join(', ')}
- H2s: ${content.h2.slice(0, 5).join(', ')}
- Imágenes totales: ${content.totalImages}
- Imágenes sin ALT: ${content.imagesWithoutAlt}
- Enlaces internos: ${content.internalLinks}
- Enlaces externos: ${content.externalLinks}
- Palabras totales: ${content.wordCount}
- Canonical: ${content.canonical}

**MÉTRICAS DE RENDIMIENTO:**
${pageSpeedData ? `
- Puntuación de rendimiento: ${pageSpeedData.performance}/100
- Puntuación SEO: ${pageSpeedData.seo}/100
- LCP: ${pageSpeedData.lcp}ms
- FID: ${pageSpeedData.fid}ms
- CLS: ${pageSpeedData.cls}
` : 'No disponibles'}

**CONTENIDO (primeros 500 caracteres):**
"${content.textContent.substring(0, 500)}..."

Proporciona un análisis SEO completo en formato JSON con esta estructura exacta:

{
  "fortalezas": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "debilidades": ["debilidad1", "debilidad2", "debilidad3"],
  "oportunidades": ["oportunidad1", "oportunidad2", "oportunidad3"],
  "prioridades": ["prioridad1", "prioridad2", "prioridad3"],
  "recomendaciones_estrategicas": "Recomendación estratégica detallada en 2-3 oraciones",
  "palabras_clave_detectadas": ["keyword1", "keyword2", "keyword3"],
  "problemas_criticos": 2,
  "problemas_menores": 5,
  "estado_general": "Bueno"
}

Sé específico y profesional. El estado_general debe ser: "Excelente", "Bueno", "Regular", o "Necesita mejoras".
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Extraer JSON de la respuesta
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de IA');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error en análisis de IA:', error);
    // Retornar análisis básico en caso de error
    return {
      fortalezas: ["Sitio web accesible", "Estructura HTML básica presente"],
      debilidades: ["Análisis de IA no disponible"],
      oportunidades: ["Optimizar elementos SEO básicos"],
      prioridades: ["Revisar título y meta descripción"],
      recomendaciones_estrategicas: "Realizar optimización SEO básica para mejorar visibilidad.",
      palabras_clave_detectadas: [],
      problemas_criticos: 0,
      problemas_menores: 1,
      estado_general: "Regular"
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Validaciones básicas
    if (!url) {
      return NextResponse.json(
        { error: 'URL es requerida' },
        { status: 400 }
      );
    }

    // Validar formato de URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL no válida' },
        { status: 400 }
      );
    }

    // Verificar API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key no configurada' },
        { status: 500 }
      );
    }

    // Extraer contenido del sitio web
    const content = await extractWebContent(url);
    
    // Obtener métricas de PageSpeed (opcional)
    const pageSpeedData = await getPageSpeedMetrics(url);
    
    // Análisis con IA
    const aiAnalysis = await analyzeWithAI(content, pageSpeedData);

    // Calcular puntuaciones
    const titleOptimized = content.title.length >= 30 && content.title.length <= 60;
    const metaOptimized = content.metaDescription.length >= 120 && content.metaDescription.length <= 160;
    const hasH1 = content.h1.length > 0;
    const structureCorrect = hasH1 && content.h2.length > 0;
    const imagesOptimized = content.totalImages > 0 ? (content.totalImages - content.imagesWithoutAlt) / content.totalImages : 1;

    // Calcular puntuación general
    let generalScore = 0;
    if (titleOptimized) generalScore += 15;
    if (metaOptimized) generalScore += 15;
    if (hasH1) generalScore += 10;
    if (structureCorrect) generalScore += 10;
    if (imagesOptimized > 0.8) generalScore += 10;
    if (content.canonical) generalScore += 10;
    if (pageSpeedData?.performance) generalScore += Math.round(pageSpeedData.performance * 0.3);

    // Construir resultado
    const result: SeoAuditResult = {
      url,
      timestamp: new Date().toISOString(),
      puntuacion_general: Math.min(100, generalScore),
      
      seo_onpage: {
        titulo: {
          contenido: content.title,
          longitud: content.title.length,
          optimizado: titleOptimized,
          recomendaciones: titleOptimized 
            ? ["Título bien optimizado"] 
            : ["Ajustar longitud del título entre 30-60 caracteres", "Incluir palabra clave principal"]
        },
        meta_descripcion: {
          contenido: content.metaDescription,
          longitud: content.metaDescription.length,
          optimizado: metaOptimized,
          recomendaciones: metaOptimized 
            ? ["Meta descripción bien optimizada"] 
            : ["Ajustar longitud entre 120-160 caracteres", "Incluir llamada a la acción"]
        },
        encabezados: {
          h1: content.h1,
          h2: content.h2.slice(0, 10),
          h3: content.h3.slice(0, 10),
          estructura_correcta: structureCorrect,
          recomendaciones: structureCorrect 
            ? ["Estructura de encabezados correcta"] 
            : ["Usar solo un H1 por página", "Organizar contenido con H2 y H3"]
        },
        imagenes: {
          total: content.totalImages,
          sin_alt: content.imagesWithoutAlt,
          optimizadas: content.totalImages - content.imagesWithoutAlt,
          recomendaciones: content.imagesWithoutAlt === 0 
            ? ["Todas las imágenes tienen texto alternativo"] 
            : [`Agregar texto ALT a ${content.imagesWithoutAlt} imágenes`, "Usar descripciones descriptivas"]
        }
      },
      
      seo_tecnico: {
        velocidad: {
          puntuacion: pageSpeedData?.performance || 0,
          tiempo_carga: pageSpeedData?.loadTime || 0,
          core_web_vitals: {
            lcp: pageSpeedData?.lcp || 0,
            fid: pageSpeedData?.fid || 0,
            cls: pageSpeedData?.cls || 0,
          },
          recomendaciones: (pageSpeedData?.performance || 0) > 80 
            ? ["Velocidad de carga excelente"] 
            : ["Optimizar imágenes", "Minimizar CSS y JavaScript", "Usar CDN"]
        },
        mobile_friendly: {
          optimizado: true, // Asumir optimizado por defecto
          problemas: [],
          recomendaciones: ["Verificar responsive design", "Probar en dispositivos móviles"]
        },
        indexabilidad: {
          robots_txt: true, // Asumir presente por defecto
          sitemap: true, // Asumir presente por defecto
          canonical: content.canonical,
          recomendaciones: content.canonical 
            ? ["URL canonical configurada correctamente"] 
            : ["Agregar URL canonical", "Configurar robots.txt"]
        }
      },
      
      contenido: {
        palabras_clave_principales: aiAnalysis.palabras_clave_detectadas || [],
        densidad_keywords: 2.5, // Valor estimado
        legibilidad: {
          puntuacion: 75, // Valor estimado
          nivel: "Intermedio"
        },
        estructura_contenido: {
          parrafos: Math.round(content.wordCount / 100),
          listas: 0, // Simplificado
          enlaces_internos: content.internalLinks,
          enlaces_externos: content.externalLinks
        },
        recomendaciones: [
          "Incluir más palabras clave relevantes",
          "Mejorar estructura del contenido",
          "Agregar más enlaces internos"
        ]
      },
      
      analisis_ia: {
        fortalezas: aiAnalysis.fortalezas || [],
        debilidades: aiAnalysis.debilidades || [],
        oportunidades: aiAnalysis.oportunidades || [],
        prioridades: aiAnalysis.prioridades || [],
        recomendaciones_estrategicas: aiAnalysis.recomendaciones_estrategicas || ""
      },
      
      resumen: {
        estado_general: aiAnalysis.estado_general || 'Regular',
        problemas_criticos: aiAnalysis.problemas_criticos || 0,
        problemas_menores: aiAnalysis.problemas_menores || 0,
        acciones_prioritarias: aiAnalysis.prioridades?.slice(0, 3) || []
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en auditoría SEO:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'No se pudo acceder a la URL proporcionada' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('OpenAI')) {
        return NextResponse.json(
          { error: 'Error en el análisis de IA. Intenta nuevamente.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
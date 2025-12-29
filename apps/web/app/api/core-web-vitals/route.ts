import { NextRequest, NextResponse } from 'next/server';

interface PageSpeedResponse {
  lighthouseResult: {
    audits: {
      'largest-contentful-paint': { displayValue: string; score: number };
      'cumulative-layout-shift': { displayValue: string; score: number };
      'interaction-to-next-paint': { displayValue: string; score: number };
      'first-contentful-paint': { displayValue: string; score: number };
      'speed-index': { displayValue: string; score: number };
    };
    categories: {
      performance: { score: number };
    };
  };
  loadingExperience?: {
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number; category: string };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile: number; category: string };
      INTERACTION_TO_NEXT_PAINT?: { percentile: number; category: string };
    };
  };
}

interface CoreWebVitalsResult {
  url: string;
  timestamp: string;
  puntuacion_general: number;
  
  metricas_laboratorio: {
    lcp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    cls: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    inp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    fcp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    si: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
  };
  
  metricas_campo?: {
    lcp?: {
      valor: number;
      categoria: string;
    };
    cls?: {
      valor: number;
      categoria: string;
    };
    inp?: {
      valor: number;
      categoria: string;
    };
  };
  
  recomendaciones: {
    criticas: string[];
    importantes: string[];
    sugerencias: string[];
  };
  
  resumen: {
    estado_general: 'excelente' | 'bueno' | 'necesita_mejoras' | 'pobre';
    problemas_detectados: number;
    oportunidades_mejora: string[];
  };
}

function parseMetricValue(displayValue: string): number {
  // Extraer número del string (ej: "2.5 s" -> 2.5, "0.12" -> 0.12)
  const match = displayValue.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function getMetricStatus(metric: string, value: number): 'bueno' | 'necesita_mejora' | 'pobre' {
  switch (metric) {
    case 'lcp':
      if (value <= 2.5) return 'bueno';
      if (value <= 4.0) return 'necesita_mejora';
      return 'pobre';
    case 'cls':
      if (value <= 0.1) return 'bueno';
      if (value <= 0.25) return 'necesita_mejora';
      return 'pobre';
    case 'inp':
      if (value <= 200) return 'bueno';
      if (value <= 500) return 'necesita_mejora';
      return 'pobre';
    case 'fcp':
      if (value <= 1.8) return 'bueno';
      if (value <= 3.0) return 'necesita_mejora';
      return 'pobre';
    case 'si':
      if (value <= 3.4) return 'bueno';
      if (value <= 5.8) return 'necesita_mejora';
      return 'pobre';
    default:
      return 'pobre';
  }
}

function generateRecommendations(metricas: any): { criticas: string[]; importantes: string[]; sugerencias: string[] } {
  const criticas: string[] = [];
  const importantes: string[] = [];
  const sugerencias: string[] = [];

  // LCP recomendaciones
  if (metricas.lcp.estado === 'pobre') {
    criticas.push('Optimizar el Largest Contentful Paint: reducir tamaño de imágenes, usar CDN, mejorar servidor');
  } else if (metricas.lcp.estado === 'necesita_mejora') {
    importantes.push('Mejorar tiempo de carga: comprimir imágenes, usar formatos modernos (WebP, AVIF)');
  }

  // CLS recomendaciones
  if (metricas.cls.estado === 'pobre') {
    criticas.push('Corregir Cumulative Layout Shift: definir dimensiones de imágenes y videos, evitar insertar contenido dinámico');
  } else if (metricas.cls.estado === 'necesita_mejora') {
    importantes.push('Estabilizar layout: usar aspect-ratio CSS, reservar espacio para anuncios');
  }

  // INP recomendaciones
  if (metricas.inp.estado === 'pobre') {
    criticas.push('Mejorar Interaction to Next Paint: optimizar JavaScript, reducir tareas largas, usar web workers');
  } else if (metricas.inp.estado === 'necesita_mejora') {
    importantes.push('Acelerar interactividad: dividir código JavaScript, usar lazy loading');
  }

  // FCP recomendaciones
  if (metricas.fcp.estado === 'pobre') {
    importantes.push('Optimizar First Contentful Paint: eliminar recursos que bloquean renderizado, usar preload para recursos críticos');
  }

  // Sugerencias generales
  sugerencias.push('Implementar Service Worker para cache');
  sugerencias.push('Usar HTTP/2 o HTTP/3 para mejor rendimiento');
  sugerencias.push('Optimizar CSS crítico y diferir CSS no crítico');
  sugerencias.push('Monitorear métricas regularmente con herramientas como Search Console');

  return { criticas, importantes, sugerencias };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL es requerida' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Llamar a Google PageSpeed Insights API
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(pageSpeedUrl, {
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('PageSpeed API error:', response.status, errorText);

      // Mensajes de error específicos
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Límite de consultas excedido. Por favor, configura GOOGLE_PAGESPEED_API_KEY en .env.local o intenta más tarde.' },
          { status: 429 }
        );
      }
      if (response.status === 400) {
        return NextResponse.json(
          { error: 'URL no válida o no accesible para PageSpeed Insights' },
          { status: 400 }
        );
      }
      throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
    }

    const data: PageSpeedResponse = await response.json();

    // Validar que la respuesta tenga la estructura esperada
    if (!data.lighthouseResult || !data.lighthouseResult.audits || !data.lighthouseResult.categories) {
      throw new Error('Respuesta de PageSpeed Insights incompleta o inválida');
    }
    
    // Extraer métricas
    const audits = data.lighthouseResult.audits;
    const performanceScore = Math.round((data.lighthouseResult.categories.performance.score || 0) * 100);

    // Procesar métricas de laboratorio
    const lcpValue = parseMetricValue(audits['largest-contentful-paint']?.displayValue || '0');
    const clsValue = parseMetricValue(audits['cumulative-layout-shift']?.displayValue || '0');
    const inpValue = parseMetricValue(audits['interaction-to-next-paint']?.displayValue || '0');
    const fcpValue = parseMetricValue(audits['first-contentful-paint']?.displayValue || '0');
    const siValue = parseMetricValue(audits['speed-index']?.displayValue || '0');

    const metricas_laboratorio = {
      lcp: {
        valor: lcpValue,
        unidad: 's',
        estado: getMetricStatus('lcp', lcpValue),
        puntuacion: Math.round((audits['largest-contentful-paint']?.score || 0) * 100)
      },
      cls: {
        valor: clsValue,
        unidad: '',
        estado: getMetricStatus('cls', clsValue),
        puntuacion: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100)
      },
      inp: {
        valor: inpValue,
        unidad: 'ms',
        estado: getMetricStatus('inp', inpValue),
        puntuacion: Math.round((audits['interaction-to-next-paint']?.score || 0) * 100)
      },
      fcp: {
        valor: fcpValue,
        unidad: 's',
        estado: getMetricStatus('fcp', fcpValue),
        puntuacion: Math.round((audits['first-contentful-paint']?.score || 0) * 100)
      },
      si: {
        valor: siValue,
        unidad: 's',
        estado: getMetricStatus('si', siValue),
        puntuacion: Math.round((audits['speed-index']?.score || 0) * 100)
      }
    };

    // Procesar métricas de campo (si están disponibles)
    let metricas_campo;
    if (data.loadingExperience?.metrics) {
      const fieldMetrics = data.loadingExperience.metrics;
      metricas_campo = {
        ...(fieldMetrics.LARGEST_CONTENTFUL_PAINT_MS && {
          lcp: {
            valor: fieldMetrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
            categoria: fieldMetrics.LARGEST_CONTENTFUL_PAINT_MS.category
          }
        }),
        ...(fieldMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE && {
          cls: {
            valor: fieldMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100,
            categoria: fieldMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category
          }
        }),
        ...(fieldMetrics.INTERACTION_TO_NEXT_PAINT && {
          inp: {
            valor: fieldMetrics.INTERACTION_TO_NEXT_PAINT.percentile,
            categoria: fieldMetrics.INTERACTION_TO_NEXT_PAINT.category
          }
        })
      };
    }

    // Generar recomendaciones
    const recomendaciones = generateRecommendations(metricas_laboratorio);

    // Calcular problemas detectados
    const problemas = Object.values(metricas_laboratorio).filter(m => m.estado !== 'bueno').length;

    // Determinar estado general
    let estado_general: 'excelente' | 'bueno' | 'necesita_mejoras' | 'pobre';
    if (performanceScore >= 90) estado_general = 'excelente';
    else if (performanceScore >= 70) estado_general = 'bueno';
    else if (performanceScore >= 50) estado_general = 'necesita_mejoras';
    else estado_general = 'pobre';

    const result: CoreWebVitalsResult = {
      url,
      timestamp: new Date().toISOString(),
      puntuacion_general: performanceScore,
      metricas_laboratorio,
      ...(metricas_campo && { metricas_campo }),
      recomendaciones,
      resumen: {
        estado_general,
        problemas_detectados: problemas,
        oportunidades_mejora: [
          ...recomendaciones.criticas,
          ...recomendaciones.importantes
        ].slice(0, 3)
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en Core Web Vitals API:', error);

    // Mensajes de error más específicos
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        return NextResponse.json(
          { error: 'Tiempo de espera agotado. La página está tardando demasiado en responder.' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: `Error al analizar la página: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
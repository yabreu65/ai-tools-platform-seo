import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  url: string;
  depth?: number;
  includeExternal?: boolean;
  excludePaths?: string[];
  timeout?: number;
}

interface LinkCheck {
  url: string;
  statusCode: number;
  statusText: string;
  foundOn: string[];
  linkText: string;
  type: 'internal' | 'external';
  responseTime?: number;
}

// Almacenamiento temporal en memoria (en producción usarías Redis o DB)
// Usar global para compartir entre diferentes rutas
if (!(global as any).analysisCache) {
  (global as any).analysisCache = new Map<string, any>();
}
const analysisCache = (global as any).analysisCache as Map<string, any>;

async function analyzeLinks(targetUrl: string, includeExternal: boolean, timeout: number) {
  const results: LinkCheck[] = [];
  const visited = new Set<string>();
  const baseUrl = new URL(targetUrl);

  try {
    // Fetch de la página principal
    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(timeout),
      headers: {
        'User-Agent': 'SEO-Tools-Link-Checker/1.0'
      }
    });
    const responseTime = Date.now() - startTime;
    const html = await response.text();

    // Extraer enlaces del HTML
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;

    const links: Array<{ url: string; text: string; type: string }> = [];

    // Extraer enlaces <a>
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ url: match[1], text: match[2] || '', type: 'link' });
    }

    // Extraer imágenes
    while ((match = imgRegex.exec(html)) !== null) {
      links.push({ url: match[1], text: '', type: 'image' });
    }

    // Verificar cada enlace
    for (const link of links) {
      try {
        // Resolver URL relativa a absoluta
        const absoluteUrl = new URL(link.url, targetUrl).href;

        // Filtrar solo URLs HTTP/HTTPS (excluir tel:, mailto:, javascript:, etc.)
        if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://')) {
          continue;
        }

        if (visited.has(absoluteUrl)) continue;
        visited.add(absoluteUrl);

        const isExternal = new URL(absoluteUrl).hostname !== baseUrl.hostname;

        // Skip si es externo y no incluimos externos
        if (isExternal && !includeExternal) continue;

        // Verificar el enlace
        const checkStart = Date.now();
        const checkResponse = await fetch(absoluteUrl, {
          method: 'HEAD', // Más rápido que GET
          signal: AbortSignal.timeout(5000),
          headers: {
            'User-Agent': 'SEO-Tools-Link-Checker/1.0'
          }
        }).catch(() => null);

        const checkTime = Date.now() - checkStart;

        if (!checkResponse || !checkResponse.ok) {
          results.push({
            url: absoluteUrl,
            statusCode: checkResponse?.status || 0,
            statusText: checkResponse?.statusText || 'Connection Failed',
            foundOn: [targetUrl],
            linkText: link.text,
            type: isExternal ? 'external' : 'internal',
            responseTime: checkTime
          });
        }
      } catch (error) {
        // Enlace inválido o error de conexión
        results.push({
          url: link.url,
          statusCode: 0,
          statusText: 'Invalid URL or Connection Error',
          foundOn: [targetUrl],
          linkText: link.text,
          type: 'internal',
          responseTime: 0
        });
      }
    }

    return {
      totalLinks: links.length,
      brokenLinks: results,
      responseTime
    };

  } catch (error) {
    throw new Error(`Error analizando ${targetUrl}: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { url, depth = 1, includeExternal = false, excludePaths = [], timeout = 10000 } = body;

    // Validar URL
    if (!url || !url.trim()) {
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
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Generar ID de análisis
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Iniciar análisis en background
    (async () => {
      try {
        const results = await analyzeLinks(url, includeExternal, timeout);

        // Guardar resultados en cache con el formato correcto para la UI
        analysisCache.set(analysisId, {
          analysisId,
          url,
          completedAt: new Date().toISOString(),
          summary: {
            totalPages: 1,
            totalLinks: results.totalLinks,
            brokenLinks: results.brokenLinks.length,
            workingLinks: results.totalLinks - results.brokenLinks.length,
            externalLinks: results.brokenLinks.filter(l => l.type === 'external').length,
            internalLinks: results.brokenLinks.filter(l => l.type === 'internal').length
          },
          // Transformar formato para que coincida con la UI
          brokenLinks: results.brokenLinks.map(link => ({
            targetUrl: link.url,
            sourceUrl: link.foundOn[0] || url,
            statusCode: link.statusCode,
            errorType: link.statusText,
            linkType: link.type,
            linkText: link.linkText,
            responseTime: link.responseTime
          })),
          warnings: [],
          redirects: []
        });
      } catch (error) {
        console.error('Error in background analysis:', error);
        analysisCache.set(analysisId, {
          error: true,
          message: 'Error durante el análisis'
        });
      }
    })();

    return NextResponse.json({
      success: true,
      data: {
        analysisId,
        status: 'running',
        message: 'Análisis iniciado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en broken-links analyze:', error);
    return NextResponse.json(
      { error: 'Error al iniciar el análisis' },
      { status: 500 }
    );
  }
}

// Nota: analysisCache está disponible globalmente en (global as any).analysisCache
// No se puede exportar directamente en Next.js API Routes

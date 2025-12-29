import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../../db/connect';
import SitemapAnalysis from '../../db/models/SitemapAnalysis';
import { cache, generateCacheKey } from '../../utils/cache';
import { requireSeoAuth, checkPlanLimits, SeoAuthRequest } from '../../middleware/seoAuth';
import { 
  validateSitemapConfig, 
  validateExportFormat, 
  sanitizeUrl, 
  generateUserAgent 
} from '../../utils/seoValidators';

const router = Router();

// Interfaz para la configuración del sitemap
interface SitemapGenerationConfig {
  url: string;
  depth?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  excludePaths?: string[];
  maxUrls?: number;
}

// Interfaz para el resultado del análisis
interface SitemapAnalysisResult {
  status: 'ok' | 'missing' | 'invalid' | 'error';
  message: string;
  sitemap?: string;
  downloadUrl?: string;
  stats?: {
    totalUrls: number;
    internalUrls: number;
    externalUrls: number;
    imageUrls: number;
    videoUrls: number;
    processingTime: number;
    depth: number;
  };
  existingSitemap?: {
    found: boolean;
    valid: boolean;
    urlCount: number;
    issues: string[];
  };
}

// POST /api/generador-sitemap - Generar sitemap
router.post('/', requireSeoAuth, checkPlanLimits('depth'), async (req: Request, res: Response): Promise<void> => {
  const authReq = req as SeoAuthRequest;
  const startTime = Date.now();
  
  // Validar configuración fuera del try para que esté disponible en catch
  const config: SitemapGenerationConfig = {
    url: req.body.url,
    depth: parseInt(req.body.depth) || 3,
    includeImages: req.body.includeImages || false,
    includeVideos: req.body.includeVideos || false,
    excludePaths: req.body.excludePaths || [],
    maxUrls: req.body.maxUrls || authReq.user.planLimits.maxUrlsPerAnalysis
  };

  const validation = validateSitemapConfig(config);
  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: 'Configuración inválida',
      details: validation.errors
    });
    return;
  }
  
  try {
    const sanitizedUrl = sanitizeUrl(config.url);
    const origin = new URL(sanitizedUrl).origin;

    // Generar clave de cache
    const cacheKey = generateCacheKey('sitemap', { 
      origin, 
      depth: config.depth,
      includeImages: config.includeImages,
      includeVideos: config.includeVideos 
    });
    
    // Verificar cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && (cachedResult as any).status !== 'error') {
      console.log(`Cache hit for sitemap: ${sanitizedUrl}`);
      res.json({
        success: true,
        ...cachedResult,
        fromCache: true
      });
      return;
    }

    // Conectar a la base de datos
    await connectDB();
    
    // Analizar sitemap existente
    const existingSitemapAnalysis = await analyzeSitemap(origin);
    
    // Realizar crawling profundo
    const crawledUrls = await performDeepCrawl(sanitizedUrl, config);
    
    const processingTime = Date.now() - startTime;
    
    // Generar sitemap XML
    const sitemapXml = generateSitemapXML(crawledUrls, config);
    
    // Guardar archivo
    const downloadUrl = await saveSitemapFile(sitemapXml);
    
    // Preparar respuesta
    const result: SitemapAnalysisResult = {
      status: existingSitemapAnalysis.found && existingSitemapAnalysis.valid ? 'ok' : 
              existingSitemapAnalysis.found ? 'invalid' : 'missing',
      message: existingSitemapAnalysis.found && existingSitemapAnalysis.valid 
        ? `Tu sitio ya tiene un sitemap válido con ${existingSitemapAnalysis.urlCount} URLs.`
        : existingSitemapAnalysis.found 
          ? `Se detectó un sitemap pero tiene problemas. Se generó uno optimizado con ${crawledUrls.size} URLs.`
          : `No se encontró sitemap. Se generó uno nuevo con ${crawledUrls.size} URLs válidas.`,
      sitemap: sitemapXml,
      downloadUrl,
      stats: {
        totalUrls: crawledUrls.size,
        internalUrls: crawledUrls.size,
        externalUrls: 0,
        imageUrls: 0,
        videoUrls: 0,
        processingTime,
        depth: config.depth || 3
      },
      existingSitemap: {
        found: existingSitemapAnalysis.found,
        valid: existingSitemapAnalysis.valid,
        urlCount: existingSitemapAnalysis.urlCount,
        issues: existingSitemapAnalysis.issues
      }
    };

    // Guardar en base de datos
    await saveSitemapAnalysis(authReq.user.id, sanitizedUrl, result, config);
    
    // Guardar en cache (30 minutos)
    cache.set(cacheKey, result, 30);
    
    res.json({
      success: true,
      ...result
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    console.error('❌ Error generando sitemap:', message);
    
    const processingTime = Date.now() - startTime;
    
    // Guardar error en base de datos
    try {
      await saveSitemapAnalysis(authReq.user.id, config.url, {
        status: 'error',
        message: `Error al procesar: ${message}`,
        stats: {
          totalUrls: 0,
          internalUrls: 0,
          externalUrls: 0,
          imageUrls: 0,
          videoUrls: 0,
          processingTime,
          depth: config.depth || 3
        }
      }, config);
    } catch (dbError) {
      console.error('Error guardando error en BD:', dbError);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'No se pudo generar el sitemap',
      details: message
    });
  }
});

// Funciones auxiliares
async function analyzeSitemap(url: string): Promise<{ found: boolean; valid: boolean; urlCount: number; issues: string[]; content?: string }> {
  try {
    const sitemapUrl = `${url}/sitemap.xml`;
    const response = await axios.get(sitemapUrl, { 
      timeout: 10000,
      headers: { 'User-Agent': generateUserAgent() }
    });
    
    const $ = cheerio.load(String(response.data), { xmlMode: true });
    const urls = $('urlset > url > loc');
    const issues: string[] = [];
    
    if (urls.length === 0) {
      issues.push('No se encontraron URLs en el sitemap');
    }
    
    // Validar estructura XML
    if (!$('urlset').length) {
      issues.push('Estructura XML inválida');
    }
    
    return {
      found: true,
      valid: issues.length === 0,
      urlCount: urls.length,
      issues,
      content: String(response.data)
    };
  } catch (error) {
    return {
      found: false,
      valid: false,
      urlCount: 0,
      issues: ['Sitemap no encontrado o inaccesible']
    };
  }
}

async function performDeepCrawl(
  startUrl: string, 
  config: SitemapGenerationConfig,
  onProgress?: (progress: number, currentUrl: string) => void
): Promise<Set<string>> {
  const visited = new Set<string>();
  const toVisit = [startUrl];
  const maxDepth = Math.min(config.depth || 3, 10);
  const maxUrls = Math.min(config.maxUrls || 1000, 5000);
  const origin = new URL(startUrl).origin;
  const userAgent = generateUserAgent();
  
  let currentDepth = 0;
  
  while (toVisit.length > 0 && visited.size < maxUrls && currentDepth < maxDepth) {
    const currentLevelUrls = [...toVisit];
    toVisit.length = 0;
    
    for (const url of currentLevelUrls) {
      if (visited.has(url) || visited.size >= maxUrls) continue;
      
      try {
        visited.add(url);
        onProgress?.(Math.min((visited.size / maxUrls) * 100, 100), url);
        
        const response = await axios.get(url, {
          timeout: 10000,
          headers: { 'User-Agent': userAgent },
          validateStatus: (status) => status < 400
        });
        
        const $ = cheerio.load(String(response.data));
        
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href || href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('tel:')) return;
          
          let fullUrl: string;
          try {
            fullUrl = new URL(href, url).href.split('#')[0];
          } catch {
            return;
          }
          
          // Solo URLs internas
          if (fullUrl.startsWith(origin) && !visited.has(fullUrl)) {
            // Verificar exclusiones
            const path = new URL(fullUrl).pathname;
            if (config.excludePaths?.some(exclude => path.includes(exclude))) return;
            
            toVisit.push(fullUrl);
          }
        });
        
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`Error crawling ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    currentDepth++;
  }
  
  return visited;
}

function generateSitemapXML(urls: Set<string>, config: SitemapGenerationConfig): string {
  const urlEntries = Array.from(urls).map(url => {
    let entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    return entry;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function saveSitemapFile(sitemapXml: string): Promise<string> {
  const sitemapDir = join(__dirname, '../../public/sitemaps');
  if (!existsSync(sitemapDir)) {
    mkdirSync(sitemapDir, { recursive: true });
  }
  
  const fileId = uuidv4();
  const filePath = join(sitemapDir, `${fileId}.xml`);
  writeFileSync(filePath, sitemapXml);
  
  return `/sitemaps/${fileId}.xml`;
}

async function saveSitemapAnalysis(
  userId: string, 
  url: string, 
  result: Partial<SitemapAnalysisResult>,
  config: SitemapGenerationConfig
): Promise<void> {
  try {
    await connectDB();
    await SitemapAnalysis.create({
      userId,
      url,
      status: result.status,
      message: result.message,
      sitemap: result.sitemap,
      downloadUrl: result.downloadUrl,
      metadata: {
        ...result.stats,
        config: {
          depth: config.depth,
          includeImages: config.includeImages,
          includeVideos: config.includeVideos,
          excludePaths: config.excludePaths,
          maxUrls: config.maxUrls
        }
      }
    });
  } catch (error) {
    console.error('Error guardando análisis:', error);
    throw error;
  }
}

// Ruta para obtener el historial de análisis del usuario
router.get('/history', requireSeoAuth, async (req: Request, res: Response): Promise<void> => {
  const authReq = req as SeoAuthRequest;
  
  try {
    await connectDB();
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const skip = (page - 1) * limit;

    const analyses = await SitemapAnalysis.find({ userId: authReq.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await SitemapAnalysis.countDocuments({ userId: authReq.user.id });

    res.json({
      success: true,
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener el historial' 
    });
  }
});

// Ruta para obtener estadísticas del usuario
router.get('/stats', requireSeoAuth, async (req: Request, res: Response): Promise<void> => {
  const authReq = req as SeoAuthRequest;
  
  try {
    await connectDB();
    
    const monthlyCount = await SitemapAnalysis.getMonthlyCount(authReq.user.id);
    const stats = await SitemapAnalysis.getStats(authReq.user.id);

    res.json({
      success: true,
      monthlyAnalyses: monthlyCount,
      totalStats: stats[0] || {
        total: 0,
        successful: 0,
        failed: 0,
        avgProcessingTime: 0
      },
      planLimits: authReq.user.planLimits
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener las estadísticas' 
    });
  }
});

export default router;

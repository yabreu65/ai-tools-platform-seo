import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Schema de validación para la configuración del sitemap
const SitemapConfigSchema = z.object({
  siteUrl: z.string().url('URL del sitio inválida'),
  crawlDepth: z.number().min(1).max(10).optional().default(2),
  includeImages: z.boolean().optional().default(false),
  includeVideos: z.boolean().optional().default(false),
  excludePatterns: z.array(z.string()).optional().default([]),
  customUrls: z.array(z.string().url('URL personalizada inválida')).optional().default([]),
  changeFreq: z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).optional().default('weekly'),
  priority: z.number().min(0).max(1).optional().default(0.5),
  lastMod: z.boolean().optional().default(true)
});

interface SitemapConfig {
  siteUrl: string;
  crawlDepth?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  excludePatterns?: string[];
  customUrls?: string[];
  changeFreq?: string;
  priority?: number;
  lastMod?: boolean;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
  videos?: Array<{
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc: string;
    duration?: number;
  }>;
}

interface SitemapResult {
  sitemapXml: string;
  urlCount: number;
  imageCount: number;
  videoCount: number;
  isValid: boolean;
  size: number;
  generatedAt: string;
  planUsed?: string;
  limitsApplied?: {
    maxUrls: number;
    maxDepth: number;
    videosAllowed: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (opcional para testing)
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      } catch (error) {
        // Token inválido, continuar sin usuario para testing
        console.warn('Token JWT inválido:', error);
      }
    }

    // Validar y parsear la configuración
    const rawConfig = await request.json();
    const validationResult = SitemapConfigSchema.safeParse(rawConfig);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: 'Datos de configuración inválidos',
          details: errors
        },
        { status: 400 }
      );
    }

    const config = validationResult.data;
    const userPlan = user ? (user as any).plan || 'free' : 'free';

    // Restricciones por plan
    const planLimits = {
      free: { maxUrls: 100, maxDepth: 3, includeVideos: false },
      premium: { maxUrls: 50000, maxDepth: 10, includeVideos: true },
      pro: { maxUrls: 50000, maxDepth: 10, includeVideos: true }
    };
    
    const limits = planLimits[userPlan as keyof typeof planLimits] || planLimits.free;
    
    // Validar restricciones del plan
    if (config.crawlDepth > limits.maxDepth) {
      return NextResponse.json(
        { 
          error: `Profundidad máxima permitida para plan ${userPlan}: ${limits.maxDepth}`,
          currentPlan: userPlan,
          maxDepth: limits.maxDepth
        },
        { status: 403 }
      );
    }
    
    if (config.includeVideos && !limits.includeVideos) {
      return NextResponse.json(
        { 
          error: 'La inclusión de videos requiere un plan Premium o superior',
          currentPlan: userPlan,
          feature: 'includeVideos'
        },
        { status: 403 }
      );
    }

    // Validar dominio del sitio web
    const siteUrl = new URL(config.siteUrl);
    if (!isValidDomain(siteUrl.hostname)) {
      return NextResponse.json(
        { error: 'Dominio del sitio web no válido o no accesible' },
        { status: 400 }
      );
    }

    // Simular crawling del sitio web
    const urls = await crawlWebsite(config, limits.maxUrls);
    
    // Generar XML del sitemap
    const sitemapXml = generateSitemapXml(urls, config);
    
    // Validar el XML generado
    const isValid = validateSitemapXml(sitemapXml);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Error al generar XML válido del sitemap' },
        { status: 500 }
      );
    }
    
    // Calcular estadísticas
    const imageCount = urls.reduce((count, url) => count + (url.images?.length || 0), 0);
    const videoCount = urls.reduce((count, url) => count + (url.videos?.length || 0), 0);
    const sizeInBytes = Buffer.byteLength(sitemapXml, 'utf8');
    
    // Verificar límite de tamaño (50MB máximo)
    if (sizeInBytes > 50 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: 'El sitemap generado excede el límite de tamaño de 50MB',
          currentSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 413 }
      );
    }
    
    const result: SitemapResult = {
      sitemapXml,
      urlCount: urls.length,
      imageCount,
      videoCount,
      isValid,
      size: sizeInBytes,
      generatedAt: new Date().toISOString(),
      planUsed: userPlan,
      limitsApplied: {
        maxUrls: limits.maxUrls,
        maxDepth: limits.maxDepth,
        videosAllowed: limits.includeVideos
      }
    };

    // Registrar uso de la herramienta (opcional)
    if (user) {
      console.log(`Sitemap generado por usuario ${(user as any).id || 'unknown'} - Plan: ${userPlan} - URLs: ${urls.length}`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error generando sitemap:', error);
    
    // Manejo específico de errores
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Formato JSON inválido en la solicitud' },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError && error.message.includes('URL')) {
      return NextResponse.json(
        { error: 'URL proporcionada no es válida' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidDomain(hostname: string): boolean {
  // Validar formato básico del dominio
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!domainRegex.test(hostname)) {
    return false;
  }
  
  // Verificar que no sea localhost o IP local para producción
  if (process.env.NODE_ENV === 'production') {
    const localPatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./
    ];
    
    return !localPatterns.some(pattern => pattern.test(hostname));
  }
  
  return true;
}

async function crawlWebsite(config: SitemapConfig, maxUrls: number): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = [];
  const baseUrl = new URL(config.siteUrl);
  
  // Simular crawling (en una implementación real, esto sería un crawler web)
  const simulatedPages = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/blog',
    '/blog/post-1',
    '/blog/post-2',
    '/products',
    '/products/category-1',
    '/products/category-2',
    '/products/item-1',
    '/products/item-2',
    '/gallery',
    '/faq',
    '/privacy',
    '/terms'
  ];

  // Agregar páginas simuladas basadas en la profundidad
  for (let i = 0; i < Math.min(simulatedPages.length, maxUrls); i++) {
    const page = simulatedPages[i];
    const depth = page.split('/').length - 1;
    
    if (depth <= (config.crawlDepth || 3)) {
      const fullUrl = new URL(page, baseUrl).toString();
      
      // Verificar patrones de exclusión
      if (!shouldExcludeUrl(fullUrl, config.excludePatterns || [])) {
        const url: SitemapUrl = {
          loc: fullUrl,
          changefreq: config.changeFreq,
          priority: calculatePriority(page, config.priority || 0.5),
        };

        if (config.lastMod) {
          url.lastmod = new Date().toISOString().split('T')[0];
        }

        // Agregar imágenes simuladas
        if (config.includeImages && Math.random() > 0.5) {
          url.images = [
            {
              loc: new URL(`/images/image-${i + 1}.jpg`, baseUrl).toString(),
              title: `Imagen ${i + 1}`,
              caption: `Descripción de la imagen ${i + 1}`
            }
          ];
        }

        // Agregar videos simulados (solo para Premium)
        if (config.includeVideos && Math.random() > 0.7) {
          url.videos = [
            {
              thumbnail_loc: new URL(`/videos/thumb-${i + 1}.jpg`, baseUrl).toString(),
              title: `Video ${i + 1}`,
              description: `Descripción del video ${i + 1}`,
              content_loc: new URL(`/videos/video-${i + 1}.mp4`, baseUrl).toString(),
              duration: 120
            }
          ];
        }

        urls.push(url);
      }
    }
  }

  // Agregar URLs personalizadas
  for (const customUrl of config.customUrls || []) {
    if (customUrl.trim() && isValidUrl(customUrl) && urls.length < maxUrls) {
      urls.push({
        loc: customUrl,
        changefreq: config.changeFreq,
        priority: config.priority,
        lastmod: config.lastMod ? new Date().toISOString().split('T')[0] : undefined
      });
    }
  }

  return urls.slice(0, maxUrls);
}

function shouldExcludeUrl(url: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (pattern.trim()) {
      // Convertir patrón simple a regex
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '\\?')
        .replace(/\./g, '\\.');
      
      const regex = new RegExp(regexPattern, 'i');
      if (regex.test(url)) {
        return true;
      }
    }
  }
  return false;
}

function calculatePriority(path: string, basePriority: number): number {
  // Calcular prioridad basada en la profundidad y tipo de página
  const depth = path.split('/').length - 1;
  
  if (path === '/') return 1.0; // Página principal
  if (depth === 1) return Math.min(0.9, basePriority + 0.1); // Páginas principales
  if (depth === 2) return basePriority; // Páginas secundarias
  
  return Math.max(0.1, basePriority - (depth * 0.1)); // Páginas más profundas
}

function generateSitemapXml(urls: SitemapUrl[], config: SitemapConfig): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  
  if (config.includeImages) {
    xml += '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  }
  
  if (config.includeVideos) {
    xml += '\n        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
  }
  
  xml += '>\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }

    // Agregar imágenes
    if (url.images && url.images.length > 0) {
      for (const image of url.images) {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${escapeXml(image.loc)}</image:loc>\n`;
        if (image.title) {
          xml += `      <image:title>${escapeXml(image.title)}</image:title>\n`;
        }
        if (image.caption) {
          xml += `      <image:caption>${escapeXml(image.caption)}</image:caption>\n`;
        }
        xml += '    </image:image>\n';
      }
    }

    // Agregar videos
    if (url.videos && url.videos.length > 0) {
      for (const video of url.videos) {
        xml += '    <video:video>\n';
        xml += `      <video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
        xml += `      <video:description>${escapeXml(video.description)}</video:description>\n`;
        xml += `      <video:content_loc>${escapeXml(video.content_loc)}</video:content_loc>\n`;
        if (video.duration) {
          xml += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        xml += '    </video:video>\n';
      }
    }

    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function validateSitemapXml(xml: string): boolean {
  try {
    // Validaciones básicas
    if (!xml.includes('<?xml version="1.0"')) return false;
    if (!xml.includes('<urlset')) return false;
    if (!xml.includes('</urlset>')) return false;
    if (!xml.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) return false;
    
    // Verificar que tenga al menos una URL
    if (!xml.includes('<url>')) return false;
    
    // Verificar estructura básica
    const urlCount = (xml.match(/<url>/g) || []).length;
    const urlEndCount = (xml.match(/<\/url>/g) || []).length;
    
    return urlCount === urlEndCount && urlCount > 0;
  } catch {
    return false;
  }
}
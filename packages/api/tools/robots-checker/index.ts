import { Router, Request, Response } from 'express';
import axios from 'axios';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../../db/connect';
import RobotsAnalysis from '../../db/models/RobotsAnalysis';
import { cache, generateCacheKey } from '../../utils/cache';
import { requireSeoAuth, checkPlanLimits, SeoAuthRequest } from '../../middleware/seoAuth';
import { 
  validateRobotsConfig, 
  validateExportFormat, 
  sanitizeUrl, 
  generateUserAgent 
} from '../../utils/seoValidators';

const router = Router();

// Interfaces
interface RobotsGenerationConfig {
  url: string;
  template?: 'basic' | 'ecommerce' | 'blog' | 'corporate' | 'custom';
  siteType?: string;
  includeSitemap?: boolean;
  crawlDelay?: number;
  customRules?: Array<{
    userAgent: string;
    disallow?: string[];
    allow?: string[];
    crawlDelay?: number;
  }>;
  excludePaths?: string[];
  allowPaths?: string[];
}

interface RobotsAnalysisResult {
  status: 'ok' | 'missing' | 'invalid' | 'error';
  message: string;
  content?: string; // Para compatibilidad con el frontend
  robotsContent?: string;
  downloadUrl?: string;
  analysis?: {
    hasUserAgent: boolean;
    hasDisallow: boolean;
    hasSitemap: boolean;
    hasAllowDirective: boolean;
    hasCrawlDelay: boolean;
    userAgents: string[];
    sitemaps: string[];
    disallowedPaths: string[];
    allowedPaths: string[];
    issues: string[];
    recommendations: string[];
  };
  existingRobots?: {
    found: boolean;
    valid: boolean;
    fileSize: number;
    issues: string[];
  };
}

// Ruta principal para análisis y generación de robots.txt
router.post('/', requireSeoAuth, checkPlanLimits('export'), async (req: Request, res: Response): Promise<void> => {
  const authReq = req as SeoAuthRequest;
  const startTime = Date.now();
  
  try {
    // Validar configuración
    const config: RobotsGenerationConfig = {
      url: req.body.url,
      template: req.body.template || 'basic',
      siteType: req.body.siteType || 'other',
      includeSitemap: req.body.includeSitemap !== false,
      crawlDelay: req.body.crawlDelay,
      customRules: req.body.customRules || [],
      excludePaths: req.body.excludePaths || [],
      allowPaths: req.body.allowPaths || []
    };

    // Validar la configuración usando la función de validación
    const robotsConfigForValidation = {
      siteUrl: config.url,
      siteType: config.siteType || 'other',
      disallowPaths: config.excludePaths,
      allowPaths: config.allowPaths,
      crawlDelay: config.crawlDelay,
      userAgents: ['*']
    };
    
    const validation = validateRobotsConfig(robotsConfigForValidation);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Configuración inválida',
        details: validation.errors
      });
      return;
    }

    const sanitizedUrl = sanitizeUrl(config.url);
    const origin = new URL(sanitizedUrl).origin;
    
    // Generar clave de caché
    const cacheKey = generateCacheKey('robots', {
      url: origin,
      template: config.template,
      siteType: config.siteType,
      userId: authReq.user.id
    });
    
    // Verificar caché
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Resultado desde caché para:', origin);
      res.json({ success: true, ...cachedResult });
      return;
    }
    
    console.log('🔍 Analizando robots.txt para:', origin);
    
    // Analizar robots.txt existente
    const existingAnalysis = await analyzeExistingRobots(origin);
    
    let result: RobotsAnalysisResult;
    
    if (existingAnalysis.found && existingAnalysis.valid && !config.template) {
      // Robots.txt válido encontrado
      result = {
        status: 'ok',
        message: `Tu sitio ya tiene un archivo robots.txt válido con ${existingAnalysis.analysis?.userAgents.length || 0} user-agent(s) configurados.`,
        content: existingAnalysis.content,
        robotsContent: existingAnalysis.content,
        analysis: existingAnalysis.analysis,
        existingRobots: {
          found: true,
          valid: true,
          fileSize: existingAnalysis.content?.length || 0,
          issues: existingAnalysis.analysis?.issues || []
        }
      };
    } else {
      // Generar nuevo robots.txt
      const generatedRobots = generateRobotsContent(config, origin);
      const downloadUrl = await saveRobotsFile(generatedRobots);

      result = {
        status: existingAnalysis.found ? 'invalid' : 'missing',
        message: existingAnalysis.found
          ? 'Se detectó un robots.txt pero tiene problemas. Aquí tienes uno optimizado.'
          : 'No se encontró robots.txt. Se generó uno optimizado para tu sitio.',
        content: generatedRobots,
        robotsContent: generatedRobots,
        downloadUrl,
        analysis: analyzeRobotsContent(generatedRobots),
        existingRobots: {
          found: existingAnalysis.found,
          valid: existingAnalysis.valid,
          fileSize: existingAnalysis.content?.length || 0,
          issues: existingAnalysis.analysis?.issues || []
        }
      };
    }
    
    const processingTime = Date.now() - startTime;
    
    // Guardar en base de datos
    await saveRobotsAnalysis(authReq.user.id, config.url, result, config, processingTime);
    
    // Guardar en caché (15 minutos)
    cache.set(cacheKey, result, 15);
    
    console.log('✅ Análisis completado en', processingTime, 'ms');
    res.json({ success: true, ...result });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    console.error('❌ Error analizando robots.txt:', message);
    
    const processingTime = Date.now() - startTime;
    
    // Guardar error en base de datos
    try {
      await saveRobotsAnalysis(authReq.user.id, req.body.url, {
        status: 'error',
        message: `Error al procesar: ${message}`
      }, req.body, processingTime);
    } catch (dbError) {
      console.error('Error guardando error en BD:', dbError);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'No se pudo analizar el robots.txt',
      details: message
    });
  }
});

// Funciones auxiliares
async function analyzeExistingRobots(url: string): Promise<{
  found: boolean;
  valid: boolean;
  content?: string;
  analysis?: any;
}> {
  try {
    const robotsUrl = `${url}/robots.txt`;
    const response = await axios.get(robotsUrl, { 
      timeout: 10000,
      headers: { 'User-Agent': generateUserAgent() }
    });
    
    const content = String(response.data);
    const analysis = analyzeRobotsContent(content);
    
    // Validar si es un robots.txt válido
    const isValid = analysis.hasUserAgent && content.trim().length > 0;
    
    return {
      found: true,
      valid: isValid,
      content,
      analysis
    };
  } catch (error) {
    return {
      found: false,
      valid: false
    };
  }
}

function analyzeRobotsContent(content: string) {
  const lines = content.split('\n').map(line => line.trim());
  const analysis = {
    hasUserAgent: false,
    hasDisallow: false,
    hasSitemap: false,
    hasAllowDirective: false,
    hasCrawlDelay: false,
    userAgents: [] as string[],
    sitemaps: [] as string[],
    disallowedPaths: [] as string[],
    allowedPaths: [] as string[],
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.startsWith('user-agent:')) {
      analysis.hasUserAgent = true;
      const userAgent = line.substring(11).trim();
      if (userAgent && !analysis.userAgents.includes(userAgent)) {
        analysis.userAgents.push(userAgent);
      }
    } else if (lowerLine.startsWith('disallow:')) {
      analysis.hasDisallow = true;
      const path = line.substring(9).trim();
      if (path && !analysis.disallowedPaths.includes(path)) {
        analysis.disallowedPaths.push(path);
      }
    } else if (lowerLine.startsWith('allow:')) {
      analysis.hasAllowDirective = true;
      const path = line.substring(6).trim();
      if (path && !analysis.allowedPaths.includes(path)) {
        analysis.allowedPaths.push(path);
      }
    } else if (lowerLine.startsWith('sitemap:')) {
      analysis.hasSitemap = true;
      const sitemap = line.substring(8).trim();
      if (sitemap && !analysis.sitemaps.includes(sitemap)) {
        analysis.sitemaps.push(sitemap);
      }
    } else if (lowerLine.startsWith('crawl-delay:')) {
      analysis.hasCrawlDelay = true;
    }
  }
  
  // Generar issues y recomendaciones
  if (!analysis.hasUserAgent) {
    analysis.issues.push('No se encontró directiva User-agent');
    analysis.recommendations.push('Agregar al menos una directiva User-agent');
  }
  
  if (!analysis.hasSitemap) {
    analysis.recommendations.push('Considerar agregar la URL del sitemap');
  }
  
  if (analysis.userAgents.length === 0) {
    analysis.issues.push('No hay user-agents válidos definidos');
  }
  
  return analysis;
}

function generateRobotsContent(config: RobotsGenerationConfig, origin: string): string {
  const template = config.template || 'basic';
  let robotsContent = '';
  
  switch (template) {
    case 'ecommerce':
      robotsContent = generateEcommerceRobots(origin, config);
      break;
    case 'blog':
      robotsContent = generateBlogRobots(origin, config);
      break;
    case 'corporate':
      robotsContent = generateCorporateRobots(origin, config);
      break;
    case 'custom':
      robotsContent = generateCustomRobots(origin, config);
      break;
    default:
      robotsContent = generateBasicRobots(origin, config);
  }
  
  return robotsContent;
}

function generateBasicRobots(origin: string, config: RobotsGenerationConfig): string {
  let content = 'User-agent: *\n';
  
  // Agregar exclusiones básicas
  const defaultExcludes = ['/admin/', '/private/', '/temp/', '/cache/'];
  const excludes = [...defaultExcludes, ...(config.excludePaths || [])];
  
  excludes.forEach(path => {
    content += `Disallow: ${path}\n`;
  });
  
  // Agregar crawl delay si se especifica
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  content += '\n';
  
  // Agregar sitemap si se solicita
  if (config.includeSitemap !== false) {
    content += `Sitemap: ${origin}/sitemap.xml\n`;
  }
  
  return content;
}

function generateEcommerceRobots(origin: string, config: RobotsGenerationConfig): string {
  let content = 'User-agent: *\n';
  
  // Exclusiones específicas para e-commerce
  const ecommerceExcludes = [
    '/admin/',
    '/cart/',
    '/checkout/',
    '/account/',
    '/login/',
    '/register/',
    '/search/',
    '/api/',
    '/private/',
    '/temp/',
    '/cache/',
    '/*?*',  // URLs con parámetros
    ...(config.excludePaths || [])
  ];
  
  ecommerceExcludes.forEach(path => {
    content += `Disallow: ${path}\n`;
  });
  
  // Permitir acceso a productos y categorías
  const allowPaths = ['/products/', '/categories/', '/brands/', ...(config.allowPaths || [])];
  allowPaths.forEach(path => {
    content += `Allow: ${path}\n`;
  });
  
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  content += '\n';
  
  // Configuración específica para bots de compras
  content += 'User-agent: Googlebot\n';
  content += 'Allow: /products/\n';
  content += 'Allow: /categories/\n';
  content += '\n';
  
  if (config.includeSitemap !== false) {
    content += `Sitemap: ${origin}/sitemap.xml\n`;
    content += `Sitemap: ${origin}/products-sitemap.xml\n`;
  }
  
  return content;
}

function generateBlogRobots(origin: string, config: RobotsGenerationConfig): string {
  let content = 'User-agent: *\n';
  
  // Exclusiones específicas para blogs
  const blogExcludes = [
    '/admin/',
    '/wp-admin/',
    '/wp-includes/',
    '/wp-content/plugins/',
    '/wp-content/themes/',
    '/author/',
    '/tag/',
    '/search/',
    '/feed/',
    '/comments/',
    '/trackback/',
    '/private/',
    '/temp/',
    '/cache/',
    ...(config.excludePaths || [])
  ];
  
  blogExcludes.forEach(path => {
    content += `Disallow: ${path}\n`;
  });
  
  // Permitir acceso a contenido público
  const allowPaths = ['/posts/', '/articles/', '/blog/', ...(config.allowPaths || [])];
  allowPaths.forEach(path => {
    content += `Allow: ${path}\n`;
  });
  
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  content += '\n';
  
  if (config.includeSitemap !== false) {
    content += `Sitemap: ${origin}/sitemap.xml\n`;
    content += `Sitemap: ${origin}/posts-sitemap.xml\n`;
  }
  
  return content;
}

function generateCorporateRobots(origin: string, config: RobotsGenerationConfig): string {
  let content = 'User-agent: *\n';
  
  // Exclusiones específicas para sitios corporativos
  const corporateExcludes = [
    '/admin/',
    '/private/',
    '/internal/',
    '/staff/',
    '/employee/',
    '/confidential/',
    '/temp/',
    '/cache/',
    '/api/',
    '/login/',
    '/dashboard/',
    ...(config.excludePaths || [])
  ];
  
  corporateExcludes.forEach(path => {
    content += `Disallow: ${path}\n`;
  });
  
  // Permitir acceso a contenido público
  const allowPaths = ['/about/', '/services/', '/contact/', '/news/', ...(config.allowPaths || [])];
  allowPaths.forEach(path => {
    content += `Allow: ${path}\n`;
  });
  
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  content += '\n';
  
  if (config.includeSitemap !== false) {
    content += `Sitemap: ${origin}/sitemap.xml\n`;
  }
  
  return content;
}

function generateCustomRobots(origin: string, config: RobotsGenerationConfig): string {
  let content = '';
  
  if (config.customRules && config.customRules.length > 0) {
    config.customRules.forEach(rule => {
      content += `User-agent: ${rule.userAgent}\n`;
      
      if (rule.disallow) {
        rule.disallow.forEach(path => {
          content += `Disallow: ${path}\n`;
        });
      }
      
      if (rule.allow) {
        rule.allow.forEach(path => {
          content += `Allow: ${path}\n`;
        });
      }
      
      if (rule.crawlDelay) {
        content += `Crawl-delay: ${rule.crawlDelay}\n`;
      }
      
      content += '\n';
    });
  } else {
    // Fallback a robots básico
    content = generateBasicRobots(origin, config);
  }
  
  if (config.includeSitemap !== false) {
    content += `Sitemap: ${origin}/sitemap.xml\n`;
  }
  
  return content;
}

async function saveRobotsFile(robotsContent: string): Promise<string> {
  const robotsDir = join(__dirname, '../../public/robots');
  if (!existsSync(robotsDir)) {
    mkdirSync(robotsDir, { recursive: true });
  }
  
  const fileId = uuidv4();
  const filePath = join(robotsDir, `${fileId}.txt`);
  writeFileSync(filePath, robotsContent);
  
  return `/robots/${fileId}.txt`;
}

async function saveRobotsAnalysis(
  userId: string, 
  url: string, 
  result: Partial<RobotsAnalysisResult>,
  config: RobotsGenerationConfig,
  processingTime: number
): Promise<void> {
  try {
    await connectDB();
    await RobotsAnalysis.create({
      userId,
      url,
      status: result.status,
      message: result.message,
      robotsContent: result.robotsContent,
      downloadUrl: result.downloadUrl,
      analysis: result.analysis,
      generationConfig: {
        template: config.template,
        siteType: config.siteType,
        customRules: config.customRules,
        includeSitemap: config.includeSitemap,
        crawlDelay: config.crawlDelay
      },
      metadata: {
        fileSize: result.robotsContent?.length || 0,
        processingTime
      }
    });
  } catch (error) {
    console.error('Error guardando análisis de robots:', error);
    throw error;
  }
}

// Ruta para obtener plantillas disponibles
router.get('/templates', (req: Request, res: Response): void => {
  const templates = {
    basic: {
      name: 'Básico',
      description: 'Configuración básica para sitios web generales',
      features: ['Exclusiones estándar', 'Sitemap incluido', 'Configuración simple']
    },
    ecommerce: {
      name: 'E-commerce',
      description: 'Optimizado para tiendas online',
      features: ['Protege checkout y cuentas', 'Permite productos', 'Múltiples sitemaps']
    },
    blog: {
      name: 'Blog',
      description: 'Configuración para blogs y sitios de contenido',
      features: ['Excluye admin de WordPress', 'Permite contenido público', 'Sitemap de posts']
    },
    corporate: {
      name: 'Corporativo',
      description: 'Para sitios web empresariales',
      features: ['Protege áreas internas', 'Permite contenido público', 'Configuración profesional']
    },
    custom: {
      name: 'Personalizado',
      description: 'Configuración completamente personalizable',
      features: ['Reglas personalizadas', 'Control total', 'Múltiples user-agents']
    }
  };
  
  res.json({ success: true, templates });
});

// Ruta para obtener el historial de análisis del usuario
router.get('/history', requireSeoAuth, async (req: Request, res: Response): Promise<void> => {
  const authReq = req as SeoAuthRequest;
  
  try {
    await connectDB();
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const skip = (page - 1) * limit;

    const analyses = await RobotsAnalysis.find({ userId: authReq.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await RobotsAnalysis.countDocuments({ userId: authReq.user.id });

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
    console.error('Error obteniendo historial de robots:', error);
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
    
    const monthlyCount = await RobotsAnalysis.getMonthlyCount(authReq.user.id);
    const stats = await RobotsAnalysis.getStats(authReq.user.id);

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
    console.error('Error obteniendo estadísticas de robots:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener las estadísticas' 
    });
  }
});

export default router;
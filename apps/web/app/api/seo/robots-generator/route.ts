import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface RobotsConfig {
  siteUrl: string;
  siteType: string;
  allowAll?: boolean;
  disallowedPaths?: string[];
  allowedPaths?: string[];
  crawlDelay?: number;
  sitemapUrl?: string;
  customRules?: string[];
  includeSitemap?: boolean;
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
      }
    }

    const config: RobotsConfig = await request.json();

    // Validar datos requeridos
    if (!config.siteUrl) {
      return NextResponse.json(
        { error: 'La URL del sitio es requerida' },
        { status: 400 }
      );
    }

    // Normalizar URL
    const siteUrl = config.siteUrl.replace(/\/$/, '');

    // Generar contenido del robots.txt
    let robotsContent = '';

    // User-agent principal
    if (config.allowAll) {
      robotsContent += 'User-agent: *\n';
    } else {
      robotsContent += 'User-agent: *\n';
    }

    // Rutas permitidas (Allow)
    if (config.allowedPaths && config.allowedPaths.length > 0) {
      config.allowedPaths.forEach(path => {
        robotsContent += `Allow: ${path}\n`;
      });
    }

    // Rutas bloqueadas (Disallow)
    if (config.disallowedPaths && config.disallowedPaths.length > 0) {
      config.disallowedPaths.forEach(path => {
        robotsContent += `Disallow: ${path}\n`;
      });
    } else if (config.allowAll) {
      robotsContent += 'Disallow:\n'; // Permitir todo
    }

    // Crawl-delay
    if (config.crawlDelay && config.crawlDelay > 0) {
      robotsContent += `Crawl-delay: ${config.crawlDelay}\n`;
    }

    // Separador
    robotsContent += '\n';

    // Sitemap
    if (config.includeSitemap !== false) {
      if (config.sitemapUrl) {
        robotsContent += `Sitemap: ${config.sitemapUrl}\n`;
      } else {
        // Generar URL de sitemap automática
        robotsContent += `Sitemap: ${siteUrl}/sitemap.xml\n`;
      }
    }

    // Reglas específicas por tipo de sitio
    robotsContent += generateSiteSpecificRules(config.siteType, siteUrl);

    // Reglas personalizadas
    if (config.customRules && config.customRules.length > 0) {
      robotsContent += '\n# Reglas personalizadas\n';
      config.customRules.forEach(rule => {
        robotsContent += rule.trim() + '\n';
      });
    }

    // Agregar comentarios informativos
    robotsContent = addInformativeComments(robotsContent, config);

    return NextResponse.json({
      success: true,
      robotsContent: robotsContent.trim(),
      config,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generando robots.txt:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function generateSiteSpecificRules(siteType: string, siteUrl: string): string {
  let rules = '';

  switch (siteType) {
    case 'ecommerce':
      rules += '\n# Reglas específicas para E-commerce\n';
      rules += 'User-agent: *\n';
      rules += 'Disallow: /search?\n';
      rules += 'Disallow: /*?sort=\n';
      rules += 'Disallow: /*?filter=\n';
      rules += 'Allow: /products/\n';
      rules += 'Allow: /categories/\n';
      break;

    case 'blog':
      rules += '\n# Reglas específicas para Blog\n';
      rules += 'User-agent: *\n';
      rules += 'Disallow: /*?preview=\n';
      rules += 'Disallow: /tag/\n';
      rules += 'Allow: /posts/\n';
      rules += 'Allow: /articles/\n';
      break;

    case 'portfolio':
      rules += '\n# Reglas específicas para Portfolio\n';
      rules += 'User-agent: *\n';
      rules += 'Allow: /projects/\n';
      rules += 'Allow: /gallery/\n';
      rules += 'Allow: /contact/\n';
      break;

    case 'website':
    default:
      rules += '\n# Reglas generales para sitio web\n';
      rules += 'User-agent: *\n';
      rules += 'Disallow: /search\n';
      rules += 'Disallow: /*?q=\n';
      break;
  }

  return rules;
}

function addInformativeComments(content: string, config: RobotsConfig): string {
  const now = new Date();
  const header = `# Robots.txt generado automáticamente
# Sitio: ${config.siteUrl}
# Tipo: ${config.siteType}
# Generado: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}
# 
# Este archivo controla cómo los motores de búsqueda rastrean tu sitio
# Más información: https://developers.google.com/search/docs/crawling-indexing/robots/intro
#

`;

  return header + content;
}
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
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

    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenido de robots.txt requerido' },
        { status: 400 }
      );
    }

    const validation = validateRobotsContent(content);

    return NextResponse.json({
      success: true,
      validation,
      validatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error validando robots.txt:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function validateRobotsContent(content: string): ValidationResult {
  const lines = content.split('\n').map(line => line.trim());
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  let hasUserAgent = false;
  let hasSitemap = false;
  let hasDisallow = false;
  let currentUserAgent = '';
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;

    // Ignorar líneas vacías y comentarios
    if (!line || line.startsWith('#')) {
      continue;
    }

    // Validar formato básico
    if (!line.includes(':')) {
      errors.push(`Línea ${lineNumber}: Formato inválido. Debe contener ':' (${line})`);
      continue;
    }

    const [directive, ...valueParts] = line.split(':');
    const directiveLower = directive.toLowerCase().trim();
    const value = valueParts.join(':').trim();

    switch (directiveLower) {
      case 'user-agent':
        hasUserAgent = true;
        currentUserAgent = value;
        
        if (!value) {
          errors.push(`Línea ${lineNumber}: User-agent no puede estar vacío`);
        }
        
        // Verificar user-agents comunes
        if (value === '*') {
          // OK, aplica a todos los bots
        } else if (['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot'].includes(value.toLowerCase())) {
          // OK, bot específico conocido
        } else {
          warnings.push(`Línea ${lineNumber}: User-agent '${value}' no es un bot conocido`);
        }
        break;

      case 'disallow':
        hasDisallow = true;
        
        if (!hasUserAgent) {
          errors.push(`Línea ${lineNumber}: Disallow debe ir después de User-agent`);
        }
        
        // Validar rutas
        if (value && !value.startsWith('/')) {
          errors.push(`Línea ${lineNumber}: Disallow debe comenzar con '/' (${value})`);
        }
        
        // Verificar patrones comunes problemáticos
        if (value === '/') {
          warnings.push(`Línea ${lineNumber}: Disallow: / bloquea todo el sitio. ¿Es esto intencional?`);
        }
        break;

      case 'allow':
        if (!hasUserAgent) {
          errors.push(`Línea ${lineNumber}: Allow debe ir después de User-agent`);
        }
        
        if (value && !value.startsWith('/')) {
          errors.push(`Línea ${lineNumber}: Allow debe comenzar con '/' (${value})`);
        }
        break;

      case 'crawl-delay':
        if (!hasUserAgent) {
          errors.push(`Línea ${lineNumber}: Crawl-delay debe ir después de User-agent`);
        }
        
        const delay = parseFloat(value);
        if (isNaN(delay) || delay < 0) {
          errors.push(`Línea ${lineNumber}: Crawl-delay debe ser un número positivo (${value})`);
        } else if (delay > 10) {
          warnings.push(`Línea ${lineNumber}: Crawl-delay de ${delay} segundos es muy alto, puede afectar la indexación`);
        }
        break;

      case 'sitemap':
        hasSitemap = true;
        
        if (!value) {
          errors.push(`Línea ${lineNumber}: Sitemap no puede estar vacío`);
        } else if (!isValidUrl(value)) {
          errors.push(`Línea ${lineNumber}: Sitemap debe ser una URL válida (${value})`);
        } else if (!value.toLowerCase().endsWith('.xml')) {
          warnings.push(`Línea ${lineNumber}: Sitemap debería ser un archivo .xml (${value})`);
        }
        break;

      case 'host':
        warnings.push(`Línea ${lineNumber}: La directiva 'Host' está obsoleta y no es estándar`);
        break;

      default:
        warnings.push(`Línea ${lineNumber}: Directiva '${directive}' no reconocida`);
        break;
    }
  }

  // Validaciones generales
  if (!hasUserAgent) {
    errors.push('Falta la directiva User-agent requerida');
  }

  if (!hasDisallow) {
    warnings.push('No se encontraron directivas Disallow. Considera agregar al menos "Disallow:" para permitir todo');
  }

  if (!hasSitemap) {
    suggestions.push('Considera agregar una directiva Sitemap para ayudar a los motores de búsqueda a encontrar tu sitemap');
  }

  // Sugerencias adicionales
  if (content.length > 500000) {
    warnings.push('El archivo robots.txt es muy grande (>500KB). Los motores de búsqueda pueden ignorar archivos muy grandes');
  }

  // Verificar mejores prácticas
  if (!content.includes('Sitemap:')) {
    suggestions.push('Agrega la URL de tu sitemap XML para mejorar la indexación');
  }

  if (content.includes('Disallow: /admin') || content.includes('Disallow: /private')) {
    suggestions.push('Considera usar autenticación en lugar de robots.txt para proteger contenido sensible');
  }

  // Verificar patrones comunes
  const commonPatterns = ['/wp-admin', '/admin', '/private', '/temp', '/cache'];
  const foundPatterns = commonPatterns.filter(pattern => content.includes(pattern));
  
  if (foundPatterns.length === 0) {
    suggestions.push('Considera bloquear directorios administrativos comunes como /admin, /private, etc.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    suggestions
  };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
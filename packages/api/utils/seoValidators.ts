import { URL } from 'url';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validar URL
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('URL es requerida');
    return { isValid: false, errors };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Verificar protocolo
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push('URL debe usar protocolo HTTP o HTTPS');
    }

    // Verificar que tenga dominio
    if (!parsedUrl.hostname) {
      errors.push('URL debe tener un dominio válido');
    }

    // Verificar que no sea localhost en producción
    if (process.env.NODE_ENV === 'production' && 
        (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
      errors.push('No se pueden analizar URLs localhost en producción');
    }

  } catch (error) {
    errors.push('Formato de URL inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar configuración de sitemap
export interface SitemapConfig {
  url: string;
  depth?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  excludePaths?: string[];
  maxUrls?: number;
}

export const validateSitemapConfig = (config: SitemapConfig): ValidationResult => {
  const errors: string[] = [];

  // Validar URL
  const urlValidation = validateUrl(config.url);
  if (!urlValidation.isValid) {
    errors.push(...urlValidation.errors);
  }

  // Validar profundidad
  if (config.depth !== undefined) {
    if (!Number.isInteger(config.depth) || config.depth < 1 || config.depth > 20) {
      errors.push('La profundidad debe ser un número entero entre 1 y 20');
    }
  }

  // Validar maxUrls
  if (config.maxUrls !== undefined) {
    if (!Number.isInteger(config.maxUrls) || config.maxUrls < 1) {
      errors.push('El máximo de URLs debe ser un número entero mayor a 0');
    }
  }

  // Validar excludePaths
  if (config.excludePaths && Array.isArray(config.excludePaths)) {
    config.excludePaths.forEach((path, index) => {
      if (typeof path !== 'string') {
        errors.push(`Ruta de exclusión ${index + 1} debe ser una cadena de texto`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar configuración de robots.txt
export interface RobotsConfig {
  siteUrl: string;
  siteType: string;
  allowAll?: boolean;
  disallowPaths?: string[];
  allowPaths?: string[];
  crawlDelay?: number;
  sitemapUrl?: string;
  customRules?: string;
  userAgents?: string[];
}

export const validateRobotsConfig = (config: RobotsConfig): ValidationResult => {
  const errors: string[] = [];

  // Validar URL del sitio
  const urlValidation = validateUrl(config.siteUrl);
  if (!urlValidation.isValid) {
    errors.push(...urlValidation.errors.map(err => `URL del sitio: ${err}`));
  }

  // Validar tipo de sitio
  const validSiteTypes = [
    'blog', 'ecommerce', 'corporate', 'portfolio', 
    'news', 'forum', 'wiki', 'landing', 'other'
  ];
  if (!config.siteType || !validSiteTypes.includes(config.siteType)) {
    errors.push(`Tipo de sitio debe ser uno de: ${validSiteTypes.join(', ')}`);
  }

  // Validar crawl delay
  if (config.crawlDelay !== undefined) {
    if (!Number.isInteger(config.crawlDelay) || config.crawlDelay < 0 || config.crawlDelay > 86400) {
      errors.push('El retraso de crawling debe ser un número entero entre 0 y 86400 segundos');
    }
  }

  // Validar URL del sitemap
  if (config.sitemapUrl) {
    const sitemapValidation = validateUrl(config.sitemapUrl);
    if (!sitemapValidation.isValid) {
      errors.push(...sitemapValidation.errors.map(err => `URL del sitemap: ${err}`));
    }
  }

  // Validar rutas
  if (config.disallowPaths && Array.isArray(config.disallowPaths)) {
    config.disallowPaths.forEach((path, index) => {
      if (typeof path !== 'string') {
        errors.push(`Ruta bloqueada ${index + 1} debe ser una cadena de texto`);
      } else if (!path.startsWith('/')) {
        errors.push(`Ruta bloqueada ${index + 1} debe comenzar con /`);
      }
    });
  }

  if (config.allowPaths && Array.isArray(config.allowPaths)) {
    config.allowPaths.forEach((path, index) => {
      if (typeof path !== 'string') {
        errors.push(`Ruta permitida ${index + 1} debe ser una cadena de texto`);
      } else if (!path.startsWith('/')) {
        errors.push(`Ruta permitida ${index + 1} debe comenzar con /`);
      }
    });
  }

  // Validar user agents
  if (config.userAgents && Array.isArray(config.userAgents)) {
    config.userAgents.forEach((agent, index) => {
      if (typeof agent !== 'string' || agent.trim().length === 0) {
        errors.push(`User agent ${index + 1} debe ser una cadena de texto no vacía`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar formato de exportación
export const validateExportFormat = (format: string, allowedFormats: string[]): ValidationResult => {
  const errors: string[] = [];

  if (!format || typeof format !== 'string') {
    errors.push('Formato de exportación es requerido');
    return { isValid: false, errors };
  }

  if (!allowedFormats.includes(format.toLowerCase())) {
    errors.push(`Formato '${format}' no permitido. Formatos disponibles: ${allowedFormats.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar límites del plan
export const validatePlanLimits = (
  userPlan: string, 
  requestedDepth: number, 
  planLimits: any
): ValidationResult => {
  const errors: string[] = [];

  if (planLimits.maxDepth !== -1 && requestedDepth > planLimits.maxDepth) {
    errors.push(
      `Tu plan ${userPlan} permite máximo ${planLimits.maxDepth} niveles de profundidad. ` +
      `Solicitaste ${requestedDepth} niveles.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitizar URL
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // Remover fragmentos y normalizar
    parsedUrl.hash = '';
    return parsedUrl.toString().replace(/\/$/, ''); // Remover slash final
  } catch {
    return url;
  }
};

// Generar User-Agent para crawling
export const generateUserAgent = (): string => {
  return 'Mozilla/5.0 (compatible; YATools-SEO-Bot/1.0; +https://yatools.com/bot)';
};